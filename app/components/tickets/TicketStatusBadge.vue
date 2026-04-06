<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClasses[status],
    ]"
  >
    {{ statusLabels[status] }}
  </span>
</template>

<script setup lang="ts">
import type { TicketStatus } from '~/types'

defineProps<{ status: TicketStatus }>()

const statusClasses: Record<TicketStatus, string> = {
  to_be_worked: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  canceled: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<TicketStatus, string> = {
  to_be_worked: 'To Be Worked',
  in_progress: 'In Progress',
  done: 'Done',
  canceled: 'Canceled',
}
</script>
