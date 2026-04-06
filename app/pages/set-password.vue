<template>
  <div>
    <h2 class="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ $t('auth.setPassword') }}</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ $t('auth.setPasswordDescription') }}</p>

    <form class="space-y-4" @submit.prevent="handleSetPassword">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.newPassword') }}</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          minlength="8"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :placeholder="$t('auth.minChars')"
        />
      </div>

      <div>
        <label for="confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.confirmPassword') }}</label>
        <input
          id="confirm"
          v-model="form.confirm"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :placeholder="$t('auth.repeatPassword')"
        />
      </div>

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>

      <button
        type="submit"
        class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? $t('auth.saving') : $t('auth.setPassword') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({ password: '', confirm: '' })

async function handleSetPassword() {
  if (form.password !== form.confirm) {
    errorMsg.value = t('auth.passwordsNoMatch')
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await $fetch('/api/auth/set-password', {
      method: 'POST',
      body: { token: route.query.token, password: form.password },
    })
    toast.success('Password set successfully!')
    router.push('/login')
  } catch (e: any) {
    errorMsg.value = e.data?.statusMessage || 'Failed to set password'
  } finally {
    loading.value = false
  }
}
</script>
