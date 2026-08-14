import type { Response } from 'express'

/** Keeps every success response in the same shape across the whole API. */
export function sendSuccess(res: Response, statusCode: number, message: string, data?: unknown) {
  return res.status(statusCode).json({ success: true, message, ...(data !== undefined ? { data } : {}) })
}
