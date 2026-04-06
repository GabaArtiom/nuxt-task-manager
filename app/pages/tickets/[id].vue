<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/tickets" class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-3">
        <ArrowLeft class="w-4 h-4" />
        {{ $t('tickets.backToList') }}
      </NuxtLink>
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ ticket?.customer_name }}</h2>
        <div class="flex items-center gap-2">
          <TicketTypeBadge v-if="ticket" :type="ticket.type" />
          <TicketUrgencyBadge v-if="ticket" :urgent="ticket.is_urgent" />
          <TicketStatusBadge v-if="ticket" :status="ticket.status" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>

    <div v-else-if="ticket" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main info -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{{ $t('tickets.details') }}</h3>

          <div class="space-y-4">
            <div>
              <label class="detail-label">{{ $t('tickets.customerName') }}</label>
              <div v-if="auth.isAdmin && editing === 'name'" class="mt-1 flex items-center gap-2">
                <input v-model="editForm.customer_name" class="input flex-1" @keyup.enter="saveField('name')" @keyup.escape="editing = null" />
                <button class="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded" @click="saveField('name')"><Check class="w-4 h-4" /></button>
                <button class="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" @click="editing = null"><X class="w-4 h-4" /></button>
              </div>
              <p v-else class="text-sm text-gray-900 dark:text-gray-100 mt-1 group" :class="auth.isAdmin && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded'" @click="startEdit('name')">
                {{ ticket.customer_name }}
                <Pencil v-if="auth.isAdmin" class="w-3 h-3 text-gray-400 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>

            <div>
              <label class="detail-label">{{ $t('tickets.description') }}</label>
              <div v-if="auth.isAdmin && editing === 'description'" class="mt-1">
                <textarea v-model="editForm.description" class="input min-h-[100px]" rows="4" @keyup.escape="editing = null" />
                <div class="flex items-center gap-2 mt-2">
                  <button class="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors" @click="saveField('description')">{{ $t('tickets.saveChanges') }}</button>
                  <button class="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs" @click="editing = null">{{ $t('common.cancel') }}</button>
                </div>
              </div>
              <p v-else-if="ticket.description" class="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap leading-relaxed group" :class="auth.isAdmin && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded'" @click="startEdit('description')">
                {{ ticket.description }}
                <Pencil v-if="auth.isAdmin" class="w-3 h-3 text-gray-400 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p v-else class="text-sm text-gray-400 dark:text-gray-500 mt-1 group" :class="auth.isAdmin && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded italic'" @click="startEdit('description')">
                {{ auth.isAdmin ? $t('tickets.clickToAdd') : '—' }}
                <Pencil v-if="auth.isAdmin" class="w-3 h-3 text-gray-400 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{{ $t('tickets.info') }}</h3>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('tickets.status') }}</span>
              <TicketStatusBadge :status="ticket.status" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('tickets.type') }}</span>
              <TicketTypeBadge :type="ticket.type" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('tickets.urgency') }}</span>
              <TicketUrgencyBadge :urgent="ticket.is_urgent" />
            </div>

            <hr class="border-gray-100 dark:border-gray-800" />

            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('tickets.createdBy') }}</span>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ ticket.creator?.name }} {{ ticket.creator?.family_name }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('tickets.assignedTo') }}</span>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">
                {{ ticket.assignee ? `${ticket.assignee.name} ${ticket.assignee.family_name}` : '—' }}
              </p>
            </div>
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('tickets.date') }}</span>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ formatDate(ticket.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-3">
          <button
            v-if="auth.isAdmin"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            @click="showEdit = true"
          >
            <Pencil class="w-4 h-4" />
            {{ $t('tickets.edit') }}
          </button>

          <button
            v-if="!auth.isAdmin && !ticket.assigned_to"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            :disabled="saving"
            @click="assignToMe"
          >
            {{ $t('tickets.assignToMe') }}
          </button>

          <div v-if="!auth.isAdmin && ticket.assigned_to === auth.user?.id">
            <label class="label mb-1.5 block">{{ $t('tickets.status') }}</label>
            <CustomSelect
              :model-value="statusForm"
              :options="statusOptions"
              @update:model-value="statusForm = $event; updateStatus()"
            />
          </div>
        </div>
      </div>
    </div>

    <TicketDetailModal :ticket="showEdit ? ticket : null" :technicians="technicians" @close="showEdit = false" @updated="onUpdated" @deleted="onDeleted" />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Pencil, Check, X } from 'lucide-vue-next'
import type { Ticket, User } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import { format } from 'date-fns'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const toast = useToast()

const ticket = ref<Ticket | null>(null)
const technicians = ref<User[]>([])
const loading = ref(true)
const saving = ref(false)
const showEdit = ref(false)
const statusForm = ref('')
const editing = ref<'name' | 'description' | null>(null)
const editForm = reactive({ customer_name: '', description: '' })

const { t } = useI18n()
const statusOptions = computed(() => [
  { value: 'to_be_worked', label: t('tickets.statusToBeWorked') },
  { value: 'in_progress', label: t('tickets.statusInProgress') },
  { value: 'done', label: t('tickets.statusDone') },
  { value: 'canceled', label: t('tickets.statusCanceled') },
])

function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

async function fetchTicket() {
  loading.value = true
  try {
    ticket.value = await $fetch<Ticket>(`/api/tickets/${route.params.id}`)
    statusForm.value = ticket.value.status
  } catch {
    router.push('/tickets')
  } finally {
    loading.value = false
  }
}

async function assignToMe() {
  if (!ticket.value || !auth.user) return
  saving.value = true
  try {
    ticket.value = await ticketsStore.updateTicket(ticket.value.id, { assigned_to: auth.user.id } as any)
    toast.success('Assigned!')
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
  finally { saving.value = false }
}

async function updateStatus() {
  if (!ticket.value) return
  saving.value = true
  try {
    ticket.value = await ticketsStore.updateTicket(ticket.value.id, { status: statusForm.value as any })
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
  finally { saving.value = false }
}

function startEdit(field: 'name' | 'description') {
  if (!auth.isAdmin || !ticket.value) return
  editForm.customer_name = ticket.value.customer_name
  editForm.description = ticket.value.description || ''
  editing.value = field
}

async function saveField(field: 'name' | 'description') {
  if (!ticket.value) return
  saving.value = true
  try {
    const data: any = {}
    if (field === 'name') data.customer_name = editForm.customer_name
    if (field === 'description') data.description = editForm.description
    ticket.value = await ticketsStore.updateTicket(ticket.value.id, data)
    editing.value = null
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
  finally { saving.value = false }
}

function onUpdated(updated: Ticket) {
  ticket.value = updated
  showEdit.value = false
}

function onDeleted() {
  router.push('/tickets')
}

onMounted(async () => {
  await fetchTicket()
  if (auth.isAdmin) {
    try { technicians.value = await $fetch<User[]>('/api/users') } catch {}
  }
})
</script>

<style scoped>
.detail-label { @apply text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider; }
.label { @apply text-sm font-semibold text-gray-700 dark:text-gray-300; }
.input {
  @apply w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-150;
  @apply focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400;
}
</style>
