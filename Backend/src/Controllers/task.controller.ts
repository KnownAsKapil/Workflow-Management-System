import { ApiResponse } from "../Utils/ApiResponse.js"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import type { Request, Response } from "express"
import pool from "../DB/DB_Connection.js"
import type{ TaskState } from "../Interfaces/interfaces.js"

const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
    const role = req.role
    const userId = req.userId

    

    if(!role || !userId){
      throw new ApiError(401, "Unauthorized Access")
    }

    if(role === "Manager"){
      const tasks = await pool.query(
        `
        SELECT t.* from tasks t JOIN team tm ON 
        t.assigned_to = tm.employee_id where tm.manager_id = $1 AND t.is_deleted = false`,
        [userId]
      )

      return res.status(200)
      .json(new ApiResponse(200, tasks.rows, "Data fetched"))

    }
    else{
      const tasks = await pool.query(`
        Select * from tasks where assigned_to = $1 And is_deleted= false
        `, [userId])

      return res.status(200)
      .json(new ApiResponse(200, tasks.rows, "Data fetched"))
    }
})

const createTask = asyncHandler(async (req: Request, res: Response) => {
    const {name, instruction, assigned_to} = req.body
    const state: TaskState = "ASSIGNED"
    const userId = req.userId;
    const role = req.role
    const comment: string | null = req.body?.comment ?? null


    if(!([name, instruction, assigned_to].every(Boolean))){
      throw new ApiError(400, "All fields are mandatory")
    }

    if(!userId || !role){
      throw new ApiError(401, "Unauthorized Access")
    }

    const createdTask = await 
    pool.query(`Insert into tasks (name, instruction, assigned_to, created_by, state)
      values ($1, $2, $3, $4, $5) RETURNING  id, state`, 
      [name, instruction, assigned_to, userId, state])

    if(createdTask.rowCount === 0){
      throw new ApiError(400, "Task Creation failed")
    }

    const task = createdTask.rows[0]
    
    await pool.query(`
      Insert into history(task_id, from_state, to_state, actor_id, actor_role, 
      comment) values($1, $2, $3, $4, $5, $6)`,
    [task.id, null, task.state, userId, role, comment])

    res.status(201)
    .json(new ApiResponse(201, "Task Created"))
})

const startTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId
    const taskId = Number(req.params.taskId)
    const role = req.role
    const comment: string | null = req.body?.comment ?? null

    if(!taskId){
      throw new ApiError(400, "Invalid Task Id")
    }

    if(!userId || !role){
      throw new ApiError(401, 'Unauthorized Access')
    }

    const taskDetails = await pool.query("Select state from tasks where id = $1 and assigned_to = $2 AND is_deleted = false", 
      [taskId, userId])

    if(taskDetails.rowCount === 0){
      throw new ApiError(404, 'Task Not Found')
    }

    const task = taskDetails.rows[0]
    if(task.state !== "ASSIGNED"){
      throw new ApiError(409, "Task is not in Assigned State")
    }
    
    const newState: TaskState = "ONGOING"
    
    const newTaskDetails = 
    await pool.query(`UPDATE tasks
                SET state = $1
                WHERE id = $2
                  AND assigned_to = $3
                  AND is_deleted = false
                RETURNING id, state
                `, 
      [newState, taskId, userId])

      if (newTaskDetails.rowCount === 0) {
        throw new ApiError(409, "Task state changed, retry")
      }


    const newTask = newTaskDetails.rows[0]

    await pool.query(`
      Insert into history(task_id, from_state, to_state, actor_id, actor_role, 
      comment) values($1, $2, $3, $4, $5, $6)`,
    [newTask.id, task.state, newTask.state, userId, role, comment])

    res.status(200)
    .json(new ApiResponse(200, newTask, "Task Updated to ongoing"))
})

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId
    const taskId = Number(req.params.taskId)
    const role = req.role
    const comment: string | null = req.body?.comment ?? null

    if(!userId || !role){
      throw new ApiError(401, "Unauthorized Access")
    }

    if(!taskId){
      throw new ApiError(400, "Invalid Task id")
    }

    const taskDetails = 
      await pool.query(`Update tasks set is_deleted = $1 
      where id = $2 AND created_by = $3  AND is_deleted = false
      RETURNING id, created_by, assigned_to, 
      state, is_deleted, updated_at`
    ,[true, taskId, userId])

    if(taskDetails.rowCount === 0){
      throw new ApiError(404, "Task Not Found")
    }

    const task = taskDetails.rows[0]

    await pool.query(`
      Insert into history(task_id, from_state, to_state, actor_id, actor_role, 
      comment) values($1, $2, $3, $4, $5, $6)`,
    [task.id, task.state, task.state, userId, role, comment])

    res.status(200)
    .json(new ApiResponse(200, task, "Deleted Task"))
})

const getTask = asyncHandler(async (req: Request, res: Response) => {
  
})

const editTask = asyncHandler(async (req: Request, res: Response) => {
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
