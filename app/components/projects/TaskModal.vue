<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">

      <!-- Header: title + close -->
      <div class="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <input
          v-model="form.title"
          class="flex-1 text-xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-0 outline-none placeholder-gray-300 dark:placeholder-gray-600"
          placeholder="Task title…"
        />
        <button
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex flex-1 min-h-0">

        <!-- Left: description + checklist -->
        <div class="flex-1 min-w-0 flex flex-col">
          <div class="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            <BlockEditor v-model="form.description" />
          </div>

          <div class="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 py-4">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div>
                <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{{ $t('tasks.checklist') }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{{ checklistSummary }}</div>
              </div>
              <button
                type="button"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-primary-600 hover:text-white transition-colors"
                :title="$t('tasks.addChecklistItem')"
                @click="addChecklistItem"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <div v-if="form.checklist.length" class="space-y-2">
              <div
                v-for="item in form.checklist"
                :key="item.id"
                class="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 px-2.5 py-2"
              >
                <input
                  v-model="item.checked"
                  type="checkbox"
                  class="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-primary-600 accent-primary-600"
                />
                <input
                  v-model="item.title"
                  type="text"
                  :data-checklist-input="item.id"
                  :placeholder="$t('tasks.checklistItemPlaceholder')"
                  :class="[
                    'min-w-0 flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:placeholder-gray-600',
                    item.checked ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200',
                  ]"
                  @keydown.enter.prevent="addChecklistItem"
                />
                <button
                  type="button"
                  class="flex-shrink-0 rounded-md p-1 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                  :title="$t('common.delete')"
                  @click="removeChecklistItem(item.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <button
              v-else
              type="button"
              class="w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-3 py-3 text-left text-sm text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              @click="addChecklistItem"
            >
              {{ $t('tasks.emptyChecklist') }}
            </button>
          </div>
        </div>

        <!-- Right: sidebar -->
        <div class="w-56 flex-shrink-0 border-l border-gray-100 dark:border-gray-800 overflow-y-auto px-4 py-5 space-y-5">

          <!-- Assignee -->
          <div>
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{{ $t('tasks.assignTo') }}</div>
            <div class="space-y-0.5">
              <button
                :class="[
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors',
                  !form.assigned_to
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                ]"
                @click="form.assigned_to = ''"
              >
                <span class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">—</span>
                <span class="truncate text-xs">{{ $t('tasks.unassigned') }}</span>
              </button>
              <button
                v-for="m in members"
                :key="m.user_id"
                :class="[
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-colors',
                  form.assigned_to === m.user_id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                ]"
                @click="form.assigned_to = m.user_id"
              >
                <span class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {{ initials(m.user) }}
                </span>
                <span class="truncate text-xs">{{ m.user.name }} {{ m.user.family_name }}</span>
              </button>
            </div>
          </div>

          <!-- Priority -->
          <div>
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{{ $t('tasks.priority') }}</div>
            <div class="grid grid-cols-2 gap-1">
              <button
                v-for="p in PRIORITIES"
                :key="p.value"
                :class="[
                  'px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-center',
                  form.priority === p.value
                    ? p.activeClass
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                ]"
                @click="form.priority = p.value"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Due date -->
          <div>
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{{ $t('tasks.dueDate') }}</div>
            <input
              v-model="form.due_date"
              type="date"
              class="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Created by -->
          <div>
            <div class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{{ $t('tasks.createdBy') }}</div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                {{ task.creator ? initials(task.creator) : '?' }}
              </span>
              <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ task.creator?.name }} {{ task.creator?.family_name }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
          @click="$emit('deleted', task.id)"
        >
          <Trash2 class="w-4 h-4" />
          {{ $t('tasks.delete') }}
        </button>
        <div class="flex-1" />
        <button
          class="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
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
import { X, Trash2, Plus } from 'lucide-vue-next'
import { format } from 'date-fns'
import BlockEditor from './BlockEditor.vue'

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

const { t } = useI18n()

const PRIORITIES = [
  { value: 'low', label: 'Low', activeClass: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  { value: 'high', label: 'High', activeClass: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' },
  { value: 'urgent', label: 'Urgent', activeClass: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
]

interface ChecklistItem {
  id: string
  title: string
  checked: boolean
}

function initials(user: { name?: string; family_name?: string }): string {
  return ((user.name?.[0] ?? '') + (user.family_name?.[0] ?? '')).toUpperCase() || '?'
}

const saving = ref(false)
const form = reactive({
  title: props.task.title,
  description: props.task.description ?? '',
  checklist: normalizeChecklist(props.task.checklist),
  priority: props.task.priority,
  assigned_to: props.task.assigned_to ?? '',
  due_date: props.task.due_date ? format(new Date(props.task.due_date), 'yyyy-MM-dd') : '',
})

const checklistSummary = computed(() => {
  if (!form.checklist.length) return t('tasks.noChecklistItems')
  const completed = form.checklist.filter((item) => item.checked).length
  return t('tasks.checklistProgress', { completed, total: form.checklist.length })
})

function normalizeChecklist(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => ({
      id: String(item.id || uid()),
      title: String(item.title || ''),
      checked: Boolean(item.checked),
    }))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

async function addChecklistItem() {
  const item = { id: uid(), title: '', checked: false }
  form.checklist.push(item)
  await nextTick()
  const input = document.querySelector<HTMLInputElement>(`[data-checklist-input="${item.id}"]`)
  input?.focus()
}

function removeChecklistItem(itemId: string) {
  form.checklist = form.checklist.filter((item) => item.id !== itemId)
}

async function save() {
  saving.value = true
  try {
    const updated = await $fetch<any>(`/api/projects/${props.projectId}/tasks/${props.task.id}`, {
      method: 'PUT',
      body: {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        checklist: form.checklist,
      },
    })
    emit('updated', updated)
  } finally {
    saving.value = false
  }
}
</script>
