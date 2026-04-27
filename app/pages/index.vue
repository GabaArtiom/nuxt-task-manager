<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
navigateTo('/projects', { replace: true })
</script>
