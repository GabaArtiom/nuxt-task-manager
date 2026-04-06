<template>
  <div>
    <h2 class="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ $t('auth.resetPassword') }}</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{{ $t('auth.resetDescription') }}</p>

    <form v-if="!sent" class="space-y-4" @submit.prevent="handleReset">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('auth.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? $t('auth.sending') : $t('auth.sendResetLink') }}
      </button>
    </form>

    <div v-else class="text-center py-4">
      <p class="text-sm text-green-600 font-medium">{{ $t('auth.checkEmail') }}</p>
    </div>

    <p class="mt-4 text-center">
      <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700">
        {{ $t('auth.backToSignIn') }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleReset() {
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email: email.value },
    })
  } catch {}
  sent.value = true
  loading.value = false
}
</script>
