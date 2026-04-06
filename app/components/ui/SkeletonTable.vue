<template>
  <div class="animate-pulse">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th class="py-2.5 pl-4 pr-3 text-left">
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
            </th>
            <th class="py-2.5 px-3 text-left hidden md:table-cell">
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </th>
            <th class="py-2.5 px-3 text-left hidden lg:table-cell">
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </th>
            <th class="py-2.5 px-3 text-left hidden sm:table-cell">
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </th>
            <th class="py-2.5 px-3 text-left">
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </th>
            <th class="py-2.5 px-3 text-left">
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
          <tr v-for="i in rows" :key="i" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
            <td class="py-3 pl-4 pr-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
            </td>
            <td class="py-3 px-3 hidden md:table-cell">
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
            </td>
            <td class="py-3 px-3 hidden lg:table-cell">
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
            </td>
            <td class="py-3 px-3 hidden sm:table-cell">
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </td>
            <td class="py-3 px-3">
              <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-16"></div>
            </td>
            <td class="py-3 px-3">
              <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rows?: number
}>()
</script>
