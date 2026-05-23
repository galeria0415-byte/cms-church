# Grace Harbor Church CMS

Production-ready church website and CMS built with Next.js, TypeScript, Tailwind CSS, Prisma, MySQL, NextAuth credentials authentication, React Hook Form, and Zod.

## Features

- Public website pages for home, about, ministries, programs, events, gallery, updates, and contact
- Secure admin login with seeded roles: `ADMIN`, `EDITOR`, `STAFF`, `VIEWER`
- Membership database with full CRUD, search/filter/sort/pagination, profile photo uploads, and soft archive
- CMS modules for posts, events, programs, and galleries
- Reusable dashboard reminders for birthdays, wedding anniversaries, and death anniversaries based on month/day matching
- Prisma schema, initial SQL migration, TypeScript seed data, and local-build cPanel deploy automation

## Stack

- Frontend: Next.js App Router + TypeScript
- Styling: Tailwind CSS v4
- Database: MySQL
- ORM: Prisma
- Auth: NextAuth credentials + JWT sessions
- Forms: React Hook Form + Zod
- Date handling: date-fns

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Copy the environment file and update the values for your machine.

```bash
copy .env.example .env
```

3. Create a MySQL database named `church_cms` or adjust `DATABASE_URL` in `.env`.

4. Apply the schema to the database.

```bash
npm run db:push
```

5. Seed sample users, members, posts, events, programs, and gallery data.

```bash
npm run prisma:seed
```

6. Start development.

```bash
npm run dev
```

7. Open `http://localhost:3000`.

## cPanel Recommendation

For cPanel deployment, use MySQL rather than PostgreSQL.

Why:
- MySQL is the standard database provided on most cPanel plans.
- cPanel database tooling is usually centered on MySQL or MariaDB.
- This project has been adjusted to use MySQL-safe storage for member list fields.

Recommended deployment flow:

```bash
npm run deploy:cpanel
```

Useful variants:

```bash
npm run deploy:cpanel:no-git
npm run deploy:cpanel:dry-run
```

Detailed guide:

- `docs/CPANEL-DEPLOYMENT-STEP-BY-STEP.md`

## Seeded Logins

- Admin: `admin@graceharbor.org` / `ChangeMe123!`
- Editor: `editor@graceharbor.org` / `ChangeMe123!`
- Staff: `staff@graceharbor.org` / `ChangeMe123!`
- Viewer: `viewer@graceharbor.org` / `ChangeMe123!`

Change these passwords immediately in a real deployment.

## Database Workflow

- Generate Prisma client: `npm run prisma:generate`
- Push schema to database: `npm run db:push`
- Run seed: `npm run prisma:seed`
- Initial SQL migration: `prisma/migrations/202605230000_init/migration.sql`

## Project Structure

```text
prisma/
	migrations/
	schema.prisma
	seed.ts
public/
src/
	app/
	components/
	lib/
	types/
```

## Notes

- Uploads are stored in `public/uploads` for local and basic server-hosted deployments.
- Anniversary widgets compare only month and day, so reminders recur annually.
- Member archiving uses a soft-delete approach by setting `isArchived` and `recordStatus`.

## Production Checklist

1. Replace `NEXTAUTH_SECRET` with a strong random secret.
2. Point `DATABASE_URL` to your production MySQL instance.
3. Run `npm run db:push` or apply the included SQL migration through your deployment workflow.
4. Seed only if you want sample data in the target environment.
5. Update seeded passwords and create real staff accounts.
