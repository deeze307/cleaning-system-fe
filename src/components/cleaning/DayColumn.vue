<script setup lang="ts">
import { computed } from 'vue'
import RoomTaskCard from '@/components/cleaning/RoomTaskCard.vue'
import type { Task } from '@/types/index'

interface Props {
  date: Date
  dayName: string
  tasks: Task[]
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isToday = computed(() => {
  const today = new Date()
  return props.date.toDateString() === today.toDateString()
})

const formattedDate = computed(() => {
  return props.date.getDate()
})
</script>

<template>
  <div
    :class="[
      'border-r last:border-r-0 min-h-[600px]',
      isToday ? 'bg-orange-50' : 'bg-white'
    ]"
  >
    <!-- Header del día -->
    <div
      :class="[
        'py-4 text-center border-b-2',
        isToday ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
      ]"
    >
      <div class="text-sm font-medium">{{ dayName }}</div>
      <div class="text-2xl font-bold">{{ formattedDate }}</div>
    </div>

    <!-- Tareas del día -->
    <div class="p-2 space-y-2">
      <RoomTaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @refresh="emit('refresh')"
      />

      <!-- Estado vacío -->
      <div
        v-if="tasks.length === 0"
        class="text-center py-8 text-gray-400"
      >
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">Sin tareas</p>
      </div>
    </div>
  </div>
</template>