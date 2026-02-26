import { ApiResponse } from "../Utils/ApiResponse.js"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import type { Request, Response } from "express"
import pool from "../DB/DB_Connection.js"
import type{ TaskState } from "../Interfaces/interfaces.js"

function requireAuth(userId?: number, role?: string) {
  if (!Number.isInteger(userId) || !role) {
    throw new ApiError(401, "Unauthorized access");
  }
}


const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const role = req.role;
  const userId = req.userId;
  const state = req.query.state as TaskState | undefined;

  requireAuth(userId, role);

  const validStates: TaskState[] = [
    "ASSIGNED",
    "ONGOING",
    "REVIEW",
    "ACCEPTED",
  ];

  if (state && !validStates.includes(state)) {
    throw new ApiError(400, "Invalid task state filter");
  }

  let query = "";
  const params: any[] = [userId];

  if (role === "Manager") {
    query = `
      SELECT t.*, u.name AS assigned_to_name
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      WHERE t.assigned_to IN (
        SELECT developer_id
        FROM team
        WHERE manager_id = $1
      )
      AND t.is_deleted = false
    `;
  } else {
    query = `
      SELECT t.*, u.name AS assigned_to_name
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      WHERE t.assigned_to = $1
      AND t.is_deleted = false
    `;
  }

  if (state) {
    query += ` AND state = $${params.length + 1}`;
    params.push(state);
  }

  const tasks = await pool.query(query, params);

  res.status(200).json(
    new ApiResponse(200, tasks.rows, "Data fetched")
  );
});


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
    const client = await pool.connect()

    try {
      
      await client.query("BEGIN")
  
      const checkTeam = await client.query(`Select * from team where manager_id = $1
        and developer_id = $2 FOR UPDATE`, [userId, assigned_to])
  
      if(checkTeam.rowCount === 0){
        throw new ApiError(403, "Cannot assign a task to a developer outside your team")
      }
  
      const createdTask = await 
      client.query(`Insert into tasks (name, instruction, assigned_to, created_by, state)
        values ($1, $2, $3, $4, $5) RETURNING  id, state`, 
        [name, instruction, assigned_to, userId, state])
  
      if(createdTask.rowCount === 0){
        throw new ApiError(400, "Task Creation failed")
      }
  
      const task = createdTask.rows[0]
      
      await client.query(`
        Insert into history(task_id, from_state, to_state, actor_id, actor_role, 
        comment, action) values($1, $2, $3, $4, $5, $6, $7)`,
      [task.id, null, task.state, userId, role, comment, "CREATED"])

      await client.query("COMMIT")
  
      res.status(201)
      .json(new ApiResponse(201, "Task Created"))
  
      
    } catch (error) {
      try {
        await client.query("ROLLBACK")
      } catch {
      }
      throw error
    } finally {
      client.release()
    }
})

const startTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId
    const taskId = Number(req.params.taskId)
    const role = req.role
    const comment: string | null = req.body?.comment ?? null

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ApiError(400, "Invalid Task Id");
    }

    if(role !== "Developer"){
      throw new ApiError(403, "Only developers can start tasks")
    }

    requireAuth(userId, role)

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const taskDetails = await client.query(`Select state from tasks 
      where id = $1 and assigned_to = $2 AND is_deleted = false FOR UPDATE`, 
      [taskId, userId])

      if(taskDetails.rowCount === 0){
        throw new ApiError(404, "Task not found")
      }

      const task = taskDetails.rows[0]
      if(task.state !== "ASSIGNED"){
        throw new ApiError(409, "Task is not in ASSIGNED state")
      }
      
      const newState: TaskState = "ONGOING"
      
      const newTaskDetails = 
      await client.query(`UPDATE tasks
                  SET state = $1
                  WHERE id = $2
                    AND assigned_to = $3
                    AND is_deleted = false
                  RETURNING id, state
                  `, 
        [newState, taskId, userId])

      if (newTaskDetails.rowCount === 0) {
        throw new ApiError(409, "Task state changed. Please retry")
      }

      const newTask = newTaskDetails.rows[0]

      await client.query(`
      Insert into history(task_id, from_state, to_state, actor_id, actor_role, 
      comment, action) values($1, $2, $3, $4, $5, $6, $7)`,
      [newTask.id, task.state, newTask.state, userId, role, comment, "SHIFTED"])

      await client.query("COMMIT")

      res.status(200)
      .json(new ApiResponse(200, newTask, "Task Updated to ongoing"))
    } catch (error) {
      try {
        await client.query("ROLLBACK")
      } catch {
      }
      throw error
    } finally {
      client.release()
    }
})

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId
    const taskId = Number(req.params.taskId)
    const role = req.role
    const comment: string | null = req.body?.comment ?? null

    requireAuth(userId, role)

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ApiError(400, "Invalid Task Id");
    }


    if(role === "Developer"){
      throw new ApiError(403, "Forbidden Deletion")
    }

    const client =await pool.connect()


    try {
      await client.query("BEGIN")
      const taskDetails = 
        await client.query(`Update tasks set is_deleted = $1 
        where id = $2 AND assigned_to IN (Select developer_id from team
        where manager_id = $3) AND is_deleted = false
        RETURNING id, created_by, assigned_to, 
        state, is_deleted, updated_at`
      ,[true, taskId, userId])
  
      if(taskDetails.rowCount === 0){
        throw new ApiError(404, "Task not found")
      }
  
      const task = taskDetails.rows[0]
  
      await client.query(`
        Insert into history(task_id, from_state, to_state, actor_id, actor_role, 
        comment, action) values($1, $2, $3, $4, $5, $6, $7)`,
      [task.id, task.state, task.state, userId, role, comment, "DELETED"])

      await client.query("COMMIT")
  
      res.status(200)
      .json(new ApiResponse(200, task, "Deleted Task"))
    } catch (error) {
        try {
          await client.query("ROLLBACK")
        } catch (error) {
          
        }
        throw error
    }
    finally{
      client.release()
    }
})

const getTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId : number = Number(req.params.taskId)
    const userId = req.userId
    const role = req.role

    requireAuth(userId, role)

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ApiError(400, "Invalid Task Id");
    }


    const taskList = await pool.query(`Select t.*, u.name AS assigned_to_name 
      from tasks t
      join users u ON u.id = t.assigned_to
      where t.id = $1 
      AND (t.assigned_to = $2 OR t.assigned_to IN 
      (Select developer_id from team where manager_id = $2)) 
      AND t.is_deleted = false`, [taskId, userId])

    if(taskList.rowCount === 0) throw new ApiError(404, "Task not found")

    const task = taskList.rows[0];

    res.status(200)
    .json(new ApiResponse(200, task, "Task Fetched"))
})

const editTask = asyncHandler(async (req: Request, res: Response) => {
    
  const userId = req.userId
  const role = req.role
  const taskId = Number(req.params.taskId)

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new ApiError(400, "Invalid Task Id");
  }

  requireAuth(userId, role)

  const client = await pool.connect()



 try {
  await client.query("BEGIN")
   const taskList = await client.query(`Select * from tasks where id = $1 
     AND (assigned_to = $2 OR assigned_to IN (Select developer_id from team where manager_id = $2))
     AND is_deleted = false`,
     [taskId, userId]
   )
 
   if(taskList.rowCount === 0) throw new ApiError(404, "Task not found")
   const task = taskList.rows[0]
 
   if(["ACCEPTED"].includes(task.state) ){
     throw new ApiError(403, "Cannot edit a task in ACCEPTED state")
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
     throw new ApiError(400, "No valid fields were provided for update")
 
   }
 
   const keys = Object.keys(editOptions)
   const values = Object.values(editOptions)
 
   const setValues = keys.map((value, idx) => {
     return `${value} = $${idx + 1}`
   }).join(", ")
 
   const updatedContent = await client.query(`
       Update tasks set ${setValues}
       where id = $${keys.length + 1} AND is_deleted = false AND 
       (assigned_to = $${keys.length + 2} OR assigned_to IN (Select developer_id 
       from team where manager_id 
        = $${keys.length + 2}))
       RETURNING id, content, instruction, state
     `, [...values, taskId, userId])
 
   if(updatedContent.rowCount === 0){
     throw new ApiError(409, "Task update conflict. Please retry")
   }
 
   const updatedTask = updatedContent.rows[0]
 
   const comment: string | null = req.body?.comment ?? null
 
   await client.query(`Insert into history
     (task_id, from_state, to_state, actor_id, actor_role, comment, action)
     values($1, $2, $3, $4, $5, $6, $7)`,
   [taskId, task.state, task.state, userId, role, comment, "EDITED"])

   await client.query("COMMIT")
 
   res.status(200)
   .json(new ApiResponse(200, updatedTask, "Task Updated"))
 } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch (error) {
      
    }
    throw error
 }
 finally{
  client.release()
 }
})

const submitTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  const role = req.role
  const comment: string | null = req.body?.comment ?? null
  const taskId = Number(req.params?.taskId)

  if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ApiError(400, "Invalid Task Id");
    }

  requireAuth(userId, role)

    if (role !== "Developer") {
    throw new ApiError(403, "Only developers can submit tasks")
  }

  const client = await pool.connect()
  
  try {
    await client.query("BEGIN")
    const taskDetails = await client.query(`
      Update tasks set state = 'REVIEW' where  id = $1
      AND state = 'ONGOING' AND assigned_to = $2 AND is_deleted = false RETURNING id, state
      `, [taskId, userId])
  
    if(taskDetails.rowCount === 0) throw new ApiError(409, "Task transition conflict. Only ONGOING tasks can be submitted")
  
    const task = taskDetails.rows[0]
  
    await client.query(`Insert into history
      (task_id, from_state, to_state, actor_id, actor_role, comment, action)
      values($1, $2, $3, $4, $5, $6, $7)`,
    [taskId, "ONGOING", task.state, userId, role, comment, "SHIFTED"])

    await client.query("COMMIT")
  
    res.status(200)
    .json(new ApiResponse(200, task, "Task Sent to Review"))
  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch (error) {
      
    }
    throw error
  }
  finally{
    client.release()
  }

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

  if (!Number.isInteger(taskId) || taskId <= 0) {
  throw new ApiError(400, "Invalid Task Id");
}

  requireAuth(userId, role)

    if (role !== "Manager") {
    throw new ApiError(403, "Only managers can review tasks")
  }

  const client = await pool.connect()


  try {
    await client.query("BEGIN")
    const taskDetails = await client.query(`
      Update tasks set state = $1 where  id = $2
      AND state = 'REVIEW' AND assigned_to IN (Select developer_id from team where manager_id = $3) 
      AND is_deleted = false RETURNING id, state
      `, [state, taskId, userId])
  
    if(taskDetails.rowCount === 0) throw new ApiError(409, "Task transition conflict. Only REVIEW tasks can be reviewed")
  
    const task = taskDetails.rows[0]
  
    await client.query(`Insert into history
      (task_id, from_state, to_state, actor_id, actor_role, comment, action)
      values($1, $2, $3, $4, $5, $6, $7)`,
    [taskId, "REVIEW", state, userId, role, comment, "SHIFTED"])

    await client.query("COMMIT")
  
    res.status(200)
    .json(new ApiResponse(200, task, "Task Reviewed"))

    
  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch (error) {
      
    }
    throw error
  }
  finally{
    client.release()
  }

})

const getAllHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  const role = req.role

  requireAuth(userId, role)

  const historyDetails = await pool.query(
    `
    SELECT * from history where actor_id = $1 Order by  created_at desc
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

  if (!Number.isInteger(taskId) || taskId <= 0) {
  throw new ApiError(400, "Invalid Task Id");
}

  const historyDetails = await pool.query(
    `
    SELECT h.*
    FROM history h
    JOIN tasks t ON h.task_id = t.id
    WHERE h.task_id = $1
    AND t.is_deleted = false
    AND (t.assigned_to = $2 OR t.assigned_to IN (Select developer_id from team
    where manager_id  = $2))
    ORDER BY h.created_at DESC
    `,
    [taskId, userId]
  )

  res.status(200).json(
    new ApiResponse(200, historyDetails.rows, "History fetched")
  )
})

const getDeletedTasks = asyncHandler(async(req: Request, res: Response) => {
    const userId = req.userId
    const role = req.role

    requireAuth(userId, role)
    const client = await pool.connect()

    try {
      const response = await client.query(`Select ts.*, u.name AS assigned_to_name
        from tasks ts
        join users u ON u.id = ts.assigned_to
        where (ts.assigned_to = $1 OR 
        ts.assigned_to IN (select developer_id from team where manager_id = $1))
        AND ts.is_deleted = true`,
      [userId])

      if(response.rowCount === 0){
        throw new ApiError(404, "Deleted tasks not found")
      }

      res.status(200)
      .json(new ApiResponse(200, response.rows, "Deleted tasks fetched"))
    } finally {
      client.release()
    }
})


const recoverTask = asyncHandler(async(req: Request, res: Response) => {
    const userId = req.userId
    const role = req.role
    const taskId = Number(req.params.id)
    const comment: string | null = req.body?.comment ?? null

    requireAuth(userId, role)

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ApiError(400, "Invalid Task Id")
    }

    if(role === "Developer") throw new ApiError(403, "Only managers can recover tasks")
    
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      const recover = await client.query(`Update tasks set is_deleted = false
        where id = $1
        and is_deleted = true
        and assigned_to IN (
          Select developer_id from team where manager_id = $2
        )
        returning id, state`, [taskId, userId])

      if(recover.rowCount === 0){
        throw new ApiError(404, "Deleted task not found")
      }

      const data = recover.rows[0]

      await client.query(`Insert into history
      (task_id, from_state, to_state, actor_id, actor_role, comment, action)
      values($1, $2, $3, $4, $5, $6, $7)`,
    [data.id, data.state, data.state, userId, role, comment, "RECOVERED"])

      await client.query("COMMIT")

      res.status(200)
      .json(new ApiResponse(200, data, "Task recovered successfully"))
    } catch (error) {
      try{
        await client.query("ROLLBACK")
      }
      catch(error){

      }
      throw error
    }
    finally{
      client.release()
    }
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
  getHistory,
  getDeletedTasks,
  recoverTask
}
