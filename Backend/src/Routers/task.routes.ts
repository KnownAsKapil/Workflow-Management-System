import {Router} from "express"
import {getAllTasks,  createTask, deleteTask, getTask, editTask,
    startTask, submitTask, reviewTask, getAllHistory, getHistory
}
from '../Controllers/task.controller.js'
import { verifyJWT } from "../Middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route('/')
  .get(getAllTasks)
  .post(createTask)

router.route('/history')
  .get(getAllHistory)

router.route('/history/:taskId')
  .get(getHistory)

router.route('/:taskId/start')
  .patch(startTask)

router.route('/:taskId/submit')
  .patch(submitTask)

router.route('/:taskId/review')
  .patch(reviewTask)

router.route('/:taskId')
  .get(getTask)
  .delete(deleteTask)
  .patch(editTask)


export default router
