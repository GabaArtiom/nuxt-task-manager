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
              v-for="m in uniqueMembers"
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

          <!-- Add member by user search -->
          <div class="flex gap-2">
            <div class="flex-1">
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                :placeholder="$t('projects.searchUsers')"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autocomplete="off"
                @focus="openDropdown"
                @blur="onBlur"
                @input="selectedUserId = ''"
              />
            </div>
            <button
              :disabled="!selectedUserId"
              class="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              @click="addMember"
            >
              <UserPlus class="w-4 h-4" />
            </button>
          </div>
          <p v-if="memberError" class="text-xs text-red-500 mt-1.5">{{ memberError }}</p>

          <Teleport to="body">
            <div
              v-if="showDropdown && (filteredUsers.length > 0 || searchQuery.trim())"
              :style="dropdownStyle"
              class="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              <template v-if="filteredUsers.length > 0">
                <button
                  v-for="u in filteredUsers"
                  :key="u.id"
                  type="button"
                  class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                  @mousedown.prevent="selectUser(u)"
                >
                  <div class="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium uppercase flex-shrink-0">
                    {{ u.name[0] }}{{ u.family_name[0] }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ u.name }} {{ u.family_name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ u.email }}</p>
                  </div>
                </button>
              </template>
              <p v-else class="px-3 py-2 text-sm text-gray-500">{{ $t('projects.noUsersFound') }}</p>
            </div>
          </Teleport>
        </div>

        <!-- Danger zone -->
        <div class="border-t border-gray-200 dark:border-gray-800 pt-5">
          <h4 class="text-sm font-semibold text-red-600 mb-3">Danger Zone</h4>
          <button
            class="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            @click="showDeleteConfirm = true"
          >
            <Trash2 class="w-4 h-4" />
            {{ $t('projects.deleteProject') }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="showDeleteConfirm"
      :title="$t('projects.deleteProject')"
      :message="$t('projects.deleteConfirm')"
      :confirm-text="$t('projects.deleteProject')"
      :cancel-text="$t('common.cancel')"
      variant="danger"
      @confirm="deleteProject"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { X, UserPlus, UserMinus, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '~/components/ConfirmDialog.vue'

const props = defineProps<{ project: any }>()
const emit = defineEmits<{
  close: []
  updated: [project: any]
  deleted: []
}>()

const { t } = useI18n()
const saving = ref(false)
const memberError = ref('')
const searchQuery = ref('')
const selectedUserId = ref('')
const showDropdown = ref(false)
const showDeleteConfirm = ref(false)
const allUsers = ref<{ id: string; name: string; family_name: string; email: string }[]>([])
const searchInput = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref({})

const form = reactive({
  name: props.project.name,
  description: props.project.description ?? '',
})

const memberIds = computed(() => new Set(props.project.members.map((m: any) => m.user_id)))

const uniqueMembers = computed(() => {
  const seen = new Set<string>()
  return props.project.members.filter((member: any) => {
    if (seen.has(member.user_id)) return false
    seen.add(member.user_id)
    return true
  })
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return allUsers.value.filter((u) => {
    if (memberIds.value.has(u.id)) return false
    if (!q) return true
    return `${u.name} ${u.family_name} ${u.email}`.toLowerCase().includes(q)
  })
})

function openDropdown() {
  if (searchInput.value) {
    const rect = searchInput.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
  showDropdown.value = true
}

function selectUser(u: { id: string; name: string; family_name: string; email: string }) {
  selectedUserId.value = u.id
  searchQuery.value = `${u.name} ${u.family_name}`
  showDropdown.value = false
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false }, 150)
}

onMounted(async () => {
  allUsers.value = await $fetch<any[]>('/api/users/search')
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
  if (!selectedUserId.value) return
  memberError.value = ''
  try {
    const member = await $fetch<any>(`/api/projects/${props.project.id}/members`, {
      method: 'POST',
      body: { user_id: selectedUserId.value },
    })
    upsertMember(member)
    searchQuery.value = ''
    selectedUserId.value = ''
  } catch (e: any) {
    memberError.value = e?.data?.statusMessage ?? t('common.error')
  }
}

async function removeMember(userId: string) {
  await $fetch(`/api/projects/${props.project.id}/members/${userId}`, { method: 'DELETE' })
  const idx = props.project.members.findIndex((m: any) => m.user_id === userId)
  if (idx !== -1) props.project.members.splice(idx, 1)
}

function upsertMember(member: any) {
  const idx = props.project.members.findIndex((m: any) => m.user_id === member.user_id)
  if (idx === -1) props.project.members.push(member)
  else props.project.members[idx] = { ...props.project.members[idx], ...member }
}

async function deleteProject() {
  showDeleteConfirm.value = false
  await $fetch(`/api/projects/${props.project.id}`, { method: 'DELETE' })
  emit('deleted')
}
</script>
