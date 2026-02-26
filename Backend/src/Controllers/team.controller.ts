import type { Request, Response } from "express"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import pool from "../DB/DB_Connection.js"

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

    const teamMembersResult = await pool.query(
      `SELECT * from users where id IN (
      SELECT developer_id FROM team WHERE manager_id = $1)`,
      [userId]
    )



    const team = teamMembersResult.rows

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

    const developersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone,
        CASE WHEN t.manager_id = $1 THEN true ELSE false END AS is_in_team
       FROM users u
       LEFT JOIN team t ON t.developer_id = u.id
       WHERE u.role = 'Developer'
       ORDER BY u.id ASC`,
      [userId]
    )

    return res.status(200).json(
      new ApiResponse(200, developersResult.rows, "Developers fetched successfully")
    )
  }
)
