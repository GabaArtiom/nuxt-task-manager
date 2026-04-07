<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="visible"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4"
      >
        <div
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 flex items-start gap-3"
          :class="typeClass"
        >
          <div class="flex-shrink-0">
            <component :is="icon" class="w-5 h-5" :class="iconClass" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ message }}</p>
          </div>
          <button
            @click="close"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, UserCheck, Ticket, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  message: string
  type: 'assigned' | 'new_ticket' | 'urgent_ticket'
}>()

const emit = defineEmits<{
  close: []
}>()

const icon = computed(() => {
  const map = {
    assigned: UserCheck,
    new_ticket: Ticket,
    urgent_ticket: AlertCircle,
  }
  return map[props.type]
})

const typeClass = computed(() => {
  const map = {
    assigned: 'border-l-4 border-l-blue-500',
    new_ticket: 'border-l-4 border-l-green-500',
    urgent_ticket: 'border-l-4 border-l-red-500',
  }
  return map[props.type]
})

const iconClass = computed(() => {
  const map = {
    assigned: 'text-blue-600 dark:text-blue-400',
    new_ticket: 'text-green-600 dark:text-green-400',
    urgent_ticket: 'text-red-600 dark:text-red-400',
  }
  return map[props.type]
})

function close() {
  emit('close')
}

// Auto close after 5 seconds
watch(() => props.visible, (val) => {
  if (val) {
    setTimeout(() => {
      emit('close')
    }, 5000)
  }
})
</script>
