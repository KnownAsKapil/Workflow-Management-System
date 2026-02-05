import type { JwtPayload } from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      userId?: number       
      role?: string
      tokenPayload?: JwtPayload
    }
  }
}

export {}
