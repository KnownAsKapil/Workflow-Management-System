import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./DB/DB_Connection.js"

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

//console.log("ENV PORT:", process.env.PORT)
app.use('/health', async (_, res) => {
    const response = await pool.query("Select 1")
    res.send({message :'Everything healthy'})
})

app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
})


