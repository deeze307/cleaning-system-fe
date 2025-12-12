<script setup lang="ts">
import { computed } from 'vue'
import DayColumn from '@/components/cleaning/DayColumn.vue'
import type { Task } from '@/types/task.types'

interface Props {
  weekStart: Date
  tasks: Task[]
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const weekDays = computed(() => {
  const days = []
  const start = new Date(props.weekStart)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push(date)
  }
  
  return days
})

const getTasksForDay = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return props.tasks.filter(task => {
    const taskDate = new Date(task.scheduledDate).toISOString().split('T')[0]
    return taskDate === dateStr
  })
}

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
</script>

<template>
  <div class="bg-white rounded-lg shadow-xl overflow-hidden">
    <!-- Grid de días -->
    <div class="grid grid-cols-7 gap-0">
      <DayColumn
        v-for="(day, index) in weekDays"
        :key="day.toISOString()"
        :date="day"
        :day-name="dayNames[index]"
        :tasks="getTasksForDay(day)"
        @refresh="emit('refresh')"
      />
    </div>
  </div>
</template>