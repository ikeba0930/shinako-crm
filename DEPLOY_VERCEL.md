# Vercel deployment

This app is deployable on Vercel.

## Required environment variables

Set these in the Vercel project:

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `DATABASE_URL`
- `JWT_SECRET`

When using Vercel Postgres or Neon via Vercel Storage, these are added automatically except `JWT_SECRET`.

## Recommended database flow

1. Create and connect a Postgres database from Vercel Storage.
2. Confirm the Postgres environment variables are present in the Vercel project.
3. Run Prisma schema sync against that database:

```powershell
$env:POSTGRES_PRISMA_URL="postgres://..."
$env:POSTGRES_URL_NON_POOLING="postgres://..."
$env:DATABASE_URL="postgres://..."
npx prisma db push
npm run db:seed
```

## Deploy

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the required environment variables.
4. Deploy.

## Notes

- The build command runs `prisma generate && next build`.
- `postinstall` also runs `prisma generate` so Prisma Client is available in Vercel builds.
- The current local `dev.db` must not be used in production.
