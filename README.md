# Lonestill Bio - Guns.lol Clone

A modern bio page application built with Next.js 15, TypeScript, Turso, and Lucia Auth.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Turso (LibSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Lucia Auth 3.x
- **Validation**: Zod
- **Styling**: TailwindCSS + Framer Motion

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
AUTH_SECRET=your_auth_secret_generate_with_openssl
NODE_ENV=development
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

#### Initialize Turso Database

1. Sign up at [turso.tech](https://turso.tech)
2. Create a new database
3. Get your database URL and auth token
4. Update `.env` file

#### Run Database Migrations

**Option 1: Full database creation (recommended for fresh setup)**
```bash
npm run db:create
```

This will create all tables from scratch:
- `users` - User accounts
- `sessions` - Authentication sessions  
- `profiles` - Bio page profiles

**Option 2: Using Drizzle migrations**
```bash
npm run db:generate
npm run db:push
```

Both methods will create the following tables:
- `users` - User accounts
- `sessions` - Authentication sessions
- `profiles` - Bio page profiles

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/              # Auth routes (login/register)
├── (dashboard)/         # Protected dashboard
├── [username]/          # Dynamic bio pages
├── actions/             # Server Actions
├── layout.tsx           # Root layout
└── page.tsx             # Home page

components/
├── bio-renderer.tsx     # Bio page component
└── dashboard-form.tsx   # Profile editor

db/
├── schema.ts            # Drizzle schema
└── index.ts             # Database connection

lib/
├── auth.ts              # Lucia Auth setup
├── constants.ts         # Reserved usernames
├── validation.ts        # Zod schemas
└── utils.ts             # Utility functions
```

## Features

- ✅ User authentication (register/login)
- ✅ Protected dashboard
- ✅ Bio page with "Click to Enter" overlay
- ✅ Customizable profiles (avatar, background, bio text)
- ✅ Music support (auto-play on unlock)
- ✅ Social links
- ✅ Effects (snow, etc.)
- ✅ View counter
- ✅ OpenGraph metadata for social sharing
- ✅ Reserved username protection

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### DNS Setup (bio.lonestill.uk)

1. Add CNAME record in your DNS provider:
   - **Type**: CNAME
   - **Name**: bio
   - **Target**: cname.vercel-dns.com

2. Add domain in Vercel: Settings → Domains → Add `bio.lonestill.uk`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Notes

- The app uses Lucia Auth 3.x with session cookies
- Profile data is stored in JSON columns for flexibility
- View counter increments on client-side to avoid counting bots
- Reserved usernames are protected (dashboard, login, api, etc.)

## License

MIT