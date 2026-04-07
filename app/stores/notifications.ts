import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: 'assigned' | 'new_ticket' | 'urgent_ticket'
  message: string
  ticketId: string
  read: boolean
  createdAt: Date
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    notifications.value.unshift({
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      read: false,
      createdAt: new Date(),
    })

    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.read = true
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  }
})
