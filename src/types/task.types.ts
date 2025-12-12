export interface Task {
  id: string
  roomId: string
  assignedTo?: string
  status: TaskStatus
  scheduledDate: string
  completedAt?: string
  verifiedAt?: string
  observations?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  roomId: string
  assignedTo?: string
  scheduledDate: string
  observations?: string
}

export interface UpdateTaskData {
  status?: TaskStatus
  assignedTo?: string
  scheduledDate?: string
  observations?: string
  images?: string[]
}

export interface TaskWithDetails extends Task {
  roomName: string
  buildingName: string
  assignedToName?: string
}

export enum TaskStatus {
  TO_CLEAN = 'to_clean',
  TO_CLEAN_URGENT = 'to_clean_urgent',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified'
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TO_CLEAN]: 'A Limpiar',
  [TaskStatus.TO_CLEAN_URGENT]: 'A Limpiar Urgente',
  [TaskStatus.IN_PROGRESS]: 'En Progreso',
  [TaskStatus.COMPLETED]: 'Completada',
  [TaskStatus.VERIFIED]: 'Verificada'
}

/**
 * Colores para cada estado (para badges)
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  [TaskStatus.TO_CLEAN]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800'
  },
  [TaskStatus.TO_CLEAN_URGENT]: {
    bg: 'bg-red-100',
    text: 'text-red-800'
  },
  [TaskStatus.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  [TaskStatus.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  [TaskStatus.VERIFIED]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800'
  }
}

/**
 * Array con todos los estados (útil para iteraciones)
 */
export const ALL_TASK_STATUSES: TaskStatus[] = Object.values(TaskStatus)