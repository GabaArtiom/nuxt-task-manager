import { useTicketsStore } from '~/stores/tickets'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'

export function useRealtimeUpdates() {
  const ticketsStore = useTicketsStore()
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
    const isOwnAction = data?.creator?.id === auth.user?.id || data?.assignee?.id === auth.user?.id

    if (type === 'ticket:created') {
      ticketsStore.fetchTickets(ticketsStore.lastParams)
      if (!isOwnAction) info(`New ticket: ${data.customer_name}`)
    } else if (type === 'ticket:updated') {
      const idx = ticketsStore.tickets.findIndex(t => t.id === data.id)
      if (idx !== -1) {
        ticketsStore.tickets[idx] = data
      } else {
        ticketsStore.fetchTickets(ticketsStore.lastParams)
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
