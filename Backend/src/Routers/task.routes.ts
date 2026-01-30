import {Router} from "express"
import {getAllTasks,  createTask, deleteTask, getTask, editTask,
    startTask, submitTask, reviewTask, getAllHistory, getHistory
}
from '../Controllers/task.controller.js'
const router = Router()

router.route('/')
.get(getAllTasks)
.post(createTask)

router.route('/:taskId')
.get(getTask)
.delete(deleteTask)
.patch(editTask)

router.route('/:taskId/start').patch(startTask)
router.route('/:taskId/submit').patch(submitTask)
router.route('/:taskId/review').patch(reviewTask)

router.route('/history').get(getAllHistory)
router.route('/history/:taskId').get(getHistory)

export default router
