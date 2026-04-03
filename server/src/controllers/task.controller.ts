import { Response, NextFunction } from 'express'
import * as taskService from '../services/task.service.js'
import { AuthenticatedRequest } from '../types/index.js'
import { TaskFilters } from '../services/task.service.js'

export async function getTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status, priority } = req.query as {
      status?: string
      priority?: string
    }

    const filters: TaskFilters = {}
    if (status !== undefined) filters.status = status
    if (priority !== undefined) filters.priority = priority

    const tasks = await taskService.getUserTasks(req.user!.id, filters)
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    })
  } catch (error) {
    next(error)
  }
}

export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const task = await taskService.createTask(req.user!.id, req.body)
    res.status(201).json({ status: 'success', data: { task } })
  } catch (error) {
    next(error)
  }
}

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    const task = await taskService.updateTask(id, req.user!.id, req.body)
    res.status(200).json({ status: 'success', data: { task } })
  } catch (error) {
    next(error)
  }
}

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    await taskService.deleteTask(id, req.user!.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
