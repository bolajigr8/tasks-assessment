'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  apiGetTasks,
  apiCreateTask,
  apiUpdateTask,
  apiDeleteTask,
} from '@/lib/api'
import type { Task, TaskInput, TaskFilters, Status } from '@/types'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskFiltersBar } from '@/components/tasks/TaskFilters'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Modal } from '@/components/ui/Modal'

//  Modal mode

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; task: Task }

//  Dashboard

export default function DashboardPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [filters, setFilters] = useState<TaskFilters>({
    status: '',
    priority: '',
  })
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  //  Auth guard
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/login')
    }
  }, [authLoading, token, router])

  //  Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }, [])

  //  Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!token) return
    setIsLoadingTasks(true)
    try {
      const res = await apiGetTasks(token, filters)
      if (res.status === 'success') {
        setTasks(res.data.tasks)
      }
    } catch {
      showToast('Failed to load tasks. Check your connection.')
    } finally {
      setIsLoadingTasks(false)
    }
  }, [token, filters, showToast])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  //  Create task
  async function handleCreate(input: TaskInput) {
    if (!token) return
    const res = await apiCreateTask(token, input)
    if (res.status === 'success') {
      setTasks((prev) => [res.data.task, ...prev])
      setModal({ mode: 'closed' })
      showToast('Task created!')
    } else {
      const fail = res as {
        message?: string
        errors?: { field: string; message: string }[]
      }
      throw { message: fail.message, errors: fail.errors }
    }
  }

  //  Update task
  async function handleEdit(input: TaskInput) {
    if (!token || modal.mode !== 'edit') return
    const res = await apiUpdateTask(token, modal.task._id, input)
    if (res.status === 'success') {
      setTasks((prev) =>
        prev.map((t) => (t._id === res.data.task._id ? res.data.task : t)),
      )
      setModal({ mode: 'closed' })
      showToast('Task updated!')
    } else {
      const fail = res as {
        message?: string
        errors?: { field: string; message: string }[]
      }
      throw { message: fail.message, errors: fail.errors }
    }
  }

  //  Status change (inline)
  async function handleStatusChange(id: string, status: Status) {
    if (!token) return
    const res = await apiUpdateTask(token, id, { status })
    if (res.status === 'success') {
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)))
    }
  }

  //  Delete task
  async function handleDelete(id: string) {
    if (!token) return
    const res = await apiDeleteTask(token, id)
    if (res.status === 'success') {
      setTasks((prev) => prev.filter((t) => t._id !== id))
      showToast('Task deleted.')
    }
  }

  //  Filter helpers
  function handleFilterChange(newFilters: TaskFilters) {
    setFilters(newFilters)
  }

  function handleFilterReset() {
    setFilters({ status: '', priority: '' })
  }

  //  Derived state
  const hasFilters = filters.status !== '' || filters.priority !== ''

  // Stats
  const statsCount = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  //  Guard render
  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!token) return null

  //  Render
  return (
    <div className='min-h-screen bg-[#0c0f1a]'>
      {/* Ambient background */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl' />
      </div>

      {/*  Header ─ */}
      <header className='sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center gap-2.5'>
            <span className='text-sm font-bold text-slate-100 tracking-tight'>
              Tasks
            </span>
          </div>

          {/* User + logout */}
          <div className='flex items-center gap-3'>
            <span className='text-sm text-slate-400 hidden sm:block'>
              Hey,{' '}
              <span className='text-slate-200 font-medium'>{user?.name}</span>
            </span>
            <button
              onClick={logout}
              className='text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors font-medium'
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/*  Main  */}
      <main className='relative max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        {/* Page title + new task button */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-bold text-slate-100'>My Tasks</h1>
            <p className='text-slate-500 text-sm mt-0.5'>
              {statsCount.total} task{statsCount.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 4v16m8-8H4'
              />
            </svg>
            New Task
          </button>
        </div>

        {/* Stats strip */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              label: 'To Do',
              count: statsCount.todo,
              color: 'text-slate-400',
              bg: 'bg-slate-500/10 border-slate-500/20',
            },
            {
              label: 'In Progress',
              count: statsCount.inProgress,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10 border-indigo-500/20',
            },
            {
              label: 'Done',
              count: statsCount.done,
              color: 'text-teal-400',
              bg: 'bg-teal-500/10 border-teal-500/20',
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} border rounded-xl px-4 py-3`}
            >
              <div className={`text-2xl font-bold font-mono ${s.color}`}>
                {s.count}
              </div>
              <div className='text-xs text-slate-500 mt-0.5'>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <TaskFiltersBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
        />

        {/* Task list */}
        <TaskList
          tasks={tasks}
          isLoading={isLoadingTasks}
          onStatusChange={handleStatusChange}
          onEdit={(task) => setModal({ mode: 'edit', task })}
          onDelete={handleDelete}
          hasFilters={hasFilters}
        />
      </main>

      {/* ── Modals ─ */}
      <Modal
        isOpen={modal.mode === 'create'}
        onClose={() => setModal({ mode: 'closed' })}
        title='New Task'
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setModal({ mode: 'closed' })}
          submitLabel='Create task'
        />
      </Modal>

      <Modal
        isOpen={modal.mode === 'edit'}
        onClose={() => setModal({ mode: 'closed' })}
        title='Edit Task'
      >
        {modal.mode === 'edit' && (
          <TaskForm
            key={modal.task._id}
            initialData={modal.task}
            onSubmit={handleEdit}
            onCancel={() => setModal({ mode: 'closed' })}
            submitLabel='Save changes'
          />
        )}
      </Modal>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className='fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl text-sm text-slate-200 flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300'>
          <svg
            className='w-4 h-4 text-indigo-400 shrink-0'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
            />
          </svg>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
