<template>
  <div class="max-w-xl">
    <div class="mb-8">
      <NuxtLink to="/tickets" class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-3 transition-colors">
        <ArrowLeft class="w-4 h-4" />
        {{ $t('tickets.backToList') }}
      </NuxtLink>
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('tickets.create') }}</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('tickets.createSubtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <form class="p-8 space-y-6" @submit.prevent="handleCreate">
        <!-- Customer Name -->
        <div>
          <label for="customer" class="label">{{ $t('tickets.customerName') }} <span class="text-red-500">*</span></label>
          <input
            id="customer"
            v-model="form.customer_name"
            type="text"
            required
            class="input mt-1.5"
            placeholder="e.g. Acme Corp"
          />
          <p v-if="errors.customer_name" class="text-xs text-red-500 mt-1.5">{{ errors.customer_name }}</p>
        </div>

        <!-- Type -->
        <div>
          <label class="label">{{ $t('tickets.type') }} <span class="text-red-500">*</span></label>
          <div class="mt-1.5">
            <CustomSelect
              v-model="form.type"
              :options="typeOptions"
              :placeholder="$t('tickets.selectType')"
            />
          </div>
          <p v-if="errors.type" class="text-xs text-red-500 mt-1.5">{{ errors.type }}</p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="label">{{ $t('tickets.description') }}</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="input mt-1.5 resize-y"
            :placeholder="$t('tickets.descriptionPlaceholder')"
          />
        </div>

        <!-- Urgent toggle -->
        <div>
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

        <!-- Assign to (Admin only) -->
        <div v-if="auth.isAdmin">
          <label class="label">{{ $t('tickets.assignTo') }}</label>
          <div class="mt-1.5">
            <CustomSelect
              v-model="form.assigned_to"
              :options="assignOptions"
              :placeholder="$t('tickets.noOne')"
            />
          </div>
        </div>

        <!-- Status info -->
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3.5 border border-gray-100 dark:border-gray-800">
          <div class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          <p class="text-xs text-gray-500 dark:text-gray-400">
            <span class="font-semibold text-gray-700 dark:text-gray-300">{{ $t('tickets.status') }}:</span> {{ $t('tickets.statusToBeWorked') }}
            <span class="text-gray-400 dark:text-gray-500 ml-1">({{ $t('tickets.setAutomatic') }})</span>
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-sm"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? $t('tickets.creating') : $t('tickets.createTicket') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { useTicketsStore } from '~/stores/tickets'
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types'

definePageMeta({ middleware: 'auth' })

const ticketsStore = useTicketsStore()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const technicians = ref<User[]>([])
const ticketTypes = ['Bug', 'Fixes', 'Improvement', 'Info', 'Typo', 'Other']

const typeOptions = ticketTypes.map(t => ({ value: t, label: t }))

const assignOptions = computed(() => [
  { value: '', label: $t('tickets.noOne') },
  ...technicians.value.map(u => ({ value: u.id, label: `${u.name} ${u.family_name}` })),
])

const { t: $t } = useI18n()

const form = reactive({ customer_name: '', description: '', type: '', is_urgent: false, assigned_to: '' })
const errors = reactive({ customer_name: '', type: '' })

onMounted(async () => {
  if (auth.isAdmin) {
    try {
      const users = await $fetch<User[]>('/api/users')
      technicians.value = users.filter(u => !u.is_locked)
    } catch {}
  }
})

function validate(): boolean {
  errors.customer_name = ''
  errors.type = ''
  let valid = true
  if (!form.customer_name.trim()) { errors.customer_name = 'Required'; valid = false }
  if (!form.type) { errors.type = 'Required'; valid = false }
  return valid
}

async function handleCreate() {
  if (!validate()) return
  loading.value = true
  try {
    await ticketsStore.createTicket({
      customer_name: form.customer_name,
      description: form.description,
      type: form.type,
      is_urgent: form.is_urgent,
      assigned_to: form.assigned_to || undefined,
    })
    toast.success('Ticket created!')
    router.push('/tickets')
  } catch (e: any) {
    toast.error(e.data?.statusMessage || 'Failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.label { @apply block text-sm font-semibold text-gray-700 dark:text-gray-300; }
.input {
  @apply w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-150;
  @apply focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-400/20 dark:focus:border-primary-400;
  @apply placeholder:text-gray-400 dark:placeholder:text-gray-500;
}
</style>
