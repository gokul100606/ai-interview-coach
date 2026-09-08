import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import { createApp } from '../src/app'
import { connectDatabase, disconnectDatabase } from '../src/config/database'
import { User } from '../src/models/User'

const app = createApp()

const testEmail = (suffix: string) =>
  `test-auth-${suffix}-${Date.now()}@example.com`

describe('Authentication API', () => {
  beforeAll(async () => {
    await connectDatabase()
  })

  afterEach(async () => {
    await User.deleteMany({
      email: { $regex: /^test-auth-/ },
    })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it('registers a new user', async () => {
    const email = testEmail('register')

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email,
        password: 'Password123!',
      })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.email).toBe(email)
    expect(response.body.data.user.name).toBe('Test User')
    expect(response.body.data.user.passwordHash).toBeUndefined()

    const cookie = response.headers['set-cookie']
    expect(cookie).toBeDefined()
    expect(cookie.join(';')).toContain('token=')
    expect(cookie.join(';')).toContain('HttpOnly')
  })

  it('rejects duplicate email during registration', async () => {
    const email = testEmail('duplicate')

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email,
        password: 'Password123!',
      })

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email,
        password: 'Password123!',
      })

    expect(response.status).toBe(409)
    expect(response.body.success).toBe(false)
  })

  it('rejects an invalid email during registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
      })

    expect(response.status).toBe(422)
    expect(response.body.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: testEmail('short-password'),
        password: '1234567',
      })

    expect(response.status).toBe(422)
    expect(response.body.success).toBe(false)
  })

  it('logs in with valid credentials', async () => {
    const email = testEmail('login')

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email,
        password: 'Password123!',
      })

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'Password123!',
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.email).toBe(email)
    expect(response.body.data.user.passwordHash).toBeUndefined()

    const cookie = response.headers['set-cookie']
    expect(cookie).toBeDefined()
    expect(cookie.join(';')).toContain('token=')
    expect(cookie.join(';')).toContain('HttpOnly')
  })

  it('rejects login with an incorrect password', async () => {
    const email = testEmail('wrong-password')

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email,
        password: 'Password123!',
      })

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'WrongPassword123!',
      })

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })

  it('rejects /me without authentication', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })

  it('returns the current user with a valid authentication cookie', async () => {
    const email = testEmail('me')

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Me User',
        email,
        password: 'Password123!',
      })

    const cookies = registerResponse.headers['set-cookie']

    expect(cookies).toBeDefined()

    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.email).toBe(email)
    expect(response.body.data.user.name).toBe('Me User')
    expect(response.body.data.user.passwordHash).toBeUndefined()
  })

  it('logs out successfully', async () => {
    const response = await request(app).post('/api/auth/logout')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    const cookie = response.headers['set-cookie']
    expect(cookie).toBeDefined()
    expect(cookie.join(';')).toContain('token=')
  })

  it('stores a hashed password instead of the plain password', async () => {
    const email = testEmail('hashed-password')

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hash User',
        email,
        password: 'Password123!',
      })

    const user = await User.findOne({ email }).select('+passwordHash')

    expect(user).not.toBeNull()
    expect(user?.passwordHash).toBeDefined()
    expect(user?.passwordHash).not.toBe('Password123!')
  })
})
