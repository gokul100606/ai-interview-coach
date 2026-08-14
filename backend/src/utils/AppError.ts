/**
 * Operational errors (bad input, not found, unauthorized, etc.) — thrown
 * deliberately from controllers/services and caught by the central error
 * middleware. Distinct from unexpected bugs, which get a generic 500.
 */
export class AppError extends Error {
  statusCode: number
  isOperational = true
  errors?: unknown

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message = 'Bad request', errors?: unknown) {
    return new AppError(message, 400, errors)
  }
  static unauthorized(message = 'Not authenticated') {
    return new AppError(message, 401)
  }
  static forbidden(message = 'Not authorized to perform this action') {
    return new AppError(message, 403)
  }
  static notFound(message = 'Resource not found') {
    return new AppError(message, 404)
  }
  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409)
  }
  static validation(message = 'Validation failed', errors?: unknown) {
    return new AppError(message, 422, errors)
  }
}
