import jwt from "jsonwebtoken"
import { ApiError } from "../Utils/ApiError.js"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ACCESS_TOKEN_SECRET } from "../config/env.js"
import type { JwtPayload } from "jsonwebtoken"


export const verifyJWT = asyncHandler(async(req, res, next) => {
    
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
        }
        try{
            const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as JwtPayload

            const { userId, role } = decodedToken as JwtPayload & {
                userId: number
                role: string
            }
            req.userId = userId
            req.role = role

            next()
        }
    
        catch (error) {
        if(error instanceof jwt.TokenExpiredError){
            throw new ApiError(401, "Token Expired")
        }
        else{
            throw new ApiError(401, "Unauthorized Request")
        }
    }
    
    } 
)