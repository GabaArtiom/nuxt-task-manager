<template>
  <div
    :class="[
      'bg-white dark:bg-gray-900 rounded-xl border p-6 flex items-center gap-4',
      borderColor ? `border-l-4 ${borderColor}` : 'border-gray-200 dark:border-gray-800',
    ]"
  >
    <div :class="['w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', iconBg || 'bg-gray-100 dark:bg-gray-800']">
      <component :is="icon" :class="['w-6 h-6', iconColor || 'text-gray-600']" />
    </div>
    <div>
      <p class="text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">{{ value }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  value: number
  label: string
  icon: Component
  borderColor?: string
  iconBg?: string
  iconColor?: string
}>()
</script>
