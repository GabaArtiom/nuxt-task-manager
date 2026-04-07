<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('dashboard.title') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('dashboard.subtitle') }}</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          :value="stats?.unassigned ?? 0"
          :label="$t('dashboard.unassigned')"
          :icon="AlertTriangle"
          border-color="border-l-red-500"
          icon-bg="bg-red-50 dark:bg-red-950"
          icon-color="text-red-600"
        />
        <StatCard
          :value="stats?.todo ?? 0"
          :label="auth.isAdmin ? $t('dashboard.toBeWorkedAll') : $t('dashboard.toBeWorkedMine')"
          :icon="Timer"
          border-color="border-l-amber-500"
          icon-bg="bg-amber-50 dark:bg-amber-950"
          icon-color="text-amber-600"
        />
        <StatCard
          :value="stats?.in_progress ?? 0"
          :label="auth.isAdmin ? $t('dashboard.inProgressAll') : $t('dashboard.inProgressMine')"
          :icon="Zap"
          border-color="border-l-blue-500"
          icon-bg="bg-blue-50 dark:bg-blue-950"
          icon-color="text-blue-600"
        />
      </div>

      <div v-if="auth.isAdmin && stats?.by_technician?.length" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('dashboard.byTechnician') }}</h3>
        </div>
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs font-medium text-gray-500 uppercase">
              <th class="px-6 py-3">{{ $t('nav.users') }}</th>
              <th class="px-6 py-3">{{ $t('tickets.statusToBeWorked') }}</th>
              <th class="px-6 py-3">{{ $t('tickets.statusInProgress') }}</th>
              <th class="px-6 py-3">{{ $t('tickets.statusDone') }}</th>
              <th class="px-6 py-3">{{ $t('tickets.statusCanceled') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr
              v-for="tech in stats.by_technician"
              :key="tech.user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              @click="navigateTo(`/tickets/my?technician_id=${tech.user.id}`)"
            >
              <td class="px-6 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">{{ tech.user.name }} {{ tech.user.family_name }}</td>
              <td class="px-6 py-3"><span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-sm font-semibold">{{ tech.to_be_worked }}</span></td>
              <td class="px-6 py-3"><span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-sm font-semibold">{{ tech.in_progress }}</span></td>
              <td class="px-6 py-3"><span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold">{{ tech.done }}</span></td>
              <td class="px-6 py-3"><span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold">{{ tech.canceled }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Timer, Zap } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import type { DashboardStats } from '~/types'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const stats = ref<DashboardStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    stats.value = await $fetch<DashboardStats>('/api/dashboard')
  } catch {} finally {
    loading.value = false
  }
})
</script>
