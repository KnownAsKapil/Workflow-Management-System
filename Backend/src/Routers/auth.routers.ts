import { Router } from "express";

import {handleRegister, handleLogin, handleLogout, getDetails} 
from '../Controllers/user.controller.js'


const router = Router()

router.route('/register').post(handleRegister)
router.route('/login').post(handleLogin)
router.route('/logout').get(handleLogout)
router.route('/me').get(getDetails)

export default router