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
      <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancel" />
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="visible" class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            <!-- Icon -->
            <div class="pt-6 pb-2 flex justify-center">
              <div :class="['w-12 h-12 rounded-full flex items-center justify-center', iconBg]">
                <component :is="iconComponent" :class="['w-6 h-6', iconColor]" />
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 pb-2 text-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ message }}</p>
            </div>

            <!-- Actions -->
            <div class="px-6 pb-6 pt-4 flex gap-3">
              <button
                class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="cancel"
              >
                {{ cancelText }}
              </button>
              <button
                :class="['flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-white', confirmBtnClass]"
                @click="confirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
})

const emit = defineEmits<{ confirm: []; cancel: [] }>()

function confirm() { emit('confirm') }
function cancel() { emit('cancel') }

const iconComponent = computed(() => {
  const map = { danger: Trash2, warning: AlertTriangle, info: Info }
  return map[props.variant]
})

const iconBg = computed(() => {
  const map = {
    danger: 'bg-red-100 dark:bg-red-950/50',
    warning: 'bg-amber-100 dark:bg-amber-950/50',
    info: 'bg-blue-100 dark:bg-blue-950/50',
  }
  return map[props.variant]
})

const iconColor = computed(() => {
  const map = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  }
  return map[props.variant]
})

const confirmBtnClass = computed(() => {
  const map = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-primary-600 hover:bg-primary-700',
  }
  return map[props.variant]
})
</script>
