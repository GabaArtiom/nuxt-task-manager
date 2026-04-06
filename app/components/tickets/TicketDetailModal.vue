<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="ticket" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="ticket" class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 class="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">{{ $t('tickets.details') }}</h2>
              <button class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="$emit('close')">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Info cards -->
              <div class="space-y-4">
                <div>
                  <label class="detail-label">{{ $t('tickets.customerName') }}</label>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{{ ticket.customer_name }}</p>
                </div>

                <div v-if="ticket.description">
                  <label class="detail-label">{{ $t('tickets.description') }}</label>
                  <p class="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap leading-relaxed">{{ ticket.description }}</p>
                </div>

                <div class="flex gap-6">
                  <div>
                    <label class="detail-label">{{ $t('tickets.type') }}</label>
                    <div class="mt-1.5"><TicketTypeBadge :type="ticket.type" /></div>
                  </div>
                  <div>
                    <label class="detail-label">{{ $t('tickets.urgency') }}</label>
                    <div class="mt-1.5">
                      <TicketUrgencyBadge :urgent="ticket.is_urgent" />
                      <span v-if="!ticket.is_urgent" class="text-sm text-gray-400 dark:text-gray-500">{{ $t('tickets.normal') }}</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="detail-label">{{ $t('tickets.createdBy') }}</label>
                    <p class="text-sm text-gray-900 dark:text-gray-100 mt-1">{{ ticket.creator?.name }} {{ ticket.creator?.family_name }}</p>
                  </div>
                  <div>
                    <label class="detail-label">{{ $t('tickets.assignedTo') }}</label>
                    <p class="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {{ ticket.assignee ? `${ticket.assignee.name} ${ticket.assignee.family_name}` : $t('tickets.unassigned') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Edit section -->
              <div class="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-5">
                <!-- Type (admin only) -->
                <div v-if="auth.isAdmin">
                  <label class="label">{{ $t('tickets.type') }}</label>
                  <div class="mt-1.5">
                    <CustomSelect v-model="form.type" :options="typeOptions" />
                  </div>
                </div>

                <!-- Status -->
                <div>
                  <label class="label">{{ $t('tickets.status') }}</label>
                  <div class="mt-1.5">
                    <CustomSelect
                      v-model="form.status"
                      :options="statusOptions"
                    />
                  </div>
                </div>

                <!-- Urgent toggle (admin) -->
                <div v-if="auth.isAdmin">
                  <label class="flex items-center gap-3 cursor-pointer select-none" @click.prevent="form.is_urgent = !form.is_urgent">
                    <div :class="[
                      'relative w-10 h-[22px] rounded-full transition-colors duration-200',
                      form.is_urgent ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                    ]">
                      <div :class="[
                        'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                        form.is_urgent && 'translate-x-[18px]'
                      ]" />
                    </div>
                    <div class="flex items-center gap-2">
                      <AlertTriangle v-if="form.is_urgent" class="w-4 h-4 text-red-500" />
                      <span class="text-sm font-medium" :class="form.is_urgent ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'">
                        {{ $t('tickets.markUrgent') }}
                      </span>
                    </div>
                  </label>
                </div>

                <!-- Assign (admin) -->
                <div v-if="auth.isAdmin">
                  <label class="label">{{ $t('tickets.assignTo') }}</label>
                  <div class="mt-1.5">
                    <CustomSelect
                      v-model="form.assigned_to"
                      :options="assignOptions"
                    />
                  </div>
                </div>

                <!-- Assign to me (technician) -->
                <button
                  v-else-if="!ticket.assigned_to"
                  class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
                  :disabled="saving"
                  @click="assignToMe"
                >
                  {{ $t('tickets.assignToMe') }}
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                class="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                :disabled="saving"
                @click="save"
              >
                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                {{ saving ? $t('auth.saving') : $t('tickets.saveChanges') }}
              </button>
              <button
                v-if="auth.isAdmin"
                class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.98]"
                :disabled="saving"
                @click="showDeleteConfirm = true"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </Transition>

        <ConfirmDialog
          :visible="showDeleteConfirm"
          :title="$t('tickets.deleteTitle')"
          :message="$t('tickets.deleteMessage')"
          :confirm-text="$t('common.delete')"
          :cancel-text="$t('common.cancel')"
          variant="danger"
          @confirm="remove"
          @cancel="showDeleteConfirm = false"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-vue-next'
import type { Ticket, User } from '~/types'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'

const props = defineProps<{ ticket: Ticket | null; technicians?: User[] }>()
const emit = defineEmits<{ close: []; updated: [ticket: Ticket]; deleted: [id: string] }>()

const { t } = useI18n()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const toast = useToast()
const saving = ref(false)
const showDeleteConfirm = ref(false)

const form = reactive({ status: '', type: '', is_urgent: false, assigned_to: '' as string })

watch(() => props.ticket, (tk) => {
  if (tk) {
    form.status = tk.status
    form.type = tk.type
    form.is_urgent = tk.is_urgent
    form.assigned_to = tk.assigned_to || ''
  }
}, { immediate: true })

const typeOptions = ['Bug', 'Fixes', 'Improvement', 'Info', 'Typo', 'Other'].map(v => ({ value: v, label: v }))

const statusOptions = computed(() => [
  { value: 'to_be_worked', label: t('tickets.statusToBeWorked') },
  { value: 'in_progress', label: t('tickets.statusInProgress') },
  { value: 'done', label: t('tickets.statusDone') },
  { value: 'canceled', label: t('tickets.statusCanceled') },
])

const assignOptions = computed(() => [
  { value: '', label: t('tickets.unassigned') },
  ...(props.technicians || []).map(u => ({ value: u.id, label: `${u.name} ${u.family_name}` })),
])

const canEditStatus = computed(() => {
  if (!props.ticket) return false
  if (auth.isAdmin) return true
  return props.ticket.assigned_to === auth.user?.id
})

async function save() {
  if (!props.ticket) return
  saving.value = true
  try {
    const updated = await ticketsStore.updateTicket(props.ticket.id, {
      status: form.status as any,
      type: form.type as any,
      is_urgent: form.is_urgent,
      assigned_to: form.assigned_to || null,
    })
    toast.success(t('users.userUpdated'))
    emit('updated', updated); emit('close')
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
  finally { saving.value = false }
}

async function assignToMe() {
  if (!props.ticket || !auth.user) return
  saving.value = true
  try {
    const updated = await ticketsStore.updateTicket(props.ticket.id, { assigned_to: auth.user.id } as any)
    toast.success('Assigned!')
    emit('updated', updated); emit('close')
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
  finally { saving.value = false }
}

async function remove() {
  if (!props.ticket) return
  showDeleteConfirm.value = false
  saving.value = true
  try {
    await ticketsStore.deleteTicket(props.ticket.id)
    toast.success('Deleted')
    emit('deleted', props.ticket.id); emit('close')
  } catch (e: any) { toast.error(e.data?.statusMessage || 'Failed') }
  finally { saving.value = false }
}
</script>

<style scoped>
.detail-label { @apply text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider; }
.label { @apply block text-sm font-semibold text-gray-700 dark:text-gray-300; }
</style>
