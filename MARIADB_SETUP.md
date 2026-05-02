# MariaDB setup

This project is configured for MariaDB/MySQL through Prisma's `mysql` provider.

## Environment

Create `.env` from `.env.example` and set your server connection string:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
JWT_SECRET="change-this-to-a-long-random-secret"
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@tickets.local
APP_URL=http://localhost:3000
```

The database user must be allowed to read/write application tables. For future
Prisma migrations it also needs `CREATE`, `ALTER`, `DROP`, and `REFERENCES`.

## Existing server database with data

Use this path when the MariaDB database already contains the app tables and real
projects/tasks that must be preserved.

1. Make a database backup on the server.
2. Put the real MariaDB URL in `.env`.
3. Generate Prisma Client:

```bash
npm install
npm run postinstall
```

4. Check migration state:

```bash
npm run db:status
```

5. If Prisma says the database is not empty and the baseline is not applied,
mark the current schema as already applied:

```bash
npm run db:baseline
```

6. After the baseline is recorded, future schema changes should be deployed with:

```bash
npm run db:deploy
```

Do not run `npm run db:reset` on the server. It drops data.

## Empty local MariaDB

For a fresh local database, you can run:

```bash
docker-compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

The seed script skips itself when users already exist.
