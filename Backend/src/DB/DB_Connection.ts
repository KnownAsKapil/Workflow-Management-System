import { Pool } from "pg";
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
    host:"localhost",
    port:5432,
    user:"postgres",
    password:process.env.DB_PASSWORD,
    database:"flow_management"
})

pool.on("connect", () => {
  console.log("Connected to PostgreSQL")
})

export default pool