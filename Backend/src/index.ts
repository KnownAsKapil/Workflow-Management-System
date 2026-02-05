import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRouter from "./Routers/auth.routers.js"
import taskRouter from "./Routers/task.routes.js"
import cookieParser from "cookie-parser"
import teamRouter from "./Routers/team.routers.js"

dotenv.config()

const app = express()
app.use(cors(
    {
        origin:[process.env.FRONTEND_PORT!],
        credentials:true
    }
))
app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 8000

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/tasks', taskRouter)
app.use('/api/v1/team', teamRouter)

app.listen(port, () => {
    console.log(`Server listening at the port ${port}`)
})


