<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('tickets.openTickets') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('tickets.openSubtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="auth.isAdmin && !bulkMode"
          @click="bulkMode = true"
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <CheckSquare class="w-4 h-4" />
          {{ $t('tickets.selectMode') }}
        </button>
        <button
          v-if="auth.isAdmin && bulkMode && selectedTickets.length === 0"
          @click="bulkMode = false; selectedTickets = []"
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <X class="w-4 h-4" />
          {{ $t('common.cancel') }}
        </button>
        <button
          v-if="auth.isAdmin && bulkMode && selectedTickets.length > 0"
          @click="showBulkDeleteConfirm = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
          {{ $t('tickets.deleteSelected') }} ({{ selectedTickets.length }})
        </button>
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
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <div v-if="auth.isAdmin" class="w-40">
        <CustomSelect v-model="filters.view" :options="viewOptions" />
      </div>
      <div class="w-40">
        <CustomSelect v-model="filters.status" :options="statusOptions" />
      </div>
      <div class="w-36">
        <CustomSelect v-model="filters.type" :options="typeOptions" />
      </div>
      <div class="w-36">
        <CustomSelect v-model="filters.urgent" :options="urgencyOptions" />
      </div>
      <div class="w-24">
        <CustomSelect v-model="perPage" :options="perPageOptions" />
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

    <div v-else-if="!ticketsStore.tickets.length" class="text-center py-20">
      <InboxIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('tickets.noTickets') }}</p>
      <NuxtLink to="/tickets/new" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        {{ $t('tickets.createTicket') }}
      </NuxtLink>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th v-if="bulkMode" class="py-2.5 pl-4 pr-2 w-10">
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="sr-only peer"
                />
                <div class="relative w-5 h-5 bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500 rounded peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all peer-hover:border-primary-500">
                  <svg class="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </label>
            </th>
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
          <TicketRow
            v-for="ticket in ticketsStore.tickets"
            :key="ticket.id"
            :ticket="ticket"
            :show-checkbox="bulkMode"
            :is-selected="selectedTickets.includes(ticket.id)"
            @edit="selectedTicket = ticket"
            @toggle-select="toggleTicketSelection"
          />
        </tbody>
      </table>
    </div>

    <div v-if="ticketsStore.pagination && ticketsStore.pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button class="btn-page" :disabled="page <= 1" @click="page--; fetchTickets()">{{ $t('tickets.previous') }}</button>
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tickets.page') }} {{ page }} {{ $t('tickets.of') }} {{ ticketsStore.pagination.totalPages }}</span>
      <button class="btn-page" :disabled="page >= ticketsStore.pagination.totalPages" @click="page++; fetchTickets()">{{ $t('tickets.next') }}</button>
    </div>

    <TicketDetailModal :ticket="selectedTicket" :technicians="technicians" @close="selectedTicket = null" @updated="fetchTickets" @deleted="fetchTickets" />

    <ConfirmDialog
      :visible="showBulkDeleteConfirm"
      :title="$t('tickets.deleteTitle')"
      :message="$t('tickets.confirmBulkDelete', { count: selectedTickets.length })"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      variant="danger"
      @confirm="bulkDelete"
      @cancel="showBulkDeleteConfirm = false"
    />

    <ToastNotification
      :visible="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      @close="closeNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Inbox as InboxIcon, Trash2, CheckSquare, X } from 'lucide-vue-next'
import type { Ticket, User } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import { useToast } from '~/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()
const selectedTicket = ref<Ticket | null>(null)
const technicians = ref<User[]>([])
const page = ref(1)
const perPage = ref(process.client ? (localStorage.getItem('tickets_per_page') || '10') : '10')
const selectedTickets = ref<string[]>([])
const bulkMode = ref(false)
const showBulkDeleteConfirm = ref(false)

// Initialize filters from URL query params
const filters = reactive({
  view: (route.query.view as string) || 'all',
  status: (route.query.status as string) || '',
  type: (route.query.type as string) || '',
  urgent: (route.query.urgent as string) || '',
})

const viewOptions = computed(() => [
  { value: 'all', label: t('tickets.allTickets') },
  { value: 'unassigned', label: t('tickets.unassignedOnly') },
])
const statusOptions = computed(() => [
  { value: '', label: t('tickets.allStatuses') },
  { value: 'to_be_worked', label: t('tickets.statusToBeWorked') },
  { value: 'in_progress', label: t('tickets.statusInProgress') },
  { value: 'done', label: t('tickets.statusDone') },
  { value: 'canceled', label: t('tickets.statusCanceled') },
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
const perPageOptions = [
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
]

const hasActiveFilters = computed(() => {
  return filters.view !== 'all' || filters.status !== '' || filters.type !== '' || filters.urgent !== ''
})

function clearFilters() {
  filters.view = 'all'
  filters.status = ''
  filters.type = ''
  filters.urgent = ''
}

// Debounced filters watcher
let debounceTimeout: NodeJS.Timeout | null = null
watch([filters, perPage], () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    page.value = 1
    if (process.client) localStorage.setItem('tickets_per_page', perPage.value)
    updateURLParams()
    fetchTickets()
  }, 300)
})

function updateURLParams() {
  const query: Record<string, string> = {}
  if (filters.view !== 'all') query.view = filters.view
  if (filters.status) query.status = filters.status
  if (filters.type) query.type = filters.type
  if (filters.urgent) query.urgent = filters.urgent
  router.replace({ query })
}

async function fetchTickets() {
  const params: Record<string, string> = { page: String(page.value), limit: String(perPage.value) }
  if (filters.view === 'unassigned') {
    params.unassigned = 'true'
    if (!filters.status) params.status = 'to_be_worked'
  }
  if (filters.status) params.status = filters.status
  if (filters.type) params.type = filters.type
  if (filters.urgent) params.urgent = filters.urgent
  await ticketsStore.fetchTickets(params)
  selectedTickets.value = []
}

const allSelected = computed(() => {
  return ticketsStore.tickets.length > 0 && selectedTickets.value.length === ticketsStore.tickets.length
})

function toggleSelectAll() {
  if (allSelected.value) {
    selectedTickets.value = []
  } else {
    selectedTickets.value = ticketsStore.tickets.map(t => t.id)
  }
}

function toggleTicketSelection(id: string) {
  const idx = selectedTickets.value.indexOf(id)
  if (idx > -1) {
    selectedTickets.value.splice(idx, 1)
  } else {
    selectedTickets.value.push(id)
  }
}

async function bulkDelete() {
  showBulkDeleteConfirm.value = false

  try {
    await Promise.all(
      selectedTickets.value.map(id => $fetch(`/api/tickets/${id}`, { method: 'DELETE' }))
    )
    success(t('tickets.bulkDeleteSuccess', { count: selectedTickets.value.length }))
    await fetchTickets()
  } catch (err) {
    error(t('common.error'))
  }
}

onMounted(async () => {
  await fetchTickets()
  if (auth.isAdmin) {
    try { technicians.value = await $fetch<User[]>('/api/users') } catch {}
  }
})

const { showNotification, notificationMessage, notificationType, closeNotification } = useRealtimeUpdates()
</script>

<style scoped>
.btn-page {
  @apply px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50;
}
</style>
