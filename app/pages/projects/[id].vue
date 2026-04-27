<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between flex-shrink-0">
      <div>
        <NuxtLink to="/projects" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-2 transition-colors">
          <ArrowLeft class="w-4 h-4" />
          {{ $t('common.back') }}
        </NuxtLink>
        <template v-if="loading">
          <div class="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
          <div class="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </template>
        <template v-else>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ project?.name }}</h2>
          <p v-if="project?.description" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ project.description }}</p>
        </template>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="loading">
          <div class="flex -space-x-2">
            <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse border-2 border-white dark:border-gray-950" />
          </div>
          <div class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </template>
        <template v-else>
          <div class="flex -space-x-2">
            <div
              v-for="m in project?.members?.slice(0, 4)"
              :key="m.user_id"
              class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-950 uppercase"
              :title="`${m.user.name} ${m.user.family_name}`"
            >
              {{ m.user.name[0] }}{{ m.user.family_name[0] }}
            </div>
          </div>
          <button
            v-if="isOwner"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            @click="showSettings = true"
          >
            <Settings class="w-4 h-4" />
            {{ $t('projects.settings') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Board -->
    <div v-if="loading" class="flex gap-4 overflow-x-auto pb-4 items-start">
      <div v-for="i in 3" :key="i" class="flex-shrink-0 w-72">
        <div class="flex items-center gap-2 mb-2 px-1">
          <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div class="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div class="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-2 flex flex-col gap-2">
          <div v-for="j in (i === 1 ? 3 : i === 2 ? 2 : 1)" :key="j" class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div class="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div class="flex items-center justify-between">
              <div class="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div class="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
      <!-- Columns -->
      <div
        v-for="column in project?.columns"
        :key="column.id"
        class="flex-shrink-0 w-72 flex flex-col"
      >
        <!-- Column header -->
        <div class="flex items-center justify-between mb-2 px-1">
          <div class="flex items-center gap-2">
            <h3 class="font-medium text-sm text-gray-900 dark:text-gray-100">{{ column.name }}</h3>
            <span class="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{{ column.tasks.length }}</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="startEditColumn(column)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="isOwner"
              class="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              @click="confirmDeleteColumn(column)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Draggable task list -->
        <div class="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-2 flex flex-col gap-2 min-h-[80px]">
          <draggable
            v-model="column.tasks"
            group="tasks"
            item-key="id"
            class="flex flex-col gap-2 min-h-[40px]"
            ghost-class="opacity-30"
            :animation="200"
            @start="onDragStart"
            @change="(e) => onChange(e, column)"
          >
            <template #item="{ element: task }">
              <div
                class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
                @click="openTask(task, column)"
              >
                <div class="mb-2">
                  <span :class="['text-xs font-medium px-1.5 py-0.5 rounded', priorityClass(task.priority)]">
                    {{ priorityLabel(task.priority) }}
                  </span>
                </div>

                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{{ task.title }}</p>

                <div class="flex items-center justify-between">
                  <div v-if="task.assignee" class="flex items-center gap-1.5">
                    <div class="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-medium uppercase">
                      {{ task.assignee.name[0] }}{{ task.assignee.family_name[0] }}
                    </div>
                    <span class="text-xs text-gray-500">{{ task.assignee.name }}</span>
                  </div>
                  <span v-else class="text-xs text-gray-400 italic">{{ $t('tasks.unassigned') }}</span>
                  <span v-if="task.due_date" class="text-xs text-gray-400">{{ formatDate(task.due_date) }}</span>
                </div>
              </div>
            </template>
          </draggable>

          <!-- Add task button -->
          <button
            class="flex items-center gap-1.5 w-full px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-colors"
            @click="startAddTask(column)"
          >
            <Plus class="w-4 h-4" />
            {{ $t('board.addTask') }}
          </button>
        </div>
      </div>

      <!-- Add column -->
      <div class="flex-shrink-0 w-72">
        <button
          v-if="!showAddColumn"
          class="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
          @click="showAddColumn = true"
        >
          <Plus class="w-4 h-4" />
          {{ $t('board.addColumn') }}
        </button>
        <div v-else class="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3">
          <input
            ref="columnInput"
            v-model="newColumnName"
            type="text"
            :placeholder="$t('board.columnName')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
            @keyup.enter="addColumn"
            @keyup.esc="showAddColumn = false"
          />
          <div class="flex gap-2">
            <button class="flex-1 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors" @click="addColumn">
              {{ $t('common.save') }}
            </button>
            <button class="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300" @click="showAddColumn = false">
              {{ $t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TaskModal
      v-if="selectedTask !== null"
      :task="selectedTask"
      :column="selectedColumn"
      :columns="project?.columns ?? []"
      :members="project?.members ?? []"
      :project-id="projectId"
      @close="selectedTask = null"
      @updated="onTaskUpdated"
      @deleted="deleteTask"
    />

    <AddTaskModal
      v-if="addingToColumn"
      :column="addingToColumn"
      :columns="project?.columns ?? []"
      :members="project?.members ?? []"
      :project-id="projectId"
      @close="addingToColumn = null"
      @created="onTaskCreated"
    />

    <!-- Edit Column Modal -->
    <div v-if="editingColumn" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="editingColumn = null">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 w-full max-w-sm">
        <h3 class="font-heading font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('board.editColumn') }}</h3>
        <input
          v-model="editingColumnName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
          @keyup.enter="saveColumnName"
        />
        <div class="flex gap-2">
          <button class="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors" @click="saveColumnName">{{ $t('common.save') }}</button>
          <button class="flex-1 py-2 border border-gray-300 dark:border-gray-700 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300" @click="editingColumn = null">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <ProjectSettings
      v-if="showSettings && project"
      :project="project"
      @close="showSettings = false"
      @updated="onProjectUpdated"
      @deleted="navigateTo('/projects')"
    />

    <ClientOnly>
      <ConfirmDialog
        v-if="confirmDialog"
        :visible="true"
        :title="confirmDialog.title"
        :message="confirmDialog.message"
        @confirm="confirmDialog.onConfirm(); confirmDialog = null"
        @cancel="confirmDialog = null"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Plus, Pencil, Trash2, X, Settings } from 'lucide-vue-next'
import { format } from 'date-fns'
import { useAuthStore } from '~/stores/auth'
// @ts-ignore
import draggable from 'vuedraggable'
import AddTaskModal from '~/components/projects/AddTaskModal.vue'
import TaskModal from '~/components/projects/TaskModal.vue'
import ProjectSettings from '~/components/projects/ProjectSettings.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { t } = useI18n()
const auth = useAuthStore()
const projectId = route.params.id as string

const project = ref<any>(null)
const loading = ref(true)
const showAddColumn = ref(false)
const newColumnName = ref('')
const columnInput = ref<HTMLInputElement>()
const editingColumn = ref<any>(null)
const editingColumnName = ref('')
const selectedTask = ref<any>(null)
const selectedColumn = ref<any>(null)
const addingToColumn = ref<any>(null)
const showSettings = ref(false)
const confirmDialog = ref<any>(null)

const isOwner = computed(() =>
  project.value?.members?.some((m: any) => m.user_id === auth.user?.id && m.role === 'owner')
)

onMounted(loadProject)

async function loadProject() {
  try {
    project.value = await $fetch<any>(`/api/projects/${projectId}`)
  } catch {
    navigateTo('/projects')
  } finally {
    loading.value = false
  }
}

function onDragStart(event: any) {
  const el = event.item
  const rect = el.getBoundingClientRect()
  const x = event.originalEvent.clientX - rect.left
  const y = event.originalEvent.clientY - rect.top
  event.originalEvent.dataTransfer?.setDragImage(el, x, y)
}

async function onChange(event: any, column: any) {
  if (event.added) {
    const { element: task, newIndex } = event.added
    await $fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
      method: 'PUT',
      body: { column_id: column.id, order: newIndex },
    })
  } else if (event.moved) {
    const { element: task, newIndex } = event.moved
    await $fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
      method: 'PUT',
      body: { column_id: column.id, order: newIndex },
    })
  }
}

