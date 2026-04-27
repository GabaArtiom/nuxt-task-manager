import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async fetchUser() {
      try {
        // Pass browser cookies during SSR so the server API can read auth_token
        const headers = import.meta.server
          ? useRequestHeaders(['cookie'])
          : undefined

        const { user } = await $fetch<{ user: User }>('/api/auth/me', { headers })
        this.user = user
      } catch {
        this.user = null
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const { user } = await $fetch<{ user: User }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        this.user = user
        return user
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
      navigateTo('/login')
    },
  },
})
