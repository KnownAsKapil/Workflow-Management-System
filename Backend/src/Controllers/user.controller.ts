import type { Request, Response } from "express"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import { ApiResponse } from "../Utils/ApiResponse.js"

const handleRegister = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const handleLogin = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const handleLogout = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const getDetails = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const refreshAllTokens = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

export {
  handleRegister,
  handleLogin,
  handleLogout,
  getDetails,
  refreshAllTokens
}