async function addColumn() {
  if (!newColumnName.value.trim()) return
  const col = await $fetch<any>(`/api/projects/${projectId}/columns`, {
    method: 'POST',
    body: { name: newColumnName.value.trim() },
  })
  project.value.columns.push({ ...col, tasks: [] })
  newColumnName.value = ''
  showAddColumn.value = false
}

function startEditColumn(column: any) {
  editingColumn.value = column
  editingColumnName.value = column.name
}

async function saveColumnName() {
  if (!editingColumnName.value.trim() || !editingColumn.value) return
  const updated = await $fetch<any>(`/api/projects/${projectId}/columns/${editingColumn.value.id}`, {
    method: 'PUT',
    body: { name: editingColumnName.value.trim() },
  })
  const col = project.value.columns.find((c: any) => c.id === editingColumn.value.id)
  if (col) col.name = updated.name
  editingColumn.value = null
}

function confirmDeleteColumn(column: any) {
  confirmDialog.value = {
    title: t('board.deleteColumn'),
    message: t('board.deleteColumnConfirm'),
    onConfirm: () => deleteColumn(column),
  }
}

async function deleteColumn(column: any) {
  await $fetch(`/api/projects/${projectId}/columns/${column.id}`, { method: 'DELETE' })
  project.value.columns = project.value.columns.filter((c: any) => c.id !== column.id)
}

