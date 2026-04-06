<template>
  <div ref="wrapper">
    <button
      ref="trigger"
      type="button"
      class="w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-xl text-sm text-left transition-all duration-150 cursor-pointer"
      :class="[
        open
          ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
      ]"
      @click="toggle"
    >
      <span :class="!modelValue && 'text-gray-400 dark:text-gray-500'">
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDown
        class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200"
        :class="open && 'rotate-180'"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-[0.98]"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-[0.98]"
      >
        <div
          v-if="open"
          ref="dropdown"
          class="fixed z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          :style="dropdownStyle"
        >
          <div class="max-h-60 overflow-y-auto py-1">
            <button
              v-for="opt in options"
              :key="opt.value"
              type="button"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer"
              :class="[
                opt.value === modelValue
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ]"
              @click="select(opt.value)"
            >
              <Check v-if="opt.value === modelValue" class="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <span :class="opt.value === modelValue ? '' : 'ml-6'">{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const wrapper = ref<HTMLElement>()
const trigger = ref<HTMLElement>()
const dropdown = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

const selectedLabel = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label
})

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownHeight = Math.min(props.options.length * 42 + 8, 248)
  const openUp = spaceBelow < dropdownHeight + 8 && rect.top > dropdownHeight

  if (openUp) {
    dropdownStyle.value = {
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.top + 6}px`,
      minWidth: `${rect.width}px`,
    }
  } else {
    dropdownStyle.value = {
      left: `${rect.left}px`,
      top: `${rect.bottom + 6}px`,
      minWidth: `${rect.width}px`,
    }
  }
}

function toggle() {
  if (open.value) {
    open.value = false
  } else {
    updatePosition()
    open.value = true
  }
}

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (
    wrapper.value && !wrapper.value.contains(e.target as Node) &&
    dropdown.value && !dropdown.value.contains(e.target as Node)
  ) {
    open.value = false
  }
}

function onScroll() {
  if (open.value) updatePosition()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  window.addEventListener('scroll', onScroll, true)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('scroll', onScroll, true)
})
</script>
