import type { Request, Response } from "express"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import pool from "../DB/DB_Connection.js"
import redis from "../DB/redis.js"

const TEAM_CACHE_TTL_SECONDS = 600

function getTeamCacheKey(managerId: number) {
  return `team:manager:${managerId}`
}

function getDevelopersCacheKey(managerId: number) {
  return `developers:manager:${managerId}`
}

function requireAuth(userId?: number, role?: string) {
  if (!Number.isInteger(userId) || !role) {
    throw new ApiError(401, "Unauthorized Access")
  }
}

export const getTeamMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId
    const role = req.role

    requireAuth(userId, role)

    if (role !== "Manager") {
      throw new ApiError(403, "Only managers can access team")
    }

    const managerId = userId as number
    const cacheKey = getTeamCacheKey(managerId)
    const cachedTeam = await redis.get(cacheKey)

    if (cachedTeam) {
      return res.status(200).json(
        new ApiResponse(
          200,
          JSON.parse(cachedTeam),
          "Team fetched successfully"
        )
      )
    }

    const teamMembersResult = await pool.query(
      `SELECT * from users where id IN (
      SELECT developer_id FROM team WHERE manager_id = $1)`,
      [managerId]
    )



    const team = teamMembersResult.rows

    await redis.set(cacheKey, JSON.stringify(team), {
      EX: TEAM_CACHE_TTL_SECONDS,
    })

return res.status(200).json(
  new ApiResponse(
    200,
    team,
    team.length === 0
      ? "No team members assigned yet"
      : "Team fetched successfully"
  )
)

  }
)

export const getDevelopers = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId
    const role = req.role

    requireAuth(userId, role)

    if (role !== "Manager") {
      throw new ApiError(403, "Only managers can access developers list")
    }

    const managerId = userId as number
    const cacheKey = getDevelopersCacheKey(managerId)
    const cachedDevelopers = await redis.get(cacheKey)

    if (cachedDevelopers) {
      return res.status(200).json(
        new ApiResponse(
          200,
          JSON.parse(cachedDevelopers),
          "Developers fetched successfully"
        )
      )
    }

    const developersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone,
        CASE WHEN t.manager_id = $1 THEN true ELSE false END AS is_in_team
       FROM users u
       LEFT JOIN team t ON t.developer_id = u.id
       WHERE u.role = 'Developer'
       ORDER BY u.id ASC`,
      [managerId]
    )

    await redis.set(cacheKey, JSON.stringify(developersResult.rows), {
      EX: TEAM_CACHE_TTL_SECONDS,
    })

    return res.status(200).json(
      new ApiResponse(200, developersResult.rows, "Developers fetched successfully")
    )
  }
)

export { getTeamCacheKey, getDevelopersCacheKey, TEAM_CACHE_TTL_SECONDS }
