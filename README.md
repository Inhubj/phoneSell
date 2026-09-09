# PhoneSell

Professional Next.js website for buying used smartphones, laptops and tablets in Mumbai, Mira Road, Bhayandar and Thane — with customer OTP login, a multi-step selling wizard, estimated pricing, doorstep pickup, order tracking, and a separate admin operations console.

This is an original PhoneSell product. It is inspired by the *customer journey* of services like Cashify and CellKar, not their branding, copy, layout or code.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM (SQLite locally; switch `provider` to `postgresql` and `DATABASE_URL` for production Postgres)
- JWT httpOnly cookies, bcrypt hashing, hashed time-limited OTPs
- Local `/public/uploads` for device photos (replace with S3/R2 in production)

## Quick start

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Seeded staff logins

| Role | URL | Identifier | Password |
| --- | --- | --- | --- |
| Super admin | `/admin/login` | `nathan.k@example.net` or `admin` | `RoyalAdmin@2026` |
| Operations | `/admin/login` | `yosef.c@example.com` | `RoyalAdmin@2026` |
| Catalogue | `/admin/login` | `tom.h@example.org` | `RoyalAdmin@2026` |
| Reporting | `/admin/login` | `olivia.t@example.org` | `RoyalAdmin@2026` |
| Manager | `/admin/login` | `samuel.w@example.com` | `RoyalAdmin@2026` |
| Executive | `/executive/login` | `RMT-EXE-001` | `Pickup@2026` |

Change these immediately in production. Admin never uses the customer login screen.

Customer OTP is shown on-screen in development (`OTP_BYPASS_DEV=true`). SMS/WhatsApp/Email providers are configured from **Admin → Notifications**.

## Customer journey

Website (public) → **Login** (mobile OTP or email OTP) → Select device type/brand/model → If missing, **+ Others / Add Your Model** → Condition → Photos → Estimate → Pickup → Order `RMT-YYYY-000001` → Track in **My account**.

Marketing, FAQ and SEO pages stay public. `/sell` and `/account` require a verified customer session.

## Admin journey

`/admin/login` → Dashboard → Customers → Login analytics → Orders → Device catalogue → Others requests → Reports → Audit logs.

Roles: Super Admin (full), Operations (orders/customers/pickup), Catalogue (models/Others), Reporting (analytics/export).

## Deploy on Vercel

SQLite (`file:./dev.db`) only works on your laptop. Vercel serverless has no disk, so the homepage crashes with `Environment variable not found: DATABASE_URL` until you attach **Postgres**.

1. Create a free database: [Neon](https://console.neon.tech) or **Vercel Dashboard → Storage → Create Database → Neon / Postgres**.
2. Copy the connection string (`postgresql://…?sslmode=require`). Prefer Neon’s **pooled** URL for queries.
3. In the Vercel project: **Settings → Environment Variables** (Production, Preview, and Development), add:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | your Postgres URL |
| `AUTH_SECRET` | a long random string (not the local default) |
| `APP_URL` | `https://phone-sell-lake.vercel.app` (your live domain) |
| `OTP_BYPASS_DEV` | `false` |

4. Redeploy (**Deployments → … → Redeploy**). The build runs `prisma db push` and seeds the catalogue if the database is empty.

Local development stays on SQLite. Do not put `file:./dev.db` on Vercel.

## Production notes

- Set `AUTH_SECRET`, `APP_URL` (HTTPS), `DATABASE_URL` (Postgres on Vercel).
- Put the site behind HTTPS. Security headers are set in `next.config.ts`.
- Run `npm run db:backup` (or a scheduled copy of the database) before releases.
- Point `public/uploads` to object storage.
- Add live Instagram/Facebook/YouTube URLs in `src/lib/constants.ts`.
- Claim Google Business Profile with the exact NAP: PhoneSell, Singapore Plaza, Opp. Razzas Mall, Mira Road East, Thane 401107, 7068867486.
- Rankings are never guaranteed; the information architecture, schema, sitemap and unique landing pages are built for search performance.
