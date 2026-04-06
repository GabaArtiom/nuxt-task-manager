<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('tickets.myTickets') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ auth.isAdmin ? $t('tickets.mySubtitleAdmin') : $t('tickets.mySubtitleTech') }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2 mb-4">
      <div class="w-40">
        <CustomSelect v-model="filters.status" :options="statusOptions" />
      </div>
      <div class="w-36">
        <CustomSelect v-model="filters.urgent" :options="urgencyOptions" />
      </div>
      <div v-if="auth.isAdmin" class="w-48">
        <CustomSelect v-model="filters.technician_id" :options="techOptions" />
      </div>
    </div>

    <div v-if="ticketsStore.loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>

    <div v-else-if="!ticketsStore.tickets.length" class="text-center py-20">
      <ClipboardList class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('tickets.noTicketsFound') }}</p>
      <NuxtLink to="/tickets" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        {{ $t('tickets.browseOpen') }}
      </NuxtLink>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
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

    <div v-if="ticketsStore.pagination && ticketsStore.pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button class="btn-page" :disabled="page <= 1" @click="page--; fetchTickets()">{{ $t('tickets.previous') }}</button>
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tickets.page') }} {{ page }} {{ $t('tickets.of') }} {{ ticketsStore.pagination.totalPages }}</span>
      <button class="btn-page" :disabled="page >= ticketsStore.pagination.totalPages" @click="page++; fetchTickets()">{{ $t('tickets.next') }}</button>
    </div>

    <TicketDetailModal :ticket="selectedTicket" :technicians="technicians" @close="selectedTicket = null" @updated="fetchTickets" @deleted="fetchTickets" />
  </div>
</template>

<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'
import type { Ticket, User } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const selectedTicket = ref<Ticket | null>(null)
const technicians = ref<User[]>([])
const page = ref(1)
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

watch(filters, () => { page.value = 1; fetchTickets() })

async function fetchTickets() {
  const params: Record<string, string> = { my: 'true', page: String(page.value) }
  if (filters.status) params.status = filters.status
  else if (!auth.isAdmin) params.active = 'true'
  if (filters.urgent) params.urgent = filters.urgent
  if (filters.technician_id) params.technician_id = filters.technician_id
  await ticketsStore.fetchTickets(params)
}

onMounted(async () => {
  await fetchTickets()
  if (auth.isAdmin) {
    try { technicians.value = await $fetch<User[]>('/api/users') } catch {}
  }
})
</script>

<style scoped>
.btn-page { @apply px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50; }
</style>
