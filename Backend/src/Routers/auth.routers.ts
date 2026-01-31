import { Router } from "express";

import {handleRegister, handleLogin, handleLogout, getDetails, refreshAllTokens} 
from '../Controllers/user.controller.js'


const router = Router()

router.route('/register').post(handleRegister)
router.route('/login').post(handleLogin)
router.route('/logout').post(handleLogout)
router.route('/refresh').post(refreshAllTokens)
router.route('/me').get(getDetails)

export default router