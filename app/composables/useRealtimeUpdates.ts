import { useTicketsStore } from '~/stores/tickets'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'

export function useRealtimeUpdates() {
  const ticketsStore = useTicketsStore()
  const notificationsStore = useNotificationsStore()
  const { info } = useToast()
  const auth = useAuthStore()
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
    const isOwnAction = data?.created_by === auth.user?.id

    if (type === 'ticket:created') {
      ticketsStore.fetchTickets(ticketsStore.lastParams)

      if (!isOwnAction) {
        // Notify about new unassigned ticket
        if (!data.assigned_to) {
          const message = data.is_urgent
            ? `🔴 Urgent ticket: ${data.customer_name}`
            : `New ticket: ${data.customer_name}`

          info(message)
          notificationsStore.addNotification({
            type: data.is_urgent ? 'urgent_ticket' : 'new_ticket',
            message,
            ticketId: data.id,
          })
        }
      }
    } else if (type === 'ticket:updated') {
      const idx = ticketsStore.tickets.findIndex(t => t.id === data.id)
      const oldTicket = idx !== -1 ? ticketsStore.tickets[idx] : null

      if (idx !== -1) {
        ticketsStore.tickets[idx] = data
      } else {
        ticketsStore.fetchTickets(ticketsStore.lastParams)
      }

      // Notify if assigned to me (check both old ticket and new assignment)
      if (!isOwnAction && data.assigned_to === auth.user?.id) {
        const wasAssignedToMe = oldTicket?.assigned_to === auth.user?.id
        if (!wasAssignedToMe) {
          const message = `You've been assigned to: ${data.customer_name}`
          info(message)
          notificationsStore.addNotification({
            type: 'assigned',
            message,
            ticketId: data.id,
          })
        }
      }
    } else if (type === 'ticket:deleted') {
      const idx = ticketsStore.tickets.findIndex(t => t.id === data.id)
      if (idx !== -1) {
        ticketsStore.tickets.splice(idx, 1)
      }
    }
  }

  onMounted(connect)
  onUnmounted(disconnect)
}
