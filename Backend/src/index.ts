import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./DB/DB_Connection.js"
import authRouter from "./Routers/auth.routers.js"
import taskRouter from "./Routers/task.routes.js"

dotenv.config()

const app = express()
app.use(cors(
    {
        origin:["http://localhost:5173", "http://localhost:5174"],
        credentials:true
    }
))
app.use(express.json())

const port = process.env.PORT || 8000

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/tasks', taskRouter)

app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
})


