import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import { createApp } from '../src/app'
import { connectDatabase, disconnectDatabase } from '../src/config/database'
import { User } from '../src/models/User'
import { Interview } from '../src/models/Interview'
import { Question } from '../src/models/Question'

const app = createApp()

const testEmail = (suffix: string) =>
  `test-interview-${suffix}-${Date.now()}@example.com`

async function createTestUser(suffix: string) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Interview Test User',
      email: testEmail(suffix),
      password: 'Password123!',
    })

  return {
    user: response.body.data.user,
    cookies: response.headers['set-cookie'] as string[],
  }
}

async function createTestInterview(userId: string) {
  return Interview.create({
    userId,
    role: 'Frontend Developer',
    interviewType: 'Technical',
    difficulty: 'medium',
    questionCount: 2,
    status: 'CREATED',
  })
}

async function createTestQuestion(
  interviewId: mongoose.Types.ObjectId,
  order: number,
) {
  return Question.create({
    interviewId,
    questionText: `Test question ${order}`,
    category: 'Technical',
    topic: 'React',
    difficulty: 'medium',
    order,
    expectedTopics: ['React', 'JavaScript'],
  })
}

describe('Interview API', () => {
  beforeAll(async () => {
    await connectDatabase()
  })

  afterEach(async () => {
    await Question.deleteMany({
      questionText: /^Test question/,
    })

    await Interview.deleteMany({
      role: 'Frontend Developer',
    })

    await User.deleteMany({
      email: { $regex: /^test-interview-/ },
    })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it('rejects interview access without authentication', async () => {
    const response = await request(app).get('/api/interviews')

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })

  it('lists only the authenticated user interviews', async () => {
    const first = await createTestUser('list-one')
    const second = await createTestUser('list-two')

    await createTestInterview(first.user.id)
    await createTestInterview(second.user.id)

    const response = await request(app)
      .get('/api/interviews')
      .set('Cookie', first.cookies)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.interviews).toHaveLength(1)
    expect(response.body.data.interviews[0].userId).toBe(first.user.id)
  })

  it('retrieves an owned interview', async () => {
    const { user, cookies } = await createTestUser('get-owned')
    const interview = await createTestInterview(user.id)

    const response = await request(app)
      .get(`/api/interviews/${interview._id}`)
      .set('Cookie', cookies)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.interview.id).toBe(interview._id.toString())
  })

  it('returns 404 when accessing another user interview', async () => {
    const owner = await createTestUser('owner')
    const otherUser = await createTestUser('other')

    const interview = await createTestInterview(owner.user.id)

    const response = await request(app)
      .get(`/api/interviews/${interview._id}`)
      .set('Cookie', otherUser.cookies)

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
  })

  it('returns 404 for an invalid interview id', async () => {
    const { cookies } = await createTestUser('invalid-id')

    const response = await request(app)
      .get('/api/interviews/not-a-valid-id')
      .set('Cookie', cookies)

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
  })

  it('returns questions for an owned interview', async () => {
    const { user, cookies } = await createTestUser('questions')
    const interview = await createTestInterview(user.id)

    await createTestQuestion(interview._id, 1)
    await createTestQuestion(interview._id, 2)

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/questions`)
      .set('Cookie', cookies)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.questions).toHaveLength(2)
    expect(response.body.data.questions[0].bookmarked).toBe(false)
    expect(response.body.data.questions[0].questionText).toBe('Test question 1')
  })

  it('does not return questions from another user interview', async () => {
    const owner = await createTestUser('question-owner')
    const otherUser = await createTestUser('question-other')

    const interview = await createTestInterview(owner.user.id)
    await createTestQuestion(interview._id, 1)

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/questions`)
      .set('Cookie', otherUser.cookies)

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
  })

  it('rejects invalid answer payload', async () => {
    const { user, cookies } = await createTestUser('invalid-answer')
    const interview = await createTestInterview(user.id)

    const response = await request(app)
      .post(`/api/interviews/${interview._id}/answers`)
      .set('Cookie', cookies)
      .send({
        answerText: '',
      })

    expect(response.status).toBe(422)
    expect(response.body.success).toBe(false)
  })

  it('rejects report access for another user interview', async () => {
    const owner = await createTestUser('report-owner')
    const otherUser = await createTestUser('report-other')

    const interview = await createTestInterview(owner.user.id)

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/report`)
      .set('Cookie', otherUser.cookies)

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
  })

  it('updates only the allowed resumeId field', async () => {
    const { user, cookies } = await createTestUser('update')
    const interview = await createTestInterview(user.id)

    const response = await request(app)
      .put(`/api/interviews/${interview._id}`)
      .set('Cookie', cookies)
      .send({
        resumeId: 'resume-test-123',
        status: 'COMPLETED',
        overallScore: 99,
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.interview.resumeId).toBe('resume-test-123')
    expect(response.body.data.interview.status).toBe('CREATED')
    expect(response.body.data.interview.overallScore).toBeUndefined()
  })
})