import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import {handleRegister, handleLogin, handleLogout, getDetails, refreshAllTokens, makeTeam} 
from '../Controllers/user.controller.js'

const router = Router()

router.route('/register').post(handleRegister)
router.route('/login').post(handleLogin)
router.route('/logout').post( verifyJWT, handleLogout)
router.route('/refresh').post(refreshAllTokens)
router.route('/me').get(verifyJWT, getDetails)
router.route('/team/:developerId').post(verifyJWT, makeTeam)

export default router