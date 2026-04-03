import mongoose, { Document, Schema, Types } from 'mongoose'

export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in-progress' | 'done'

export interface ITask extends Document {
  title: string
  description?: string
  dueDate?: Date
  priority: Priority
  status: Status
  owner: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

// Compound indexes for the two most common filter patterns.
// Querying tasks by owner alone is covered by the first index.
taskSchema.index({ owner: 1, status: 1 })
taskSchema.index({ owner: 1, priority: 1 })

export const Task = mongoose.model<ITask>('Task', taskSchema)
