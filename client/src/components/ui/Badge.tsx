import type { Priority, Status } from '@/types'

// ─── Priority Badge ───────────────────────────────────────────────────────────

const priorityStyles: Record<Priority, string> = {
  high: 'bg-red-500/15 text-red-400 border border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
}

const priorityDots: Record<Priority, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium font-mono ${priorityStyles[priority]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${priorityDots[priority]}`} />
      {priority}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<Status, string> = {
  todo: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  'in-progress': 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  done: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
}

const statusLabels: Record<Status, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}
