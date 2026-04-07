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

const COOKIE_KEY = 'notifications'

function loadFromCookie(): Notification[] {
  if (!process.client) return []
  try {
    const cookie = document.cookie.split('; ').find(row => row.startsWith(COOKIE_KEY + '='))
    if (!cookie) return []
    const value = decodeURIComponent(cookie.split('=')[1])
    return JSON.parse(value)
  } catch {
    return []
  }
}

function saveToCookie(notifications: Notification[]) {
  if (!process.client) return
  try {
    const value = encodeURIComponent(JSON.stringify(notifications))
    // Set cookie for 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${COOKIE_KEY}=${value}; expires=${expires}; path=/; SameSite=Lax`
  } catch {}
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>(loadFromCookie())
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

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

    saveToCookie(notifications.value)
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      saveToCookie(notifications.value)
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
    saveToCookie(notifications.value)
  }

  function clearAll() {
    notifications.value = []
    saveToCookie(notifications.value)
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
