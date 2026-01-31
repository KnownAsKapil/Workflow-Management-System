import type { JwtPayload } from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      userId?: number        // or number, depending on your userId
      role?: string
      tokenPayload?: JwtPayload
    }
  }
}

export {}
