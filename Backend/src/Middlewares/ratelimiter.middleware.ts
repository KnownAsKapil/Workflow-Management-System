import { Request, Response, NextFunction } from 'express';
import redis from "../DB/redis.js"


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
