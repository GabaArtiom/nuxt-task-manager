<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
    <AppSidebar />
    <div class="flex-1 transition-all duration-300" :class="sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-60'">
      <AppHeader />
      <main class="p-6">
        <slot />
      </main>
    </div>

    <ClientOnly>
      <ToastNotification
        :visible="showNotification"
        :message="notificationMessage"
        :type="notificationType"
        @close="closeNotification"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = useState('sidebar-collapsed', () => false)

const { showNotification, notificationMessage, notificationType, closeNotification } = useRealtimeUpdates()
</script>
