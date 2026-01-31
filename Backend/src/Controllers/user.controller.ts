import type { Request, Response } from "express"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env.js"
import pool from "../DB/DB_Connection.js"
import type { AccessTokenPayload, RefreshTokenPayload } from "../Interfaces/interfaces.js"
import type { Secret, SignOptions } from "jsonwebtoken"

const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY ?? "15m"
const refreshTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY ?? "15m"

function generateAccessAndRefreshToken(userId: number, role: "Developer" | "Manager"){

      const accessPayload: AccessTokenPayload = {
        userId: userId,
        role: role
      }

      const refreshPayload: RefreshTokenPayload = {
        userId: userId,
      }
      const newAccessToken = jwt.sign(
        
        accessPayload,
      ACCESS_TOKEN_SECRET as Secret,
      {
        expiresIn: accessTokenExpiry as any
      }
    )
    
    const newRefreshToken = jwt.sign(
      refreshPayload,
      REFRESH_TOKEN_SECRET as Secret,
      {
        expiresIn: refreshTokenExpiry as any
      }
    )

    return {newAccessToken, newRefreshToken}

}

const handleRegister = asyncHandler(async (req: Request, res: Response) => {
    
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
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized")
  }

  let decodedToken: JwtPayload & { userId: number }

  try {
    decodedToken = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET as string
    ) as JwtPayload & { userId: number }
  } catch {
    throw new ApiError(401, "Refresh token expired or invalid")
  }

  const { userId } = decodedToken

  const result = await pool.query(
    "SELECT role FROM users WHERE id = $1 AND refresh_token = $2",
    [userId, refreshToken]
  )

  if (result.rowCount === 0) {
    throw new ApiError(401, "Unauthorized")
  }

  const { role } = result.rows[0]

  const { newAccessToken, newRefreshToken } = 
    generateAccessAndRefreshToken(userId, role)

  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [newRefreshToken, userId]
  )

  res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
    })
    .status(200)
    .json(new ApiResponse(200, "Tokens refreshed"))
})


export {
  handleRegister,
  handleLogin,
  handleLogout,
  getDetails,
  refreshAllTokens
}
