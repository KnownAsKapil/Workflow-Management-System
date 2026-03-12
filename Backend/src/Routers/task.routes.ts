import {Router} from "express"
import {getAllTasks,  createTask, deleteTask, getTask, editTask,
    startTask, submitTask, reviewTask, getAllHistory, getHistory
    ,recoverTask, getDeletedTasks
}
from '../Controllers/task.controller.js'
import { verifyJWT } from "../Middlewares/auth.middleware.js"
import { allowRoles } from "../Middlewares/roles.middleware.js"
import { rateLimiter } from "../Middlewares/ratelimiter.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route('/')
  .get(getAllTasks)
  .post(rateLimiter, allowRoles("Manager"), createTask)

router.route('/deletedTasks')
.get(getDeletedTasks)

router.route('/deletedTasks/:id')
.patch(rateLimiter, allowRoles("Manager"), recoverTask)

router.route('/history')
  .get(getAllHistory)

router.route('/history/:taskId')
  .get(getHistory)

router.route('/:taskId/start')
  .patch(rateLimiter, allowRoles("Developer"),startTask)

router.route('/:taskId/submit')
  .patch(rateLimiter, allowRoles("Developer"), submitTask)

router.route('/:taskId/review')
  .patch(rateLimiter, allowRoles("Manager"),reviewTask)

router.route('/:taskId')
  .get(getTask)
  .delete(rateLimiter, allowRoles("Manager"), deleteTask)
  .patch(rateLimiter, editTask)


export default router
