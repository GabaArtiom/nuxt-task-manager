<template>
  <aside
    :class="[
      'fixed top-0 left-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-60',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 h-16 border-b border-gray-800 flex-shrink-0">
      <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
        <LayoutDashboard class="w-4 h-4 text-white" />
      </div>
      <span v-if="!collapsed" class="font-heading font-bold text-lg truncate">{{ $t('app.name') }}</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 px-2 overflow-y-auto space-y-1">
      <!-- Projects section -->
      <p v-if="!collapsed" class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {{ $t('nav.projects') }}
      </p>

      <NuxtLink
        to="/projects"
        :class="[
          'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors px-3 py-2.5',
          route.path === '/projects' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
        ]"
        :title="$t('nav.myProjects')"
      >
        <FolderKanban class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="truncate">{{ $t('nav.myProjects') }}</span>
      </NuxtLink>

      <NuxtLink
        to="/projects/new"
        :class="[
          'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors py-2',
          collapsed ? 'px-3' : 'pl-9 pr-3',
          route.path === '/projects/new' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
        ]"
        :title="$t('nav.newProject')"
      >
        <PlusCircle class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="truncate">{{ $t('nav.newProject') }}</span>
      </NuxtLink>

      <!-- Project list -->
      <template v-if="!collapsed && projects.length">
        <div class="pt-1 space-y-0.5">
          <NuxtLink
            v-for="project in projects"
            :key="project.id"
            :to="`/projects/${project.id}`"
            :class="[
              'flex items-center gap-2.5 pl-9 pr-3 py-1.5 rounded-lg text-sm transition-colors truncate',
              route.path === `/projects/${project.id}` ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800',
            ]"
            :title="project.name"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
            <span class="truncate">{{ project.name }}</span>
          </NuxtLink>
        </div>
      </template>

      <!-- Users -->
      <template v-if="auth.isAdmin">
        <p v-if="!collapsed" class="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Admin
        </p>
        <NuxtLink
          to="/users"
          :class="[
            'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors px-3 py-2.5',
            route.path === '/users' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
          ]"
          :title="$t('nav.users')"
        >
          <UsersRound class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ $t('nav.users') }}</span>
        </NuxtLink>
      </template>
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-800 p-3 flex-shrink-0">
      <div v-if="!collapsed" class="text-xs text-gray-500 space-y-1">
        <p>© 2026 Task Manager</p>
        <p class="text-gray-600">By <span class="text-primary-400">Artiom</span> & <span class="text-primary-400">Claude</span></p>
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
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  UsersRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const { t } = useI18n()
const collapsed = useState('sidebar-collapsed', () => false)
const mobileOpen = ref(false)
const projects = ref<any[]>([])

onMounted(async () => {
  try {
    projects.value = await $fetch<any[]>('/api/projects')
  } catch {}
})

watch(route, async () => {
  if (route.path === '/projects' || route.path === '/projects/new') {
    try {
      projects.value = await $fetch<any[]>('/api/projects')
    } catch {}
  }
})
</script>
