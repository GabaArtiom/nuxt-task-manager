<template>
  <tr
    :class="[
      'cursor-pointer transition-colors',
      isMine && !ticket.is_urgent && 'bg-primary-50/60 dark:bg-primary-950/20',
      ticket.is_urgent && ticket.status === 'in_progress' && 'bg-red-50/50 dark:bg-red-950/20',
      ticket.is_urgent && ticket.status === 'to_be_worked' && 'bg-amber-50/50 dark:bg-amber-950/20',
      !ticket.is_urgent && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      ticket.is_urgent && 'hover:bg-red-50 dark:hover:bg-red-950/40',
    ]"
    @click="navigateTo(`/tickets/${ticket.id}`)"
  >
    <!-- Checkbox (bulk mode only) -->
    <td v-if="showCheckbox" class="py-3 pl-4 pr-2" @click.stop>
      <label class="flex items-center cursor-pointer group">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="$emit('toggle-select', ticket.id)"
          class="sr-only peer"
        />
        <div class="relative w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all group-hover:border-primary-500">
          <svg class="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </label>
    </td>

    <!-- Color indicator + Customer -->
    <td class="py-3 pl-4 pr-3">
      <div class="flex items-center gap-3">
        <div :class="['w-1 h-8 rounded-full flex-shrink-0', colorBar]" />
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ ticket.customer_name }}</p>
          <p v-if="ticket.description" class="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{{ ticket.description }}</p>
        </div>
      </div>
    </td>

    <!-- Date -->
    <td class="py-3 px-3 hidden md:table-cell">
      <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ formatDate(ticket.created_at) }}</span>
    </td>

    <!-- Assigned to -->
    <td class="py-3 px-3 hidden lg:table-cell">
      <div v-if="ticket.assignee" class="flex items-center gap-1.5">
        <span :class="['text-xs whitespace-nowrap', isMine ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300']">
          {{ ticket.assignee.name }} {{ ticket.assignee.family_name }}
        </span>
        <span v-if="isMine" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
          YOU
        </span>
      </div>
      <span v-else class="text-xs text-gray-400 dark:text-gray-600 italic">—</span>
    </td>

    <!-- Type -->
    <td class="py-3 px-3 hidden sm:table-cell">
      <TicketTypeBadge :type="ticket.type" />
    </td>

    <!-- Urgency -->
    <td class="py-3 px-3">
      <TicketUrgencyBadge :urgent="ticket.is_urgent" />
    </td>

    <!-- Status -->
    <td class="py-3 px-3">
      <TicketStatusBadge :status="ticket.status" />
    </td>

    <!-- Actions -->
    <td v-if="auth.isAdmin" class="py-3 pl-3 pr-4">
      <button
        class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        @click.stop="$emit('edit', ticket)"
      >
        <Pencil class="w-3 h-3" />
        Edit
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'
import type { Ticket, TicketStatus } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { format } from 'date-fns'

const props = defineProps<{
  ticket: Ticket
  showCheckbox?: boolean
  isSelected?: boolean
}>()

defineEmits<{
  click: [ticket: Ticket]
  edit: [ticket: Ticket]
  'toggle-select': [id: string]
}>()

const auth = useAuthStore()
const isMine = computed(() => props.ticket.assigned_to === auth.user?.id)

function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

const colorBar = computed(() => {
  const map: Record<TicketStatus, string> = {
    to_be_worked: 'bg-amber-500',
    in_progress: 'bg-blue-600',
    done: 'bg-green-600',
    canceled: 'bg-gray-400',
  }
  if (props.ticket.is_urgent && props.ticket.status !== 'done' && props.ticket.status !== 'canceled') return 'bg-red-600'
  return map[props.ticket.status]
})
</script>
