export default defineNuxtPlugin(() => {
  const notificationsStore = useNotificationsStore()
  notificationsStore.init()
})
