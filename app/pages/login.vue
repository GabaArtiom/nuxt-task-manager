<template>
  <div>
    <h2 class="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100 mb-6">{{ $t('auth.signIn') }}</h2>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.password') }}</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>

      <button
        type="submit"
        class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
      </button>
    </form>

    <p class="mt-4 text-center">
      <NuxtLink to="/reset-password" class="text-sm text-primary-600 hover:text-primary-700">
        {{ $t('auth.forgotPassword') }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(form.email, form.password)
    router.push('/')
  } catch (e: any) {
    errorMsg.value = e.data?.statusMessage || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
