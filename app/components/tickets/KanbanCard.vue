<template>
  <div
    draggable="true"
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-move hover:shadow-md transition-all"
    :class="[
      ticket.is_urgent && ticket.status !== 'done' && ticket.status !== 'canceled' && 'border-l-4 border-l-red-500',
      isMine && !ticket.is_urgent && 'border-l-4 border-l-primary-500',
      isDragOver && 'border-t-4 border-t-primary-500 pt-2',
    ]"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{{ ticket.customer_name }}</h4>
      <TicketUrgencyBadge v-if="ticket.is_urgent" :urgent="ticket.is_urgent" />
    </div>

    <p v-if="ticket.description" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{{ ticket.description }}</p>

    <div class="flex items-center justify-between gap-2">
      <TicketTypeBadge :type="ticket.type" />

      <div v-if="ticket.assignee" class="flex items-center gap-1">
        <span :class="['text-xs', isMine ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-400']">
          {{ ticket.assignee.name.charAt(0) }}{{ ticket.assignee.family_name.charAt(0) }}
        </span>
      </div>
      <span v-else class="text-xs text-gray-400 dark:text-gray-600 italic">—</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from '~/types'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  ticket: Ticket
  isDragOver?: boolean
}>()

const auth = useAuthStore()
const isMine = computed(() => props.ticket.assigned_to === auth.user?.id)
</script>
