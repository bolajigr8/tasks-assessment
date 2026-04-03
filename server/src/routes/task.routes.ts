import { Router } from 'express'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createTaskValidators,
  updateTaskValidators,
  taskFilterValidators,
} from '../validators/task.validators.js'

const router = Router()

// Every task route requires a valid token — applied once at the router level
router.use(authenticate)

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Create, read, update, and delete tasks
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by task priority
 *     responses:
 *       200:
 *         description: Array of tasks belonging to the user
 *       401:
 *         description: Unauthorized
 */
router.get('/', taskFilterValidators, validate, getTasks)

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Finish assessment
 *               description:
 *                 type: string
 *                 example: Complete and push to GitHub
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-03T12:00:00.000Z
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 example: todo
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTaskValidators, validate, createTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task (partial update supported)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found or not owned by user
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', updateTaskValidators, validate, updateTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task
 *     responses:
 *       204:
 *         description: Task deleted — no content returned
 *       404:
 *         description: Task not found or not owned by user
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', deleteTask)

export default router
