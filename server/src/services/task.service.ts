import { Types } from 'mongoose'
import { ITask, Task } from '../models/Task.js'
import { createError } from '../middleware/errorHandler.js'

export interface TaskFilters {
  status?: string
  priority?: string
}

interface CreateTaskInput {
  title: string
  description?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  status?: 'todo' | 'in-progress' | 'done'
}

type UpdateTaskInput = Partial<CreateTaskInput>

export async function getUserTasks(
  userId: Types.ObjectId,
  filters: TaskFilters,
) {
  const query: Record<string, unknown> = { owner: userId }

  if (filters.status) query.status = filters.status
  if (filters.priority) query.priority = filters.priority

  // Most recent tasks appear first — sensible default for a task dashboard
  return Task.find(query).sort({ createdAt: -1 })
}

export async function createTask(
  userId: Types.ObjectId,
  input: CreateTaskInput,
) {
  return Task.create({ ...input, owner: userId })
}

export async function updateTask(
  taskId: string,
  userId: Types.ObjectId,
  input: UpdateTaskInput,
): Promise<ITask> {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, owner: userId },
    { $set: input },
    { new: true, runValidators: true },
  )

  if (!task) {
    throw createError(
      'Task not found or you do not have permission to edit it',
      404,
    )
  }

  return task
}

export async function deleteTask(
  taskId: string,
  userId: Types.ObjectId,
): Promise<void> {
  const task = await Task.findOneAndDelete({ _id: taskId, owner: userId })

  if (!task) {
    throw createError(
      'Task not found or you do not have permission to delete it',
      404,
    )
  }
}
