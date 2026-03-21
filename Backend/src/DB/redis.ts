import { createClient } from "redis"
import dotenv from "dotenv"

dotenv.config()

const redis = createClient({
  username: process.env.REDIS_USERNAME ?? "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host:
      process.env.REDIS_HOST ??
      "redis-17254.c82.us-east-1-2.ec2.cloud.redislabs.com",
    port: Number(process.env.REDIS_PORT ?? 17254),
  },
})

redis.on("error", (error) => {
  console.error("Redis error:", error)
})

if (!redis.isOpen) {
  await redis.connect()
}

export default redis
