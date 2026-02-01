import {Router} from "express"
import {getAllTasks,  createTask, deleteTask, getTask, editTask,
    startTask, submitTask, reviewTask, getAllHistory, getHistory
}
from '../Controllers/task.controller.js'
import { verifyJWT } from "../Middlewares/auth.middleware.js"
import { allowRoles } from "../Middlewares/roles.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route('/')
  .get(getAllTasks)
  .post(allowRoles("Manager"), createTask)

router.route('/history')
  .get(getAllHistory)

router.route('/history/:taskId')
  .get(getHistory)

router.route('/:taskId/start')
  .patch(allowRoles("Developer"),startTask)

router.route('/:taskId/submit')
  .patch(allowRoles("Developer"), submitTask)

router.route('/:taskId/review')
  .patch(allowRoles("Manager"),reviewTask)

router.route('/:taskId')
  .get(getTask)
  .delete(allowRoles("Manager"), deleteTask)
  .patch(editTask)


export default router
