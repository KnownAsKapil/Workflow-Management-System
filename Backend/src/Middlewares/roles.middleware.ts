import { ApiError } from "../Utils/ApiError.js"
import { asyncHandler } from "../Utils/asyncHandler.js"

export const allowRoles = (...allowedRoles: string[]) =>
  asyncHandler((req, _res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      throw new ApiError(403, "Forbidden")
    }
    next()
  })
