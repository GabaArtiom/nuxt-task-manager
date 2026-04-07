<template>
  <aside
    :class="[
      'fixed top-0 left-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-60',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 h-16 border-b border-gray-800">
      <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
        <Zap class="w-4 h-4 text-white" />
      </div>
      <span v-if="!collapsed" class="font-heading font-bold text-lg truncate">{{ $t('app.name') }}</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      <template v-for="item in navItems" :key="item.to">
        <p
          v-if="item.section && !collapsed"
          class="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500"
        >
          {{ item.section }}
        </p>

        <NuxtLink
          :to="item.to"
          :class="[
            'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
            item.indent && !collapsed ? 'pl-9 pr-3 py-2' : 'px-3 py-2.5',
            isActive(item.to)
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800',
          ]"
          :title="item.label"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </template>
    </nav>

    <!-- User info + logout -->
    <div class="border-t border-gray-800 p-3">
      <div class="flex items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
            {{ userInitials }}
          </div>
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate text-white">{{ auth.user?.name }} {{ auth.user?.family_name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ auth.user?.role }}</p>
          </div>
        </div>
        <button
          v-if="!collapsed"
          class="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded-lg"
          :title="$t('auth.logout')"
          @click="auth.logout()"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>

      <div v-if="!collapsed" class="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-800">
        <p>© 2026 Ticket Manager Challenge</p>
        <p class="text-gray-600">Created by <span class="text-primary-400">Artiom</span> and <span class="text-primary-400">Claude</span></p>
      </div>
    </div>

    <!-- Collapse toggle -->
    <button
      class="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
      @click="collapsed = !collapsed"
    >
      <ChevronLeft v-if="!collapsed" class="w-3.5 h-3.5" />
      <ChevronRight v-else class="w-3.5 h-3.5" />
    </button>
  </aside>

  <div
    v-if="mobileOpen"
    class="fixed inset-0 bg-black/50 z-30 md:hidden"
    @click="mobileOpen = false"
  />
</template>

<script setup lang="ts">
import {
  Ticket,
  LayoutDashboard,
  TicketPlus,
  ClipboardList,
  BarChart3,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ListChecks,
  TrendingUp,
  UsersRound,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const { t } = useI18n()
const collapsed = useState('sidebar-collapsed', () => false)
const mobileOpen = ref(false)

const userInitials = computed(() => {
  if (!auth.user) return '?'
  return (auth.user.name[0] + auth.user.family_name[0]).toUpperCase()
})

const navItems = computed(() => {
  const items: { to: string; label: string; icon: any; section?: string; indent?: boolean }[] = [
    { to: '/', label: t('nav.dashboard'), icon: Sparkles },
    { to: '/tickets', label: t('nav.allTickets'), icon: ListChecks, section: t('nav.tickets') },
    { to: '/tickets/new', label: t('nav.newTicket'), icon: Zap, indent: true },
    { to: '/tickets/my', label: t('nav.myTickets'), icon: ClipboardList, indent: true },
    { to: '/stats', label: t('nav.stats'), icon: TrendingUp },
  ]
  if (auth.isAdmin) {
    items.push({ to: '/users', label: t('nav.users'), icon: UsersRound })
  }
  return items
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
