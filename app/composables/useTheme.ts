const isDark = ref(false)

export function useTheme() {
  function init() {
    if (import.meta.server) return
    const stored = localStorage.getItem('theme')
    isDark.value = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    apply()
  }

  function apply() {
    if (import.meta.server) return
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark: readonly(isDark), toggle, init }
}
