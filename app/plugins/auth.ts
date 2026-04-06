import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // On app init, try to fetch the current user from the cookie
  if (!auth.isAuthenticated) {
    await auth.fetchUser()
  }
})
