<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('stats.title') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('stats.subtitle') }}</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-3 mb-6">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('stats.from') }}</label>
        <input v-model="filters.from" type="date" class="input-field" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('stats.to') }}</label>
        <input v-model="filters.to" type="date" class="input-field" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('tickets.status') }}</label>
        <CustomSelect
          v-model="filters.status"
          :options="statusOptions"
        />
      </div>
      <div v-if="auth.isAdmin">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{{ $t('stats.completedBy') }}</label>
        <CustomSelect
          v-model="filters.technician_id"
          :options="techOptions"
        />
      </div>
      <button
        class="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all duration-150"
        @click="fetchStats"
      >
        {{ $t('stats.apply') }}
      </button>
    </div>

    <!-- Summary badges -->
    <div v-if="data" class="flex items-center gap-3 mb-5">
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
        <CheckCircle class="w-3.5 h-3.5" />
        {{ data.counts.done }} {{ $t('stats.done') }}
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <XCircle class="w-3.5 h-3.5" />
        {{ data.counts.canceled }} {{ $t('stats.canceled') }}
      </span>
      <span class="text-xs text-gray-400 dark:text-gray-500">
        {{ data.counts.total }} {{ $t('stats.totalResults') }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data?.tickets.length" class="text-center py-20">
      <ClipboardList class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('tickets.noTicketsFound') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th class="py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('tickets.customerName') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">{{ $t('tickets.date') }}</th>
            <th v-if="auth.isAdmin" class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">{{ $t('stats.completedBy') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">{{ $t('tickets.type') }}</th>
            <th class="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('tickets.status') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
          <tr
            v-for="ticket in data.tickets"
            :key="ticket.id"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            @click="navigateTo(`/tickets/${ticket.id}`)"
          >
            <td class="py-3 pl-4 pr-3">
              <div class="flex items-center gap-3">
                <div :class="['w-1 h-8 rounded-full flex-shrink-0', ticket.status === 'done' ? 'bg-green-500' : 'bg-gray-400']" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ ticket.customer_name }}</p>
                  <p v-if="ticket.description" class="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{{ ticket.description }}</p>
                </div>
              </div>
            </td>
            <td class="py-3 px-3 hidden md:table-cell">
              <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ formatDate(ticket.updated_at) }}</span>
            </td>
            <td v-if="auth.isAdmin" class="py-3 px-3 hidden lg:table-cell">
              <span v-if="ticket.assignee" class="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {{ ticket.assignee.name }} {{ ticket.assignee.family_name }}
              </span>
              <span v-else class="text-xs text-gray-400 dark:text-gray-600 italic">—</span>
            </td>
            <td class="py-3 px-3 hidden sm:table-cell">
              <TicketTypeBadge :type="ticket.type" />
            </td>
            <td class="py-3 px-3">
              <TicketStatusBadge :status="ticket.status" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="data?.pagination && data.pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button class="btn-page" :disabled="page <= 1" @click="page--; fetchStats()">{{ $t('tickets.previous') }}</button>
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tickets.page') }} {{ page }} {{ $t('tickets.of') }} {{ data.pagination.totalPages }}</span>
      <button class="btn-page" :disabled="page >= data.pagination.totalPages" @click="page++; fetchStats()">{{ $t('tickets.next') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, ClipboardList } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { format } from 'date-fns'
import type { Ticket, User } from '~/types'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()

const loading = ref(true)
const page = ref(1)
const data = ref<{ tickets: Ticket[]; counts: { done: number; canceled: number; total: number }; pagination: any } | null>(null)
const technicians = ref<User[]>([])

const filters = reactive({ from: '', to: '', status: '', technician_id: '' })

const statusOptions = computed(() => [
  { value: '', label: t('stats.allCompleted') },
  { value: 'done', label: t('stats.done') },
  { value: 'canceled', label: t('stats.canceled') },
])

const techOptions = computed(() => [
  { value: '', label: t('tickets.allTechnicians') },
  ...technicians.value.map(u => ({ value: u.id, label: `${u.name} ${u.family_name}` })),
])

function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

async function fetchStats() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', String(page.value))
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.status) params.set('status', filters.status)
    if (filters.technician_id) params.set('technician_id', filters.technician_id)
    data.value = await $fetch(`/api/stats?${params.toString()}`)
  } catch {} finally { loading.value = false }
}

onMounted(async () => {
  await fetchStats()
  if (auth.isAdmin) {
    try { technicians.value = await $fetch<User[]>('/api/users') } catch {}
  }
})
</script>

<style scoped>
.input-field {
  @apply px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-150;
  @apply focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500;
}
.btn-page {
  @apply px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50;
}
</style>
