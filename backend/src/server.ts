import { createApp } from './app'
import { env } from './config/env'
import { connectDatabase, disconnectDatabase } from './config/database'

async function start() {
  await connectDatabase()

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`)
  })

  // Graceful shutdown: stop accepting new connections, close the DB, then exit.
  const shutdown = async (signal: string) => {
    console.log(`[server] received ${signal}, shutting down gracefully…`)
    server.close(async () => {
      await disconnectDatabase()
      console.log('[server] shutdown complete')
      process.exit(0)
    })
    // Force-exit if close hangs for too long.
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandled rejection:', reason)
  })
}

start()
