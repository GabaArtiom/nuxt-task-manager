<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('projects.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('projects.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/projects/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <PlusCircle class="w-4 h-4" />
        {{ $t('projects.new') }}
      </NuxtLink>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div class="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div class="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div class="flex gap-4">
          <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <div v-else-if="!projects.length" class="flex flex-col items-center justify-center py-24 text-center">
      <FolderKanban class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ $t('projects.noProjects') }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ $t('projects.noProjectsSubtitle') }}</p>
      <NuxtLink
        to="/projects/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <PlusCircle class="w-4 h-4" />
        {{ $t('projects.new') }}
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
            <FolderKanban class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {{ myRole(project) }}
          </span>
        </div>

        <h3 class="font-heading font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
          {{ project.name }}
        </h3>
        <p v-if="project.description" class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {{ project.description }}
        </p>
        <p v-else class="text-sm text-gray-400 dark:text-gray-600 italic mb-4">No description</p>

        <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <Users class="w-3.5 h-3.5" />
            {{ project.members.length }} {{ $t('projects.members') }}
          </span>
          <span class="flex items-center gap-1">
            <CheckSquare class="w-3.5 h-3.5" />
            {{ project._count.tasks }} {{ $t('projects.tasks') }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusCircle, FolderKanban, Users, CheckSquare } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const projects = ref<any[]>([])
const loading = ref(true)
let eventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  loadProjects()
  connectProjectListRealtime()
})

onUnmounted(() => {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  eventSource?.close()
  eventSource = null
})

async function loadProjects() {
  try {
    projects.value = await $fetch<any[]>('/api/projects')
  } catch {} finally {
    loading.value = false
  }
}

function connectProjectListRealtime() {
  if (import.meta.server) return
  eventSource = new EventSource('/sse')

  eventSource.onmessage = (event) => {
    if (!event.data) return
    try {
      const { type, data } = JSON.parse(event.data)
      if (type === 'connected') return
      applyProjectListEvent(type, data)
    } catch {}
  }

  eventSource.onerror = () => {
    eventSource?.close()
    eventSource = null
    reconnectTimer = setTimeout(connectProjectListRealtime, 3000)
  }
}

function applyProjectListEvent(type: string, data: any) {
  if (type === 'project:list:upsert') {
    const idx = projects.value.findIndex((project) => project.id === data.project.id)
    if (idx === -1) projects.value.unshift(data.project)
    else projects.value[idx] = { ...projects.value[idx], ...data.project }
    return
  }

  if (type === 'project:list:remove') {
    projects.value = projects.value.filter((project) => project.id !== data.project_id)
  }
}

function myRole(project: any) {
  const m = project.members.find((m: any) => m.user_id === auth.user?.id)
  return m?.role ?? 'member'
}
</script>
