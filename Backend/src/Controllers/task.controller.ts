import { ApiResponse } from "../Utils/ApiResponse.js"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import type { Request, Response } from "express"
import pool from "../DB/DB_Connection.js"
import type{ TaskState } from "../Interfaces/interfaces.js"

function requireAuth(userId?: number, role?: string) {
  if (!userId || !role) {
    throw new ApiError(401, "Unauthorized Access")
  }
}

const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
    const role = req.role
    const userId = req.userId

    requireAuth(userId, role)

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

    if (role !== "Manager") {
      throw new ApiError(403, "Only managers can create tasks")
    }

    if(!([name, instruction, assigned_to].every(Boolean))){
      throw new ApiError(400, "All fields are mandatory")
    }

    requireAuth(userId, role)

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

    requireAuth(userId, role)

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

    requireAuth(userId, role)

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
    const taskId : number = Number(req.params.taskId)
    const userId = req.userId
    const role = req.role

    requireAuth(userId, role)

    if(!taskId){
      throw new ApiError(400, "Invalid Task id")
    }

    const taskList = await pool.query(`Select * from tasks where id = $1 
      AND (assigned_to = $2 OR created_by = $2) AND is_deleted = false`, [taskId, userId])

    if(taskList.rowCount === 0) throw new ApiError(404, "Task Not Found")

    const task = taskList.rows[0];

    res.status(200)
    .json(new ApiResponse(200, task, "Task Fetched"))
})

const editTask = asyncHandler(async (req: Request, res: Response) => {
    
  const userId = req.userId
  const role = req.role
  const taskId = Number(req.params.taskId)

  if(!taskId){
    throw new ApiError(400, "Invalid Task Id")
  }

  requireAuth(userId, role)

  const taskList = await pool.query(`Select * from tasks where id = $1 
    AND (assigned_to = $2 OR created_by = $2)
    AND is_deleted = false`,
    [taskId, userId]
  )

  if(taskList.rowCount === 0) throw new ApiError(404, "Task Not Found")
  const task = taskList.rows[0]

  if(["ACCEPTED"].includes(task.state) ){
    throw new ApiError(403, "Cannot edit task in Accepted state")
  }

  const editOptions: Record<string, string> = {}
  const { name, content, instruction } = req.body

  if(role === "Manager" && typeof name === "string" && name.length > 0){
    editOptions.name = name
  }

  if(role === "Manager" && typeof instruction === "string" && instruction.length > 0){
    editOptions.instruction = instruction
  }



  if(role === "Manager" && typeof content === "string" &&content.length > 0){
    editOptions.content = content
  }

  if(role === "Developer"&& typeof content === "string" && content.length > 0 && task.state === "ONGOING"){
    editOptions.content = content
  }

  if(Object.keys(editOptions).length === 0){
    throw new ApiError(400, "No valid fields to update")

  }

  const keys = Object.keys(editOptions)
  const values = Object.values(editOptions)

  const setValues = keys.map((value, idx) => {
    return `${value} = $${idx + 1}`
  }).join(", ")

  const updatedContent = await pool.query(`
      Update tasks set ${setValues}
      where id = $${keys.length + 1} AND is_deleted = false AND 
      (assigned_to = $${keys.length + 2} OR created_by = $${keys.length + 2}) 
      RETURNING id, content, instruction, state
    `, [...values, taskId, userId])

  if(updatedContent.rowCount === 0){
    throw new ApiError(409, "Something went wrong while updating")
  }

  const updatedTask = updatedContent.rows[0]

  const comment: string | null = req.body?.comment ?? null

  await pool.query(`Insert into history
    (task_id, from_state, to_state, actor_id, actor_role, comment)
    values($1, $2, $3, $4, $5, $6)`,
  [taskId, task.state, task.state, userId, role, comment])

  res.status(200)
  .json(new ApiResponse(200, updatedTask, "Task Updated"))
})



const submitTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  const role = req.role
  const comment: string | null = req.body?.comment ?? null
  const taskId = Number(req.params?.taskId)

  if(!taskId) throw new ApiError(400, "Invalid Task Id")
  requireAuth(userId, role)

    if (role !== "Developer") {
    throw new ApiError(403, "Only developers can submit tasks")
  }


  const taskDetails = await pool.query(`
    Update tasks set state = 'REVIEW' where  id = $1
    AND state = 'ONGOING' AND assigned_to = $2 AND is_deleted = false RETURNING id, state
    `, [taskId, userId])

  if(taskDetails.rowCount === 0) throw new ApiError(409, "Task Conflict")

  const task = taskDetails.rows[0]

  await pool.query(`Insert into history
    (task_id, from_state, to_state, actor_id, actor_role, comment)
    values($1, $2, $3, $4, $5, $6)`,
  [taskId, "ONGOING", task.state, userId, role, comment])

  res.status(200)
  .json(new ApiResponse(200, task, "Task Sent to Review"))

})

const reviewTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  const role = req.role
  const comment: string | null = req.body?.comment ?? null
  const taskId = Number(req.params?.taskId)
  const state: TaskState = req.body?.state

  if(state !== "ACCEPTED" && state !== "ONGOING"){
    throw new ApiError(400, "Invalid State")
  }

  if(!taskId) throw new ApiError(400, "Invalid Task Id")
  requireAuth(userId, role)

    if (role !== "Manager") {
    throw new ApiError(403, "Only managers can review tasks")
  }


  const taskDetails = await pool.query(`
    Update tasks set state = $1 where  id = $2
    AND state = 'REVIEW' AND created_by = $3 AND is_deleted = false RETURNING id, state
    `, [state, taskId, userId])

  if(taskDetails.rowCount === 0) throw new ApiError(409, "Task Conflict")

  const task = taskDetails.rows[0]

  await pool.query(`Insert into history
    (task_id, from_state, to_state, actor_id, actor_role, comment)
    values($1, $2, $3, $4, $5, $6)`,
  [taskId, "REVIEW", state, userId, role, comment])

  res.status(200)
  .json(new ApiResponse(200, task, "Task Reviewed"))

})

    const getAllHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  const role = req.role

  requireAuth(userId, role)

  const historyDetails = await pool.query(
    `
    SELECT h.*
    FROM history h
    JOIN tasks t ON h.task_id = t.id
    WHERE t.is_deleted = false
      AND (t.assigned_to = $1 OR t.created_by = $1)
    ORDER BY h.created_at DESC
    `,
    [userId]
  )

  res.status(200).json(
    new ApiResponse(200, historyDetails.rows, "History fetched")
  )
})



const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId)
  const userId = req.userId
  const role = req.role

  requireAuth(userId, role)

  if (!taskId) {
    throw new ApiError(400, "Invalid Task ID")
  }

  const historyDetails = await pool.query(
    `
    SELECT h.*
    FROM history h
    JOIN tasks t ON h.task_id = t.id
    WHERE h.task_id = $1
      AND t.is_deleted = false
      AND (t.assigned_to = $2 OR t.created_by = $2)
    ORDER BY h.created_at DESC
    `,
    [taskId, userId]
  )

  res.status(200).json(
    new ApiResponse(200, historyDetails.rows, "History fetched")
  )
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
