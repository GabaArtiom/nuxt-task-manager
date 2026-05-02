<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <AppSidebar />
    <div
      class="min-w-0 w-full transition-[margin,width] duration-300"
      :class="sidebarCollapsed ? 'ml-0 md:ml-16 md:w-[calc(100%-4rem)]' : 'ml-0 md:ml-60 md:w-[calc(100%-15rem)]'"
    >
      <AppHeader />
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = useState('sidebar-collapsed', () => false)
</script>
