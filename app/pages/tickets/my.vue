<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('tickets.myTickets') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ auth.isAdmin ? $t('tickets.mySubtitleAdmin') : $t('tickets.mySubtitleTech') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="viewMode = 'list'"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          List
        </button>
        <button
          @click="viewMode = 'kanban'"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          Kanban
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 mb-4">
      <div v-if="viewMode === 'list'" class="w-40">
        <CustomSelect v-model="filters.status" :options="statusOptions" />
      </div>
      <div class="w-40">
        <CustomSelect v-model="filters.urgent" :options="urgencyOptions" />
      </div>
      <div v-if="auth.isAdmin" class="w-48">
        <CustomSelect v-model="filters.technician_id" :options="techOptions" />
      </div>
      <div v-if="viewMode === 'list'" class="w-24">
        <CustomSelect v-model="perPage" :options="perPageOptions" />
      </div>
    </div>

    <div v-if="ticketsStore.loading" class="py-8">
      <SkeletonTable :rows="10" />
    </div>

    <div v-else-if="!ticketsStore.tickets.length" class="text-center py-20">
      <ClipboardList class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('tickets.noTicketsFound') }}</p>
      <NuxtLink to="/tickets" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        {{ $t('tickets.browseOpen') }}
      </NuxtLink>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th class="py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('tickets.customerName') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">{{ $t('tickets.date') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">{{ $t('tickets.assignedTo') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">{{ $t('tickets.type') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('tickets.urgency') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('tickets.status') }}</th>
            <th v-if="auth.isAdmin" class="py-2.5 pl-3 pr-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
          <TicketRow v-for="ticket in ticketsStore.tickets" :key="ticket.id" :ticket="ticket" @edit="selectedTicket = ticket" />
        </tbody>
      </table>
    </div>

    <!-- Kanban View -->
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
            :is-drag-over="dragOverTicket?.id === ticket.id"
            @dragstart="onDragStart($event, ticket)"
            @dragover="onDragOver($event, ticket)"
            @dragleave="onDragLeave"
            @drop="onDropOnCard($event, ticket)"
            @click="navigateTo(`/tickets/${ticket.id}`)"
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
            :is-drag-over="dragOverTicket?.id === ticket.id"
            @dragstart="onDragStart($event, ticket)"
            @dragover="onDragOver($event, ticket)"
            @dragleave="onDragLeave"
            @drop="onDropOnCard($event, ticket)"
            @click="navigateTo(`/tickets/${ticket.id}`)"
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
            :is-drag-over="dragOverTicket?.id === ticket.id"
            @dragstart="onDragStart($event, ticket)"
            @dragover="onDragOver($event, ticket)"
            @dragleave="onDragLeave"
            @drop="onDropOnCard($event, ticket)"
            @click="navigateTo(`/tickets/${ticket.id}`)"
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
            :is-drag-over="dragOverTicket?.id === ticket.id"
            @dragstart="onDragStart($event, ticket)"
            @dragover="onDragOver($event, ticket)"
            @dragleave="onDragLeave"
            @drop="onDropOnCard($event, ticket)"
            @click="navigateTo(`/tickets/${ticket.id}`)"
          />
        </div>
      </div>
    </div>

    <div v-if="viewMode === 'list' && ticketsStore.pagination && ticketsStore.pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button class="btn-page" :disabled="page <= 1" @click="page--; fetchTickets()">{{ $t('tickets.previous') }}</button>
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tickets.page') }} {{ page }} {{ $t('tickets.of') }} {{ ticketsStore.pagination.totalPages }}</span>
      <button class="btn-page" :disabled="page >= ticketsStore.pagination.totalPages" @click="page++; fetchTickets()">{{ $t('tickets.next') }}</button>
    </div>

    <TicketDetailModal :ticket="selectedTicket" :technicians="technicians" @close="selectedTicket = null" @updated="fetchTickets" @deleted="fetchTickets" />
  </div>
</template>

<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'
import type { Ticket, User, TicketStatus } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import { useToast } from '~/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const { success, error } = useToast()
const selectedTicket = ref<Ticket | null>(null)
const technicians = ref<User[]>([])
const page = ref(1)
const perPage = ref(process.client ? (localStorage.getItem('tickets_per_page') || '10') : '10')
const viewMode = ref<'list' | 'kanban'>(
  process.client ? ((localStorage.getItem('my_tickets_view') as 'list' | 'kanban') || 'list') : 'list'
)
const draggedTicket = ref<Ticket | null>(null)
const dragOverTicket = ref<Ticket | null>(null)

// Save view mode to localStorage
watch(viewMode, (newMode) => {
  if (process.client) {
    localStorage.setItem('my_tickets_view', newMode)
  }
})

const filters = reactive({
  status: '',
  urgent: '',
  technician_id: (route.query.technician_id as string) || '',
})

const statusOptions = computed(() => [
  { value: '', label: t('tickets.allStatuses') },
  { value: 'to_be_worked', label: t('tickets.statusToBeWorked') },
  { value: 'in_progress', label: t('tickets.statusInProgress') },
  { value: 'done', label: t('tickets.statusDone') },
  { value: 'canceled', label: t('tickets.statusCanceled') },
])
const urgencyOptions = computed(() => [
  { value: '', label: t('tickets.allUrgency') },
  { value: 'true', label: t('tickets.urgent') },
  { value: 'false', label: t('tickets.notUrgent') },
])
const techOptions = computed(() => [
  { value: '', label: t('tickets.allTechnicians') },
  ...technicians.value.map(u => ({ value: u.id, label: `${u.name} ${u.family_name}` })),
])
const perPageOptions = [
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
]

watch([filters, perPage], () => {
  page.value = 1
  if (process.client) localStorage.setItem('tickets_per_page', perPage.value)
  fetchTickets()
})

async function fetchTickets() {
  const params: Record<string, string> = { my: 'true' }

  if (viewMode.value === 'list') {
    params.page = String(page.value)
    params.limit = String(perPage.value)
  } else {
    params.limit = '1000'
  }

  if (filters.status) params.status = filters.status
  else if (!auth.isAdmin) params.active = 'true'
  if (filters.urgent) params.urgent = filters.urgent
  if (filters.technician_id) params.technician_id = filters.technician_id
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

function onDragOver(event: DragEvent, ticket: Ticket) {
  event.preventDefault()
  if (draggedTicket.value && draggedTicket.value.id !== ticket.id) {
    dragOverTicket.value = ticket
  }
}

function onDragLeave() {
  dragOverTicket.value = null
}

async function onDropOnCard(event: DragEvent, targetTicket: Ticket) {
  event.preventDefault()
  event.stopPropagation()

  if (!draggedTicket.value || draggedTicket.value.id === targetTicket.id) {
    draggedTicket.value = null
    dragOverTicket.value = null
    return
  }

  const draggedId = draggedTicket.value.id
  const targetId = targetTicket.id

  // If different status, change status
  if (draggedTicket.value.status !== targetTicket.status) {
    try {
      await ticketsStore.updateTicket(draggedTicket.value.id, { status: targetTicket.status } as any)
      success(t('tickets.statusUpdated'))
    } catch (e: any) {
      error(e.data?.statusMessage || t('common.error'))
    }
  } else {
    // Reorder within the same status
    const tickets = ticketsStore.tickets
    const draggedIndex = tickets.findIndex(t => t.id === draggedId)
    const targetIndex = tickets.findIndex(t => t.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = tickets.splice(draggedIndex, 1)
      tickets.splice(targetIndex, 0, removed)
    }
  }

  draggedTicket.value = null
  dragOverTicket.value = null
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

watch(viewMode, () => {
  fetchTickets()
})

onMounted(async () => {
  await fetchTickets()
  if (auth.isAdmin) {
    try { technicians.value = await $fetch<User[]>('/api/users') } catch {}
  }
})

useRealtimeUpdates()
</script>

<style scoped>
.btn-page { @apply px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50; }
</style>
