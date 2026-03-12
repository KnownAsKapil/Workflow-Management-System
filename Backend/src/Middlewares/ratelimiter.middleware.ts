
import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';
import dotenv from "dotenv"
dotenv.config()

const redis = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-17254.c82.us-east-1-2.ec2.cloud.redislabs.com',
        port: 17254
    }
});
await redis.connect();


export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `rate:${req.ip}`;

    const limit = 5;   // max requests
    const window = 30; // seconds

    const current = await redis.incr(key);

    // first request
    if (current === 1) {
      await redis.expire(key, window);
    }

    
    if (current > limit) {
      
      return res.status(429).json({
        error: "Too many requests",
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next();
  }
};
