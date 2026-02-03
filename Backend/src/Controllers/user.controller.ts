import type { Request, Response } from "express"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env.js"
import pool from "../DB/DB_Connection.js"
import type { AccessTokenPayload, RefreshTokenPayload } from "../Interfaces/interfaces.js"
import type { Secret } from "jsonwebtoken"
import { hashPassword, checkPassword } from "../Utils/PasswordHandler.js"
import { appendFile } from "node:fs"

const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY ?? "15m"
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY ?? "7d"

function generateAccessAndRefreshToken(userId: number, role: "Developer" | "Manager") 
:{newAccessToken: string, newRefreshToken: string}
{

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
    const {name, password, email, phone, role} = req.body

    if (![name, password, email, phone, role].every(Boolean)) {
      throw new ApiError(400, "All fields are required")
    }

    const findUser = await pool.query("Select 1 from users where email = $1 OR phone = $2",
    [email, phone]
    )

    if(findUser.rowCount !== 0){
      throw new ApiError(409, "User already exists")
    }
    
    const hashedPassword = await hashPassword(password)
    await pool.query("Insert into users(name, password, email, phone, role) values ($1, $2, $3, $4, $5)",
      [name, hashedPassword, email, phone, role]
    )

    res.status(201)
    .json(new ApiResponse(201, "User created"))

})

const handleLogin = asyncHandler(async (req: Request, res: Response) => {
  const {email, password} = req.body

  if(!email || !password){
    throw new ApiError(400, "Both email and password are necessary")
  }

  const findUser = await pool.query("Select id, password, role from users where email = $1", [email])

  if(findUser.rowCount === 0){
    throw new ApiError(401, "Invalid Credentials")
  }

  const user = findUser.rows[0]

  const isMatch = await checkPassword(password, user.password)

  if(!isMatch){
    throw new ApiError(401, "Invalid Credentials")
  }

  const {newAccessToken, newRefreshToken} = generateAccessAndRefreshToken(user.id, user.role)

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true
  })
  
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true
  })

   await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [newRefreshToken, user.id]
  )

  res.status(200)
  .json(new ApiResponse(200, "Successful Login"))

})

const handleLogout = asyncHandler(async (req: Request, res: Response) => {
  const userId =  req.userId

  if(!userId){
    throw new ApiError(401, "Unauthorized Request")
  }

  await pool.query("Update users set refresh_token = NULL where id = $1", [ userId])

  res.clearCookie("accessToken",{
    httpOnly: true
  })
  res.clearCookie("refreshToken",{
    httpOnly: true
  })
  
  res.status(200)
  .json(new ApiResponse(200, "Logged Out Successfully"))
})

const getDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId

    if(!userId){
      throw new ApiError(401, "Unauthorized Request")
    }

    const user = await pool.query("Select name, email, phone, role from users where id = $1",
      [userId]
    )

    if(user.rowCount === 0){
      throw new ApiError(404, 'User not found')
    }

    const userData = user.rows[0]

    res.status(200)
    .json(new ApiResponse(200, userData))
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
      REFRESH_TOKEN_SECRET as Secret
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

const makeTeam = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId
    const role = req.role

    const developerId = Number(req.params.developerId)


    if(!userId || !role){
      throw new ApiError(401, "Unauthorized Request")
    }

    if(role === "Developer"){
      throw new ApiError(403, "Forbidden Request")
    }

    if(!developerId){
      throw new ApiError(400, "Bad Request")
    }

    const employeeDetail = await pool.query(`Select * from users 
              where id = $1 and role = 'Developer'`, [developerId])

    if(employeeDetail.rowCount === 0){
      throw new ApiError(404, "User not found")
    }

    const employeeTeam = await pool.query(`Select * from team where developer_id = $1`,
      [developerId]
    )

    if(employeeTeam.rowCount === 0){
      await pool.query(`Insert into team(manager_id, developer_id) values ($1, $2)`,
        [userId, developerId]
      )
    }
    else{
      await pool.query(`Update team set manager_id = $1 where developer_id = $2`,
        [userId, developerId]
      )
    }

    res.status(200)
    .json(new ApiResponse(200, "Team Updated"))
})


export {
  handleRegister,
  handleLogin,
  handleLogout,
  getDetails,
  refreshAllTokens,
  makeTeam
}
