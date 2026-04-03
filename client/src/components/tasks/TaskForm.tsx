'use client'

import { useState, FormEvent } from 'react'
import type { Task, TaskInput, Priority, Status, ApiFieldError } from '@/types'

interface TaskFormProps {
  initialData?: Task
  onSubmit: (data: TaskInput) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const priorities: Priority[] = ['low', 'medium', 'high']
const statuses: Status[] = ['todo', 'in-progress', 'done']

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save task',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? initialData.dueDate.slice(0, 10) : '',
  )
  const [priority, setPriority] = useState<Priority>(
    initialData?.priority ?? 'medium',
  )
  const [status, setStatus] = useState<Status>(initialData?.status ?? 'todo')

  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setGeneralError('')
    setFieldErrors({})

    const payload: TaskInput = {
      title: title.trim(),
      priority,
      status,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      // onSubmit should throw an object with { message?, errors? }
      if (err && typeof err === 'object') {
        const e = err as { message?: string; errors?: ApiFieldError[] }
        if (e.errors) {
          const map: Record<string, string> = {}
          e.errors.forEach((fe) => {
            map[fe.field] = fe.message
          })
          setFieldErrors(map)
        } else {
          setGeneralError(
            e.message ?? 'Something went wrong. Please try again.',
          )
        }
      } else {
        setGeneralError('Network error. Is the server running?')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field?: string) =>
    `w-full px-3.5 py-2.5 bg-slate-800/60 border rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
      field && fieldErrors[field]
        ? 'border-red-500/60'
        : 'border-slate-700 hover:border-slate-600'
    }`

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {generalError && (
        <div className='px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
          {generalError}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          className='block text-sm font-medium text-slate-400 mb-1.5'
          htmlFor='task-title'
        >
          Title <span className='text-red-400'>*</span>
        </label>
        <input
          id='task-title'
          type='text'
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass('title')}
          placeholder='What needs to be done?'
        />
        {fieldErrors.title && (
          <p className='mt-1 text-xs text-red-400'>{fieldErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          className='block text-sm font-medium text-slate-400 mb-1.5'
          htmlFor='task-desc'
        >
          Description{' '}
          <span className='text-slate-600 font-normal'>optional</span>
        </label>
        <textarea
          id='task-desc'
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass('description')} resize-none`}
          placeholder='Add more detail…'
        />
        {fieldErrors.description && (
          <p className='mt-1 text-xs text-red-400'>{fieldErrors.description}</p>
        )}
      </div>

      {/* Due date + Priority row */}
      <div className='grid grid-cols-2 gap-3'>
        {/* Due date */}
        <div>
          <label
            className='block text-sm font-medium text-slate-400 mb-1.5'
            htmlFor='task-due'
          >
            Due date
          </label>
          <input
            id='task-due'
            type='date'
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`${inputClass('dueDate')} scheme-dark`}
          />
        </div>

        {/* Priority */}
        <div>
          <label
            className='block text-sm font-medium text-slate-400 mb-1.5'
            htmlFor='task-priority'
          >
            Priority
          </label>
          <select
            id='task-priority'
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={`${inputClass()} cursor-pointer`}
          >
            {priorities.map((p) => (
              <option key={p} value={p} className='bg-slate-800'>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div>
        <label
          className='block text-sm font-medium text-slate-400 mb-1.5'
          htmlFor='task-status'
        >
          Status
        </label>
        <select
          id='task-status'
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className={`${inputClass()} cursor-pointer`}
        >
          {statuses.map((s) => (
            <option key={s} value={s} className='bg-slate-800'>
              {s === 'in-progress'
                ? 'In Progress'
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className='flex gap-3 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className='flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2'
        >
          {isLoading && (
            <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          )}
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
