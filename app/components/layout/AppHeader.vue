<template>
  <header class="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
    <div>
      <h1 class="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">{{ pageTitle }}</h1>
    </div>
    <div class="flex items-center gap-3">
      <!-- Language switcher -->
      <div class="relative">
        <button
          ref="langButtonRef"
          @click="langDropdownOpen = !langDropdownOpen"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Languages class="w-4 h-4" />
          <span>{{ locale === 'en' ? 'English' : 'Italiano' }}</span>
          <ChevronDown class="w-3 h-3" />
        </button>

        <Teleport to="body">
          <div
            v-if="langDropdownOpen"
            class="fixed inset-0 z-30"
            @click="langDropdownOpen = false"
          />
          <div
            v-if="langDropdownOpen"
            :style="langDropdownStyle"
            class="fixed z-40 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <button
              @click="setLocale('en'); langDropdownOpen = false"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
              :class="locale === 'en' && 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'"
            >
              <span>English</span>
              <Check v-if="locale === 'en'" class="w-4 h-4" />
            </button>
            <button
              @click="setLocale('it'); langDropdownOpen = false"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
              :class="locale === 'it' && 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'"
            >
              <span>Italiano</span>
              <Check v-if="locale === 'it'" class="w-4 h-4" />
            </button>
          </div>
        </Teleport>
      </div>

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

      <!-- User info -->
      <div class="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ auth.user?.name }} {{ auth.user?.family_name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ auth.user?.role }}</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold text-white shadow-lg">
          {{ userInitials }}
        </div>
        <button
          class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :title="$t('auth.logout')"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Sun, Moon, Languages, ChevronDown, Check, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const { locale, setLocale, t } = useI18n()
const { isDark, toggle: toggleTheme } = useTheme()
const langDropdownOpen = ref(false)
const langButtonRef = ref<HTMLElement | null>(null)

const langDropdownStyle = computed(() => {
  if (!langButtonRef.value) return {}
  const rect = langButtonRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
})

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

const userInitials = computed(() => {
  if (!auth.user) return '?'
  return (auth.user.name[0] + auth.user.family_name[0]).toUpperCase()
})

function handleLogout() {
  if (confirm(t('auth.logoutConfirm'))) {
    auth.logout()
  }
}
</script>
