<template>
  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
    <span class="text-white font-medium">
      {{ initial }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: string
}

const props = defineProps<Props>()

const initial = computed(() => {
  return props.name?.charAt(0).toUpperCase() || '?'
})
</script>