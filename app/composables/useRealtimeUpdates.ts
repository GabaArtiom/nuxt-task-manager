import { useTicketsStore } from '~/stores/tickets'
import { useAuthStore } from '~/stores/auth'

export function useRealtimeUpdates() {
  const ticketsStore = useTicketsStore()
  const auth = useAuthStore()
  const { t } = useI18n()

  const showNotification = ref(false)
  const notificationMessage = ref('')
  const notificationType = ref<'assigned' | 'new_ticket' | 'urgent_ticket'>('new_ticket')

  let es: EventSource | null = null

  function connect() {
    if (es) return
    es = new EventSource('/sse')

    es.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data)
        if (type !== 'connected') handleEvent(type, data)
      } catch {}
    }

    es.onerror = () => {
      es?.close()
      es = null
      setTimeout(connect, 3000)
    }
  }

  function disconnect() {
    es?.close()
    es = null
  }

  function handleEvent(type: string, data: any) {
    if (type === 'ticket:created') {
      ticketsStore.fetchTickets(ticketsStore.lastParams)

      if (!data.assigned_to) {
        // Show notification for new unassigned ticket
        notificationMessage.value = data.is_urgent
          ? t('notifications.urgentTicket', { customer: data.customer_name })
          : t('notifications.newTicket', { customer: data.customer_name })
        notificationType.value = data.is_urgent ? 'urgent_ticket' : 'new_ticket'
        showNotification.value = true
      } else if (data.assigned_to === auth.user?.id) {
        // Show notification if created and assigned to me
        notificationMessage.value = t('notifications.assignedToYou', { customer: data.customer_name })
        notificationType.value = 'assigned'
        showNotification.value = true
      }
    } else if (type === 'ticket:updated') {
      const idx = ticketsStore.tickets.findIndex(t => t.id === data.id)
      const oldTicket = idx !== -1 ? ticketsStore.tickets[idx] : null

      // Show notification if assigned to me (check before updating the list)
      if (data.assigned_to === auth.user?.id) {
        const wasAssignedToMe = oldTicket?.assigned_to === auth.user?.id
        if (!wasAssignedToMe) {
          notificationMessage.value = t('notifications.assignedToYou', { customer: data.customer_name })
          notificationType.value = 'assigned'
          showNotification.value = true
        }
      }

      // Update ticket in place if it exists
      if (idx !== -1) {
        ticketsStore.tickets[idx] = data
      }
      // Don't fetch if ticket not in current list - it's probably filtered out
    } else if (type === 'ticket:deleted') {
      const idx = ticketsStore.tickets.findIndex(t => t.id === data.id)
      if (idx !== -1) {
        ticketsStore.tickets.splice(idx, 1)
      }
    }
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return {
    showNotification,
    notificationMessage,
    notificationType,
    closeNotification: () => { showNotification.value = false },
  }
}
