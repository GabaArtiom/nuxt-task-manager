// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  watch: ['!**/prisma/**', '!**/.git/**'],

  vite: {
    server: {
      watch: {
        ignored: ['**/prisma/**', '**/.git/**', '**/node_modules/**'],
      },
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    langDir: '../i18n/locales',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
    ],
    lazy: false,
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'en',
    },
    bundle: {
      fullInstall: true,
    },
  },

  app: {
    head: {
      title: 'Ticket Manager Challenge',
      script: [
        {
          innerHTML: `(function(){var s=localStorage.getItem('theme');if(s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          type: 'text/javascript',
        },
      ],
    },
  },

  nitro: {
    routeRules: {
      '/sse': { headers: { 'X-Accel-Buffering': 'no' } },
    },
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars',
    smtpHost: process.env.SMTP_HOST || 'localhost',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@tickets.local',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },
})
