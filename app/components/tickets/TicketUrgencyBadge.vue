<template>
  <span
    v-if="urgent"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"
  >
    <AlertTriangle class="w-3 h-3" />
    Urgent
  </span>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{ urgent: boolean }>()
</script>
