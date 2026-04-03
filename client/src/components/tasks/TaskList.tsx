'use client'

import type { Task, Status } from '@/types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onStatusChange: (id: string, status: Status) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  hasFilters: boolean
}

export function TaskList({ tasks, isLoading, onStatusChange, onEdit, onDelete, hasFilters }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/40 border border-slate-700/30 rounded-2xl p-4 h-36 animate-pulse"
          >
            <div className="h-3 bg-slate-700/50 rounded-full w-3/4 mb-3" />
            <div className="h-2 bg-slate-700/30 rounded-full w-full mb-2" />
            <div className="h-2 bg-slate-700/30 rounded-full w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-800/60 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-slate-300 font-semibold mb-1">
          {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
        </h3>
        <p className="text-slate-500 text-sm max-w-xs">
          {hasFilters
            ? 'Try adjusting or clearing your filters to see more tasks.'
            : 'Hit "New Task" above to create your first task and get things moving.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
