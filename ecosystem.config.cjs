module.exports = {
  apps: [
    {
      name: 'task-manager',
      script: './.output/server/index.mjs',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:/var/www/task-manager/prisma/prod.db',
        JWT_SECRET: '',         // заполни на сервере
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_USER: '',          // заполни на сервере
        SMTP_PASS: '',          // заполни на сервере
        FROM_EMAIL: '',         // заполни на сервере
        APP_URL: 'https://tasks.umervtilte.lol',
      }
    }
  ]
}
