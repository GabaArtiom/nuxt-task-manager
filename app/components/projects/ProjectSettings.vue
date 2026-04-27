<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('projects.settings') }}</h3>
        <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="$emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-6">
        <!-- Edit project name/description -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('projects.name') }}</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ $t('projects.description') }}</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <button
            :disabled="saving"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            @click="saveProject"
          >
            {{ saving ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>

        <!-- Members -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{{ $t('projects.members') }}</h4>
          <div class="space-y-2 mb-3">
            <div
              v-for="m in project.members"
              :key="m.user_id"
              class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium uppercase">
                  {{ m.user.name[0] }}{{ m.user.family_name[0] }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ m.user.name }} {{ m.user.family_name }}</p>
                  <p class="text-xs text-gray-500">{{ m.user.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="m.role === 'owner' ? 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'">
                  {{ m.role }}
                </span>
                <button
                  v-if="m.role !== 'owner'"
                  class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  @click="removeMember(m.user_id)"
                >
                  <UserMinus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Add member by email -->
          <div class="flex gap-2">
            <input
              v-model="inviteEmail"
              type="email"
              :placeholder="$t('projects.inviteByEmail')"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              @keyup.enter="addMember"
            />
            <button
              :disabled="!inviteEmail.trim()"
              class="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              @click="addMember"
            >
              <UserPlus class="w-4 h-4" />
            </button>
          </div>
          <p v-if="memberError" class="text-xs text-red-500 mt-1.5">{{ memberError }}</p>
        </div>

        <!-- Danger zone -->
        <div class="border-t border-gray-200 dark:border-gray-800 pt-5">
          <h4 class="text-sm font-semibold text-red-600 mb-3">Danger Zone</h4>
          <button
            class="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            @click="deleteProject"
          >
            <Trash2 class="w-4 h-4" />
            {{ $t('projects.deleteProject') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, UserPlus, UserMinus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{ project: any }>()
const emit = defineEmits<{
  close: []
  updated: [project: any]
  deleted: []
}>()

const { t } = useI18n()
const saving = ref(false)
const inviteEmail = ref('')
const memberError = ref('')

const form = reactive({
  name: props.project.name,
  description: props.project.description ?? '',
})

async function saveProject() {
  saving.value = true
  try {
    const updated = await $fetch<any>(`/api/projects/${props.project.id}`, {
      method: 'PUT',
      body: form,
    })
    emit('updated', updated)
  } finally {
    saving.value = false
  }
}

async function addMember() {
  if (!inviteEmail.value.trim()) return
  memberError.value = ''
  try {
    const member = await $fetch<any>(`/api/projects/${props.project.id}/members`, {
      method: 'POST',
      body: { email: inviteEmail.value.trim() },
    })
    props.project.members.push(member)
    inviteEmail.value = ''
  } catch (e: any) {
    memberError.value = e?.data?.statusMessage ?? t('common.error')
  }
}

async function removeMember(userId: string) {
  await $fetch(`/api/projects/${props.project.id}/members/${userId}`, { method: 'DELETE' })
  const idx = props.project.members.findIndex((m: any) => m.user_id === userId)
  if (idx !== -1) props.project.members.splice(idx, 1)
}

async function deleteProject() {
  if (!confirm(t('projects.deleteConfirm'))) return
  await $fetch(`/api/projects/${props.project.id}`, { method: 'DELETE' })
  emit('deleted')
}
</script>
