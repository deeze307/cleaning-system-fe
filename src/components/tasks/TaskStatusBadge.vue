<script setup lang="ts">
import { computed } from 'vue'
import { TaskStatus, TASK_STATUS_LABELS } from '@/types/task.types'

interface Props {
  status: TaskStatus
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs = {
    [TaskStatus.TO_CLEAN]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: TASK_STATUS_LABELS[TaskStatus.TO_CLEAN]
    },
    [TaskStatus.TO_CLEAN_URGENT]: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: TASK_STATUS_LABELS[TaskStatus.TO_CLEAN_URGENT]
    },
    [TaskStatus.IN_PROGRESS]: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: TASK_STATUS_LABELS[TaskStatus.IN_PROGRESS]
    },
    [TaskStatus.COMPLETED]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: TASK_STATUS_LABELS[TaskStatus.COMPLETED]
    },
    [TaskStatus.VERIFIED]: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: TASK_STATUS_LABELS[TaskStatus.VERIFIED]
    }
  }
  
  return configs[props.status]
})
</script>

<template>
  <span 
    :class="[statusConfig.bg, statusConfig.text]"
    class="px-2 py-1 text-xs font-semibold rounded-full"
  >
    {{ statusConfig.label }}
  </span>
</template>