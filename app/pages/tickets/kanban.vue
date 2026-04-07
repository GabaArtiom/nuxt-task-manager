<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('tickets.kanban') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('tickets.kanbanSubtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/tickets/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          {{ $t('nav.newTicket') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
      <div v-if="auth.isAdmin" class="w-40">
        <CustomSelect v-model="filters.view" :options="viewOptions" />
      </div>
      <div class="w-36">
        <CustomSelect v-model="filters.type" :options="typeOptions" />
      </div>
      <div class="w-36">
        <CustomSelect v-model="filters.urgent" :options="urgencyOptions" />
      </div>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        {{ $t('tickets.clearFilters') }}
      </button>
    </div>

    <div v-if="ticketsStore.loading" class="py-8">
      <SkeletonTable :rows="10" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- To Be Worked Column -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div class="bg-amber-50 dark:bg-amber-950/20 px-4 py-3 border-b border-amber-200 dark:border-amber-800">
          <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-amber-500"></div>
            {{ $t('tickets.statusToBeWorked') }}
            <span class="text-xs text-amber-600 dark:text-amber-400">({{ getTicketsByStatus('to_be_worked').length }})</span>
          </h3>
        </div>
        <div
          class="p-3 space-y-3 min-h-[200px]"
          @drop="onDrop($event, 'to_be_worked')"
          @dragover.prevent
          @dragenter.prevent
        >
          <KanbanCard
            v-for="ticket in getTicketsByStatus('to_be_worked')"
            :key="ticket.id"
            :ticket="ticket"
            @dragstart="onDragStart($event, ticket)"
            @click="selectedTicket = ticket"
          />
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div class="bg-blue-50 dark:bg-blue-950/20 px-4 py-3 border-b border-blue-200 dark:border-blue-800">
          <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-blue-600"></div>
            {{ $t('tickets.statusInProgress') }}
            <span class="text-xs text-blue-600 dark:text-blue-400">({{ getTicketsByStatus('in_progress').length }})</span>
          </h3>
        </div>
        <div
          class="p-3 space-y-3 min-h-[200px]"
          @drop="onDrop($event, 'in_progress')"
          @dragover.prevent
          @dragenter.prevent
        >
          <KanbanCard
            v-for="ticket in getTicketsByStatus('in_progress')"
            :key="ticket.id"
            :ticket="ticket"
            @dragstart="onDragStart($event, ticket)"
            @click="selectedTicket = ticket"
          />
        </div>
      </div>

      <!-- Done Column -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div class="bg-green-50 dark:bg-green-950/20 px-4 py-3 border-b border-green-200 dark:border-green-800">
          <h3 class="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-600"></div>
            {{ $t('tickets.statusDone') }}
            <span class="text-xs text-green-600 dark:text-green-400">({{ getTicketsByStatus('done').length }})</span>
          </h3>
        </div>
        <div
          class="p-3 space-y-3 min-h-[200px]"
          @drop="onDrop($event, 'done')"
          @dragover.prevent
          @dragenter.prevent
        >
          <KanbanCard
            v-for="ticket in getTicketsByStatus('done')"
            :key="ticket.id"
            :ticket="ticket"
            @dragstart="onDragStart($event, ticket)"
            @click="selectedTicket = ticket"
          />
        </div>
      </div>

      <!-- Canceled Column -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            {{ $t('tickets.statusCanceled') }}
            <span class="text-xs text-gray-600 dark:text-gray-400">({{ getTicketsByStatus('canceled').length }})</span>
          </h3>
        </div>
        <div
          class="p-3 space-y-3 min-h-[200px]"
          @drop="onDrop($event, 'canceled')"
          @dragover.prevent
          @dragenter.prevent
        >
          <KanbanCard
            v-for="ticket in getTicketsByStatus('canceled')"
            :key="ticket.id"
            :ticket="ticket"
            @dragstart="onDragStart($event, ticket)"
            @click="selectedTicket = ticket"
          />
        </div>
      </div>
    </div>

    <TicketDetailModal :ticket="selectedTicket" :technicians="technicians" @close="selectedTicket = null" @updated="fetchTickets" @deleted="fetchTickets" />
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { Ticket, User, TicketStatus } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import { useToast } from '~/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const { success, error } = useToast()
const selectedTicket = ref<Ticket | null>(null)
const technicians = ref<User[]>([])
const draggedTicket = ref<Ticket | null>(null)

const filters = reactive({
  view: 'all',
  type: '',
  urgent: '',
})

const viewOptions = computed(() => [
  { value: 'all', label: t('tickets.allTickets') },
  { value: 'unassigned', label: t('tickets.unassignedOnly') },
])

const typeOptions = computed(() => [
  { value: '', label: t('tickets.allTypes') },
  ...['Bug', 'Fixes', 'Improvement', 'Info', 'Typo', 'Other'].map(v => ({ value: v, label: v })),
])

const urgencyOptions = computed(() => [
  { value: '', label: t('tickets.allUrgency') },
  { value: 'true', label: t('tickets.urgent') },
  { value: 'false', label: t('tickets.notUrgent') },
])

const hasActiveFilters = computed(() => {
  return filters.view !== 'all' || filters.type !== '' || filters.urgent !== ''
})

function clearFilters() {
  filters.view = 'all'
  filters.type = ''
  filters.urgent = ''
}

watch([filters], () => {
  fetchTickets()
}, { deep: true })

async function fetchTickets() {
  const params: Record<string, string> = { limit: '1000' }
  if (filters.view === 'unassigned') params.unassigned = 'true'
  if (filters.type) params.type = filters.type
  if (filters.urgent) params.urgent = filters.urgent
  await ticketsStore.fetchTickets(params)
}

function getTicketsByStatus(status: TicketStatus) {
  return ticketsStore.tickets.filter(t => t.status === status)
}

function onDragStart(event: DragEvent, ticket: Ticket) {
  draggedTicket.value = ticket
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

async function onDrop(event: DragEvent, newStatus: TicketStatus) {
  event.preventDefault()

  if (!draggedTicket.value) return

  const ticket = draggedTicket.value

  if (ticket.status === newStatus) {
    draggedTicket.value = null
    return
  }

  try {
    await ticketsStore.updateTicket(ticket.id, { status: newStatus } as any)
    success(t('tickets.statusUpdated'))
  } catch (e: any) {
    error(e.data?.statusMessage || t('common.error'))
  } finally {
    draggedTicket.value = null
  }
}

onMounted(async () => {
  await fetchTickets()
  if (auth.isAdmin) {
    try { technicians.value = await $fetch<User[]>('/api/users') } catch {}
  }
})
</script>
