import dotenv from 'dotenv'
dotenv.config()

/**
 * Single source of truth for environment variables. Fails fast at startup
 * if anything required is missing — better than a confusing runtime error
 * three requests later.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
   // Phase 10H: shared secret sent as X-Internal-Key on every Node -> FastAPI
  // request. Required (not optional/defaulted) since a missing value here
  // would otherwise silently send no header and get a confusing 401 from
  // FastAPI instead of a clear startup error.
  AI_INTERNAL_KEY: required('AI_INTERNAL_KEY'),
  isProduction: process.env.NODE_ENV === 'production',
}
