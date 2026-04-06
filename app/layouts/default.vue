<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
    <AppSidebar />
    <div class="flex-1 ml-0 md:ml-60">
      <AppHeader />
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
