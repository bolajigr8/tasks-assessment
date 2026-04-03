'use client'

import { useState } from 'react'
import type { Task, Status } from '@/types'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'

interface TaskCardProps {
  task: Task
  onStatusChange: (id: string, status: Status) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const statuses: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date() && new Date(iso).toDateString() !== new Date().toDateString()
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleStatusChange(newStatus: Status) {
    if (newStatus === task.status) return
    setIsUpdatingStatus(true)
    try {
      await onStatusChange(task._id, newStatus)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const overdue = task.dueDate && task.status !== 'done' && isOverdue(task.dueDate)

  return (
    <div className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-700/50 hover:border-slate-600/70 rounded-2xl p-4 transition-all duration-200 flex flex-col gap-3">
      {/* Top row — title + action buttons */}
      <div className="flex items-start justify-between gap-3">
        <h3 className={`text-sm font-semibold leading-snug flex-1 ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
          {task.title}
        </h3>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete task"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">Delete?</span>
              <button
                onClick={() => onDelete(task._id)}
                className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 hover:bg-slate-700 rounded-md transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* Footer row — badges + due date + status selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/40">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />

          {/* Due date */}
          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {overdue && 'Overdue · '}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Inline status select */}
        <div className="relative">
          {isUpdatingStatus ? (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Updating…
            </span>
          ) : (
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Status)}
              className="appearance-none text-xs bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-0 pr-4"
              style={{ color: 'inherit' }}
              title="Change status"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-800 text-slate-200">
                  {s.label}
                </option>
              ))}
            </select>
          )}
          {!isUpdatingStatus && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <StatusBadge status={task.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
