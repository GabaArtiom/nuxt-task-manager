<template>
  <div class="max-w-lg mx-auto">
    <div class="mb-8">
      <NuxtLink to="/projects" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors">
        <ArrowLeft class="w-4 h-4" />
        {{ $t('common.back') }}
      </NuxtLink>
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('projects.new') }}</h2>
    </div>

    <form class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('projects.name') }} *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('projects.description') }}</label>
        <textarea
          v-model="form.description"
          rows="3"
          :placeholder="$t('projects.descriptionPlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
        />
      </div>

      <div class="flex gap-3 pt-2">
        <NuxtLink
          to="/projects"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
        >
          {{ $t('common.cancel') }}
        </NuxtLink>
        <button
          type="submit"
          :disabled="loading || !form.name.trim()"
          class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {{ loading ? $t('projects.creating') : $t('projects.create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const form = reactive({ name: '', description: '' })
const loading = ref(false)

async function submit() {
  if (!form.name.trim()) return
  loading.value = true
  try {
    const project = await $fetch<any>('/api/projects', {
      method: 'POST',
      body: form,
    })
    navigateTo(`/projects/${project.id}`)
  } catch {
    loading.value = false
  }
}
</script>