function startAddTask(column: any) {
  addingToColumn.value = column
}

function openTask(task: any, column: any) {
  selectedTask.value = task
  selectedColumn.value = column
}

function onTaskCreated(task: any) {
  const col = project.value.columns.find((c: any) => c.id === task.column_id)
  if (col) col.tasks.push(task)
  addingToColumn.value = null
}

function onTaskUpdated(updated: any) {
  for (const col of project.value.columns) {
    const idx = col.tasks.findIndex((t: any) => t.id === updated.id)
    if (idx !== -1) {
      if (updated.column_id !== col.id) {
        col.tasks.splice(idx, 1)
        const newCol = project.value.columns.find((c: any) => c.id === updated.column_id)
        if (newCol) newCol.tasks.push(updated)
      } else {
        col.tasks[idx] = updated
      }
      break
    }
  }
  selectedTask.value = updated
  selectedColumn.value = project.value.columns.find((c: any) => c.id === updated.column_id)
}

function confirmDeleteTask(task: any) {
  confirmDialog.value = {
    title: t('tasks.delete'),
    message: t('tasks.deleteConfirm'),
    onConfirm: () => deleteTask(task),
  }
}

async function deleteTask(taskOrId: any) {
  const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.id
  await $fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
  onTaskDeleted(taskId)
}

function onTaskDeleted(taskId: string) {
  for (const col of project.value.columns) {
    const idx = col.tasks.findIndex((t: any) => t.id === taskId)
    if (idx !== -1) { col.tasks.splice(idx, 1); break }
  }
  selectedTask.value = null
}

function onProjectUpdated(updated: any) {
  project.value.name = updated.name
  project.value.description = updated.description
}

function priorityClass(priority: string) {
  return {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    medium: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    high: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
    urgent: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
  }[priority] ?? 'bg-gray-100 text-gray-600'
}

function priorityLabel(priority: string) {
  return {
    low: t('tasks.priorityLow'),
    medium: t('tasks.priorityMedium'),
    high: t('tasks.priorityHigh'),
    urgent: t('tasks.priorityUrgent'),
  }[priority] ?? priority
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM d')
}

watch(showAddColumn, async (val) => {
  if (val) {
    await nextTick()
    columnInput.value?.focus()
  }
})
</script>
