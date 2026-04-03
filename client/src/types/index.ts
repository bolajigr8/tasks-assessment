//  Domain Models

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in-progress' | 'done'

export interface Task {
  _id: string
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  status: Status
  owner: string
  createdAt: string
  updatedAt: string
}

//  API Request Bodies ─

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface TaskInput {
  title: string
  description?: string
  dueDate?: string
  priority?: Priority
  status?: Status
}

export type TaskUpdateInput = Partial<TaskInput>

//  API Response Shapes

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiSuccess<T> {
  status: 'success'
  data: T
  token?: string
  results?: number
}

export interface ApiFail {
  status: 'fail' | 'error'
  message?: string
  errors?: ApiFieldError[]
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFail

// Auth-specific response data
export interface AuthData {
  user: User
}

export interface TaskData {
  task: Task
}

export interface TasksData {
  tasks: Task[]
}

//  Task Filter State

export interface TaskFilters {
  status: Status | ''
  priority: Priority | ''
}
