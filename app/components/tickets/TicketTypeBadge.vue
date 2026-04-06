<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      typeClasses[type] || 'bg-gray-100 text-gray-700',
    ]"
  >
    {{ type }}
  </span>
</template>

<script setup lang="ts">
import type { TicketType } from '~/types'

defineProps<{ type: TicketType }>()

const typeClasses: Record<TicketType, string> = {
  Bug: 'bg-red-50 text-red-700',
  Fixes: 'bg-orange-50 text-orange-700',
  Improvement: 'bg-blue-50 text-blue-700',
  Info: 'bg-cyan-50 text-cyan-700',
  Typo: 'bg-purple-50 text-purple-700',
  Other: 'bg-gray-100 text-gray-700',
}
</script>
