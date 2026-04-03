'use client'

import type { TaskFilters, Status, Priority } from '@/types'

interface TaskFiltersProps {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
  onReset: () => void
}

const statusOptions: { value: Status | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const priorityOptions: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const selectClass =
  'px-3 py-2 bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]'

export function TaskFiltersBar({ filters, onChange, onReset }: TaskFiltersProps) {
  const hasActiveFilters = filters.status !== '' || filters.priority !== ''

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter icon label */}
      <span className="text-slate-500 text-sm flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filter
      </span>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as Status | '' })}
        className={selectClass}
      >
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-800">
            {o.label}
          </option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as Priority | '' })}
        className={selectClass}
      >
        {priorityOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-800">
            {o.label}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors rounded-lg hover:bg-slate-700/40"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  )
}
