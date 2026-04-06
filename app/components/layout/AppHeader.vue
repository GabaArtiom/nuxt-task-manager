<template>
  <header class="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
    <div>
      <h1 class="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">{{ pageTitle }}</h1>
    </div>
    <div class="flex items-center gap-3">
      <!-- Language switcher -->
      <button
        class="px-2 py-1 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="toggleLocale"
      >
        {{ locale === 'en' ? 'IT' : 'EN' }}
      </button>

      <!-- Theme toggle -->
      <ClientOnly>
        <button
          class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :title="isDark ? $t('theme.light') : $t('theme.dark')"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>
      </ClientOnly>

      <span class="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{{ auth.user?.name }} {{ auth.user?.family_name }}</span>
      <span
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          auth.isAdmin ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        ]"
      >
        {{ auth.user?.role }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const { locale, setLocale, t } = useI18n()
const { isDark, toggle: toggleTheme } = useTheme()

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'it' : 'en')
}

const pageTitleKeys: Record<string, string> = {
  '/': 'dashboard.title',
  '/tickets': 'tickets.openTickets',
  '/tickets/new': 'tickets.create',
  '/tickets/my': 'tickets.myTickets',
  '/users': 'users.title',
  '/stats': 'stats.title',
}

const pageTitle = computed(() => {
  const key = pageTitleKeys[route.path]
  return key ? t(key) : 'Tickets'
})
</script>
