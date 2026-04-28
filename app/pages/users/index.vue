<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('users.title') }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('users.subtitle') }}</p>
      </div>
      <button class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors" @click="showAddModal = true">
        <UserPlus class="w-4 h-4" />
        {{ $t('users.addUser') }}
      </button>
    </div>

    <div v-if="usersStore.loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>

    <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
            <th class="px-6 py-3">{{ $t('users.name') }}</th>
            <th class="px-6 py-3">{{ $t('users.email') }}</th>
            <th class="px-6 py-3">{{ $t('users.role') }}</th>
            <th class="px-6 py-3">{{ $t('users.status') }}</th>
            <th class="px-6 py-3 text-right">{{ $t('users.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="user in usersStore.users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                  {{ (user.name[0] + user.family_name[0]).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.name }} {{ user.family_name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : user.role === 'admin' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300']">
                {{ $t(`users.${user.role}`) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', user.is_locked ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300']">
                {{ user.is_locked ? $t('users.locked') : $t('users.active') }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors" :title="$t('users.edit')" @click="editUser = user; showEditModal = true">
                  <Pencil class="w-4 h-4" />
                </button>
                <button :class="['p-1.5 rounded-lg transition-colors', user.is_locked ? 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30']" :title="user.is_locked ? $t('users.unlock') : $t('users.lock')" @click="handleToggleLock(user)">
                  <Lock v-if="!user.is_locked" class="w-4 h-4" />
                  <Unlock v-else class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add User Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showAddModal = false" />
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('users.addUser') }}</h3>
            <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="showAddModal = false"><X class="w-5 h-5" /></button>
          </div>
          <form class="space-y-4" @submit.prevent="handleAddUser">
            <div>
              <label class="label">{{ $t('users.name') }} *</label>
              <input v-model="addForm.name" type="text" required class="input" />
            </div>
            <div>
              <label class="label">{{ $t('users.familyName') }} *</label>
              <input v-model="addForm.family_name" type="text" required class="input" />
            </div>
            <div>
              <label class="label">{{ $t('users.email') }} *</label>
              <input v-model="addForm.email" type="email" required class="input" />
            </div>
            <div>
              <label class="label">{{ $t('users.role') }} *</label>
              <select v-model="addForm.role" required class="input">
                <option value="member">{{ $t('users.member') }}</option>
                <option value="admin">{{ $t('users.admin') }}</option>
                <option value="super_admin">{{ $t('users.super_admin') }}</option>
              </select>
            </div>
            <p v-if="addError" class="text-sm text-red-600">{{ addError }}</p>
            <button type="submit" class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50" :disabled="addLoading">
              {{ addLoading ? $t('users.creating') : $t('users.createUser') }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Edit User Modal -->
    <Teleport to="body">
      <div v-if="showEditModal && editUser" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showEditModal = false" />
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('users.editUser') }}</h3>
            <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="showEditModal = false"><X class="w-5 h-5" /></button>
          </div>
          <form class="space-y-4" @submit.prevent="handleEditUser">
            <div>
              <label class="label">{{ $t('users.name') }}</label>
              <input v-model="editForm.name" type="text" required class="input" />
            </div>
            <div>
              <label class="label">{{ $t('users.familyName') }}</label>
              <input v-model="editForm.family_name" type="text" required class="input" />
            </div>
            <div>
              <label class="label">{{ $t('users.email') }}</label>
              <input v-model="editForm.email" type="email" required class="input" />
            </div>
            <div>
              <label class="label">{{ $t('users.role') }}</label>
              <select v-model="editForm.role" class="input">
                <option value="member">{{ $t('users.member') }}</option>
                <option value="admin">{{ $t('users.admin') }}</option>
                <option value="super_admin">{{ $t('users.super_admin') }}</option>
              </select>
            </div>
            <p v-if="editError" class="text-sm text-red-600">{{ editError }}</p>
            <button type="submit" class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50" :disabled="editLoading">
              {{ editLoading ? $t('auth.saving') : $t('common.save') }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog
      :visible="!!lockConfirmUser"
      :title="lockConfirmUser?.is_locked ? $t('users.unlockTitle') : $t('users.lockTitle')"
      :message="$t('users.lockMessage', { name: `${lockConfirmUser?.name} ${lockConfirmUser?.family_name}` })"
      :confirm-text="lockConfirmUser?.is_locked ? $t('users.unlock') : $t('users.lock')"
      :cancel-text="$t('common.cancel')"
      :variant="lockConfirmUser?.is_locked ? 'info' : 'warning'"
      @confirm="confirmToggleLock"
      @cancel="lockConfirmUser = null"
    />
  </div>
</template>

<script setup lang="ts">
import { UserPlus, Pencil, Lock, Unlock, X } from 'lucide-vue-next'
import type { User } from '~/types'
import { useUsersStore } from '~/stores/users'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const usersStore = useUsersStore()
const toast = useToast()

const showAddModal = ref(false)
const addLoading = ref(false)
const addError = ref('')
const addForm = reactive({ name: '', family_name: '', email: '', role: 'member' })

async function handleAddUser() {
  addLoading.value = true; addError.value = ''
  try {
    await usersStore.createUser({ ...addForm })
    toast.success(t('users.userCreated'))
    showAddModal.value = false
    addForm.name = ''; addForm.family_name = ''; addForm.email = ''; addForm.role = 'member'
  } catch (e: any) { addError.value = e.data?.statusMessage || 'Failed' }
  finally { addLoading.value = false }
}

const showEditModal = ref(false)
const editUser = ref<User | null>(null)
const editLoading = ref(false)
const editError = ref('')
const editForm = reactive({ name: '', family_name: '', email: '', role: 'member' as string })

watch(editUser, (u) => { if (u) { editForm.name = u.name; editForm.family_name = u.family_name; editForm.email = u.email; editForm.role = u.role } })

async function handleEditUser() {
  if (!editUser.value) return
  editLoading.value = true; editError.value = ''
  try {
    await usersStore.updateUser(editUser.value.id, { ...editForm })
    toast.success(t('users.userUpdated'))
    showEditModal.value = false
  } catch (e: any) { editError.value = e.data?.statusMessage || 'Failed' }
  finally { editLoading.value = false }
}

const lockConfirmUser = ref<User | null>(null)

function handleToggleLock(user: User) {
  lockConfirmUser.value = user
}

async function confirmToggleLock() {
  if (!lockConfirmUser.value) return
  const user = lockConfirmUser.value
  const action = user.is_locked ? t('users.unlock') : t('users.lock')
  lockConfirmUser.value = null
  try {
    await usersStore.toggleLock(user.id)
    toast.success(`${action}ed`)
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
}

onMounted(() => { usersStore.fetchUsers() })
</script>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
.input { @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500; }
</style>
