<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4">
          <Ticket class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ $t('app.name') }}</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">{{ $t('app.subtitle') }}</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ticket } from 'lucide-vue-next'
</script>
