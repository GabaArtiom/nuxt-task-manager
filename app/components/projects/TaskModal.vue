<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('tasks.edit') }}</h3>
        <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="$emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.title') }}</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('tasks.description') }}</label>
          <textarea
            v-model="form.description"
            rows="4"
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

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Column</label>
          <select
            v-model="form.column_id"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.name }}</option>
          </select>
        </div>

        <div class="text-xs text-gray-400 dark:text-gray-600 pt-1">
          {{ $t('tasks.createdBy') }}: {{ task.creator?.name }} {{ task.creator?.family_name }}
        </div>
      </div>

      <div class="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
          @click="$emit('deleted', task.id)"
        >
          <Trash2 class="w-4 h-4" />
          {{ $t('tasks.delete') }}
        </button>
        <div class="flex-1" />
        <button
          class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          @click="$emit('close')"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          :disabled="saving"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          @click="save"
        >
          {{ saving ? $t('common.loading') : $t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, Trash2 } from 'lucide-vue-next'
import { format } from 'date-fns'

const props = defineProps<{
  task: any
  column: any
  columns: any[]
  members: any[]
  projectId: string
}>()

const emit = defineEmits<{
  close: []
  updated: [task: any]
  deleted: [taskId: string]
}>()

const saving = ref(false)
const form = reactive({
  title: props.task.title,
  description: props.task.description ?? '',
  priority: props.task.priority,
  assigned_to: props.task.assigned_to ?? '',
  due_date: props.task.due_date ? format(new Date(props.task.due_date), 'yyyy-MM-dd') : '',
  column_id: props.task.column_id,
})

async function save() {
  saving.value = true
  try {
    const updated = await $fetch<any>(`/api/projects/${props.projectId}/tasks/${props.task.id}`, {
      method: 'PUT',
      body: {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      },
    })
    emit('updated', updated)
  } finally {
    saving.value = false
  }
}
</script>
