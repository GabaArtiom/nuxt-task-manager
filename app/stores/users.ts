import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    loading: false,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        this.users = await $fetch<User[]>('/api/users')
      } finally {
        this.loading = false
      }
    },

    async createUser(body: { name: string; family_name: string; email: string; role: string }) {
      const user = await $fetch<User>('/api/users', {
        method: 'POST',
        body,
      })
      this.users.push(user)
      return user
    },

    async updateUser(id: string, body: Partial<User>) {
      const updated = await $fetch<User>(`/api/users/${id}`, {
        method: 'PUT',
        body,
      })
      const idx = this.users.findIndex((u) => u.id === id)
      if (idx !== -1) this.users[idx] = updated
      return updated
    },

    async toggleLock(id: string) {
      const updated = await $fetch<User>(`/api/users/${id}`, {
        method: 'PATCH',
      })
      const idx = this.users.findIndex((u) => u.id === id)
      if (idx !== -1) this.users[idx] = updated
      return updated
    },
  },
})
