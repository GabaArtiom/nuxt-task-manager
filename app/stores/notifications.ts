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

const STORAGE_KEY = 'notifications'

function loadFromStorage(): Notification[] {
  if (!process.client) return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveToStorage(notifications: Notification[]) {
  if (!process.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch {}
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const initialized = ref(false)

  function init() {
    if (!initialized.value && process.client) {
      notifications.value = loadFromStorage()
      initialized.value = true
    }
  }

  // Auto-init on client
  if (process.client) {
    init()
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

    saveToStorage(notifications.value)
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      saveToStorage(notifications.value)
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
    saveToStorage(notifications.value)
  }

  function clearAll() {
    notifications.value = []
    saveToStorage(notifications.value)
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    init,
  }
})
