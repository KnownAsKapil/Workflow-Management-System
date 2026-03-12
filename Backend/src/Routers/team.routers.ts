import {Router} from "express"
import { verifyJWT } from "../Middlewares/auth.middleware.js"
import { allowRoles } from "../Middlewares/roles.middleware.js"
import {getDevelopers, getTeamMembers} from '../Controllers/team.controller.js'
const router = Router()

router.use(verifyJWT)
router.route('/developers')
  .get(allowRoles("Manager"), getDevelopers)

router.route('/')
  .get(allowRoles("Manager"), getTeamMembers)

export default router
