import { ApiResponse } from "../Utils/ApiResponse.js"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import type { Request, Response } from "express"

const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(200)
    .json(new ApiResponse(200, "All good"))
})

const createTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const getTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const editTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const startTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const submitTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const reviewTask = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const getAllHistory = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

const getHistory = asyncHandler(async (req: Request, res: Response) => {
  // intentionally empty
})

export {
  getAllTasks,
  createTask,
  deleteTask,
  getTask,
  editTask,
  startTask,
  submitTask,
  reviewTask,
  getAllHistory,
  getHistory
}
