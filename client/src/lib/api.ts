import type {
  ApiResponse,
  AuthData,
  TaskData,
  TasksData,
  RegisterInput,
  LoginInput,
  TaskInput,
  TaskUpdateInput,
  TaskFilters,
  ApiFieldError,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

//  Core fetch wrapper

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // DELETE returns 204 with no body
  if (res.status === 204) {
    return { status: 'success', data: {} as T }
  }

  // Try to parse JSON regardless of status code
  let json: unknown
  try {
    json = await res.json()
  } catch {
    // Server returned a non-JSON body (e.g. HTML crash page on 500)
    throw new Error(`Server error ${res.status}: ${res.statusText}`)
  }

  // Normalize HTTP error responses into a typed ApiResponse failure
  if (!res.ok) {
    const err = json as { message?: string; errors?: ApiFieldError[] }
    return {
      status: 'error',
      message: err.message ?? `Request failed with status ${res.status}`,
      ...(err.errors ? { errors: err.errors } : {}),
    } as ApiResponse<T>
  }

  return json as ApiResponse<T>
}

//  Auth endpoints

export async function apiRegister(
  input: RegisterInput,
): Promise<ApiResponse<AuthData> & { token?: string }> {
  return apiFetch<AuthData>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function apiLogin(
  input: LoginInput,
): Promise<ApiResponse<AuthData> & { token?: string }> {
  return apiFetch<AuthData>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function apiLogout(
  token: string,
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch('/api/auth/logout', { method: 'POST' }, token)
}

export async function apiGetMe(token: string): Promise<ApiResponse<AuthData>> {
  return apiFetch<AuthData>('/api/auth/me', {}, token)
}

//  Task endpoints

export async function apiGetTasks(
  token: string,
  filters?: Partial<TaskFilters>,
): Promise<ApiResponse<TasksData>> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.priority) params.set('priority', filters.priority)
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<TasksData>(`/api/tasks${query}`, {}, token)
}

export async function apiCreateTask(
  token: string,
  input: TaskInput,
): Promise<ApiResponse<TaskData>> {
  return apiFetch<TaskData>(
    '/api/tasks',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  )
}

export async function apiUpdateTask(
  token: string,
  id: string,
  input: TaskUpdateInput,
): Promise<ApiResponse<TaskData>> {
  return apiFetch<TaskData>(
    `/api/tasks/${id}`,
    { method: 'PATCH', body: JSON.stringify(input) },
    token,
  )
}

export async function apiDeleteTask(
  token: string,
  id: string,
): Promise<ApiResponse<object>> {
  return apiFetch<object>(`/api/tasks/${id}`, { method: 'DELETE' }, token)
}
