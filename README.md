# bio.lonestill.uk

Full-stack profile-link platform built with Next.js and Turso.

Users can create a customizable public profile, organize links, choose effects and badges, connect external accounts, view analytics, and manage privacy settings from a dashboard.

## Features

- Profile pages, link stacks, themes, frames, and badges
- GitHub and Spotify connections
- Page-view and click analytics
- Guestbook and support tickets
- User dashboard and admin console
- API tokens and English/Russian localization

## Stack

Next.js 15, React 18, TypeScript, Tailwind CSS, Drizzle ORM, libSQL/Turso, Lucia, UploadThing, and `next-intl`.

## Local development

```bash
git clone https://github.com/lonestill/bio.lonestill.uk.git
cd bio.lonestill.uk
npm ci
npm run dev
```

Configure `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, OAuth credentials for GitHub and Spotify, and `NEXT_PUBLIC_BASE_URL` as needed. Keep all secrets and database exports out of source control.

## Database

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

The `scripts/` directory contains historical one-off migrations. Review each script and back up the database before running it.

## Production build

```bash
npm run build
npm run start
```

## License

No license has been declared.
