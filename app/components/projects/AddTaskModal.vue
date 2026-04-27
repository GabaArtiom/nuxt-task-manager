<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('board.addTask') }}</h3>
        <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="$emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.title') }} *</label>
          <input
            ref="titleInput"
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.description') }}</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.priority') }}</label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">{{ $t('tasks.priorityLow') }}</option>
              <option value="medium">{{ $t('tasks.priorityMedium') }}</option>
              <option value="high">{{ $t('tasks.priorityHigh') }}</option>
              <option value="urgent">{{ $t('tasks.priorityUrgent') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.dueDate') }}</label>
            <input
              v-model="form.due_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.assignTo') }}</label>
          <select
            v-model="form.assigned_to"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{{ $t('tasks.unassigned') }}</option>
            <option v-for="m in members" :key="m.user_id" :value="m.user_id">
              {{ m.user.name }} {{ m.user.family_name }}
            </option>
          </select>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            @click="$emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading || !form.title.trim()"
            class="flex-1 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {{ loading ? $t('tasks.creating') : $t('tasks.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{
  column: any
  columns: any[]
  members: any[]
  projectId: string
}>()

const emit = defineEmits<{
  close: []
  created: [task: any]
}>()

const titleInput = ref<HTMLInputElement>()
const loading = ref(false)
const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
})

onMounted(() => nextTick(() => titleInput.value?.focus()))

async function submit() {
  if (!form.title.trim()) return
  loading.value = true
  try {
    const task = await $fetch<any>(`/api/projects/${props.projectId}/tasks`, {
      method: 'POST',
      body: {
        ...form,
        column_id: props.column.id,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      },
    })
    emit('created', task)
  } finally {
    loading.value = false
  }
}
</script>
