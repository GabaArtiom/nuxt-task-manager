import { defineStore } from 'pinia'
import type { Ticket } from '~/types'

interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [] as Ticket[],
    pagination: null as Pagination | null,
    loading: false,
  }),

  actions: {
    async fetchTickets(params: Record<string, string> = {}) {
      this.loading = true
      try {
        const query = new URLSearchParams(params).toString()
        const data = await $fetch<{ tickets: Ticket[]; pagination: Pagination }>(
          `/api/tickets?${query}`
        )
        this.tickets = data.tickets
        this.pagination = data.pagination
      } finally {
        this.loading = false
      }
    },

    async createTicket(body: { customer_name: string; description?: string; type: string; is_urgent: boolean; assigned_to?: string }) {
      return await $fetch<Ticket>('/api/tickets', {
        method: 'POST',
        body,
      })
    },

    async updateTicket(id: string, body: Partial<Ticket>) {
      const updated = await $fetch<Ticket>(`/api/tickets/${id}`, {
        method: 'PUT',
        body,
      })
      const idx = this.tickets.findIndex((t) => t.id === id)
      if (idx !== -1) this.tickets[idx] = updated
      return updated
    },

    async deleteTicket(id: string) {
      await $fetch(`/api/tickets/${id}`, { method: 'DELETE' })
      this.tickets = this.tickets.filter((t) => t.id !== id)
    },
  },
})
