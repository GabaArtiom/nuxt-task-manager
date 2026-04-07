import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: 'assigned' | 'new_ticket' | 'urgent_ticket'
  message: string
  ticketId: string
  read: boolean
  createdAt: string
}

const STORAGE_KEY = 'app_notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  // Load on store creation
  if (process.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        notifications.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load notifications:', e)
    }
  }

  function save() {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
      } catch (e) {
        console.error('Failed to save notifications:', e)
      }
    }
  }

  function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }

    notifications.value.unshift(newNotification)

    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }

    save()
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      save()
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
    save()
  }

  function clearAll() {
    notifications.value = []
    save()
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
