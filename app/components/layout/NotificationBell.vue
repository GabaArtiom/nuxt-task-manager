<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      :class="{ 'bg-gray-100 dark:bg-gray-800': isOpen }"
      ref="buttonRef"
    >
      <Bell class="w-5 h-5" />
      <span
        v-if="notificationsStore.unreadCount > 0"
        class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40"
        @click="isOpen = false"
      />
      <div
        v-if="isOpen"
        :style="dropdownStyle"
        class="fixed w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden flex flex-col"
      >
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ $t('notifications.title') }}
        </h3>
        <button
          v-if="notificationsStore.notifications.length > 0"
          @click.stop="handleMarkAllAsRead"
          class="text-xs text-primary-600 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
        >
          {{ $t('notifications.markAllRead') }}
        </button>
      </div>

      <div class="overflow-y-auto flex-1">
        <div
          v-if="notificationsStore.notifications.length === 0"
          class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          {{ $t('notifications.empty') }}
        </div>

        <div
          v-for="notification in notificationsStore.notifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
          :class="{ 'bg-primary-50 dark:bg-primary-950/20': !notification.read }"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              :class="{
                'bg-blue-100 dark:bg-blue-950': notification.type === 'assigned',
                'bg-green-100 dark:bg-green-950': notification.type === 'new_ticket',
                'bg-red-100 dark:bg-red-950': notification.type === 'urgent_ticket',
              }"
            >
              <UserCheck v-if="notification.type === 'assigned'" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <Ticket v-else-if="notification.type === 'new_ticket'" class="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertCircle v-else class="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-gray-100">{{ notification.message }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatTime(notification.createdAt) }}
              </p>
            </div>
            <div v-if="!notification.read" class="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2" />
          </div>
        </div>
      </div>

      <div
        v-if="notificationsStore.notifications.length > 0"
        class="px-4 py-2 border-t border-gray-200 dark:border-gray-800"
      >
        <button
          @click.stop="notificationsStore.clearAll(); isOpen = false"
          class="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {{ $t('notifications.clearAll') }}
        </button>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Bell, UserCheck, Ticket, AlertCircle } from 'lucide-vue-next'
import { useNotificationsStore } from '~/stores/notifications'
import { formatDistanceToNow } from 'date-fns'

const notificationsStore = useNotificationsStore()
const isOpen = ref(false)
const router = useRouter()
const buttonRef = ref<HTMLElement | null>(null)

// Ensure notifications are loaded
onMounted(() => {
  notificationsStore.init()
})

const dropdownStyle = computed(() => {
  if (!buttonRef.value) return {}
  const rect = buttonRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
})

function handleMarkAllAsRead() {
  notificationsStore.markAllAsRead()
}

function handleNotificationClick(notification: any) {
  notificationsStore.markAsRead(notification.id)
  isOpen.value = false
  router.push(`/tickets/${notification.ticketId}`)
}

function formatTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
</script>
