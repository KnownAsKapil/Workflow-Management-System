import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { rateLimiter } from "../Middlewares/ratelimiter.middleware.js";
import {handleRegister, handleLogin, handleLogout, getDetails, refreshAllTokens, makeTeam} 
from '../Controllers/user.controller.js'

const router = Router()

router.route('/register').post(rateLimiter, handleRegister)
router.route('/login').post(rateLimiter, handleLogin)
router.route('/logout').post( verifyJWT, handleLogout)
router.route('/refresh').post(rateLimiter, refreshAllTokens)
router.route('/me').get(verifyJWT, getDetails)
router.route('/team/:developerId').post(verifyJWT, rateLimiter, makeTeam)

export default router
