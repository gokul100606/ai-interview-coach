import mongoose from 'mongoose'
import { env } from './env'

mongoose.set('strictQuery', true)

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully')
  })
  mongoose.connection.on('error', (err: Error) => {
    console.error('MongoDB connection error:', err.message)
  })
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected')
  })

  try {
    await mongoose.connect(env.MONGODB_URI)
  } catch (err) {
    console.error('MongoDB connection failed:', (err as Error).message)
    console.error('Check that MONGODB_URI in backend/.env is correct and MongoDB is running/reachable.')
    // Fail fast — the API is useless without a database.
    process.exit(1)
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close()
}
