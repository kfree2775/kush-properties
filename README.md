# KushProperties

Luxury real estate platform with a data-driven public frontend and a full admin dashboard for zero-redeployment content management.

**Stack**: Vite · Express · MongoDB · Cloudinary

---

## Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)
- **Cloudinary** account — free tier at [cloudinary.com](https://cloudinary.com) (needed for image uploads)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env .env.local   # or edit .env directly
```

Open `.env` and update:

| Variable | What to put | Required |
|----------|-------------|----------|
| `MONGODB_URI` | Your MongoDB connection string | ✅ |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard → Cloud Name | ✅ |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard → API Key | ✅ |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard → API Secret | ✅ |
| `SESSION_SECRET` | Any long random string (min 32 chars) | ✅ |
| `PORT` | Server port (default: `3000`) | Optional |
| `NODE_ENV` | `development` or `production` | Optional |

### 3. Seed the database

This creates default admin user, sample content, and initial config:

```bash
npm run seed
```

Default admin credentials (change after first login):
- **Email**: `admin@kushproperties.in`
- **Password**: `changeme123`

### 4. Run in development

```bash
npm run dev
```

This starts both:
- **Vite** dev server → `http://localhost:5173` (frontend with hot reload)
- **Express** API server → `http://localhost:3000` (backend)

Vite proxies `/api/*` requests to Express automatically.

### Individual servers

```bash
npm run dev:client   # Vite only (frontend)
npm run dev:server   # Express only (backend)
```

---

## Production Build & Deploy

### Build

```bash
npm run build
```

Outputs optimized static files to `./dist/`.

### Run in production

```bash
NODE_ENV=production npm start
```

Express serves the built frontend from `./dist/` and handles `/api/*` routes.

### Deploy to Render.com

1. Push to GitHub
2. Create a new **Web Service** on Render
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all `.env` variables in Render's Environment tab
6. Deploy — Render will run the server on the assigned port

---

## What to Update Before Going Live

### Must Change

| Item | File/Location | What to do |
|------|---------------|------------|
| Admin password | Admin Dashboard → Users | Change from `changeme123` immediately |
| Session secret | `.env` → `SESSION_SECRET` | Replace with a secure random string |
| Cloudinary keys | `.env` → `CLOUDINARY_*` | Add your real Cloudinary credentials |
| MongoDB URI | `.env` → `MONGODB_URI` | Point to your production database |
| Company info | Admin → Site Config | Update branding, contact, RERA, office address |
| WhatsApp number | Admin → Site Config → WhatsApp | Set your actual WhatsApp business number |
| RERA number | Admin → Site Config → RERA | Add your real RERA registration |
| GA4 tracking | Admin → Site Config → Analytics | Add your Google Analytics measurement ID |

### Content to Populate via Admin Dashboard

| Section | Admin Location | Notes |
|---------|---------------|-------|
| Hero slides | Admin → Hero Slides | Add 3–5 high-quality banner images |
| Projects | Admin → Projects | Add your properties with images, specs, pricing |
| Categories | Admin → Categories | Create project categories (Residential, Commercial, etc.) |
| Achievements | Admin → Achievements | Update the counter numbers |
| About page | Admin → About Page | Write your company story, mission, vision |
| Legal pages | Admin → Legal Pages | Update Terms of Service and Privacy Policy |
| Navbar links | Admin → Navbar | Configure navigation links |
| Footer | Admin → Footer | Set footer columns and links |
| Popup | Admin → Popup | Configure lead capture popup (can disable) |
| Cookie banner | Admin → Cookie | Configure cookie consent text |

---

## Project Structure

```
kushproperties/
├── src/                    # Frontend source (Vite)
│   ├── css/
│   │   ├── design-system.css   # Variables, tokens, base styles
│   │   ├── components.css      # Navbar, hero, cards, footer, popup, cookie, WhatsApp
│   │   ├── pages.css           # About, contact, projects, property detail
│   │   ├── animations.css      # Scroll-triggered reveal animations
│   │   └── admin.css           # Admin panel styles
│   ├── js/
│   │   ├── main.js             # Public page controller
│   │   ├── api.js              # API client helpers
│   │   ├── projects-listing.js # Search, filter, paginate
│   │   ├── property-detail.js  # Gallery, lightbox, enquiry
│   │   ├── contact-form.js     # Contact form handler
│   │   ├── popup.js            # Lead capture popup
│   │   ├── cookie-consent.js   # Cookie consent + GA4
│   │   ├── whatsapp.js         # Floating WhatsApp button
│   │   └── admin/              # 16 admin SPA modules
│   ├── assets/
│   │   └── favicon.png
│   ├── index.html              # Homepage
│   ├── about.html
│   ├── contact.html
│   ├── projects.html
│   ├── property.html
│   ├── terms.html
│   ├── privacy.html
│   ├── 404.html
│   ├── admin.html              # Admin dashboard shell
│   └── admin-login.html
├── server/                 # Express backend
│   ├── index.js               # Server entry point
│   ├── routes/
│   │   ├── public.js          # Public API endpoints
│   │   └── admin.js           # Admin router (mounts sub-routers)
│   │       └── admin/
│   │           ├── config.js      # Site, navbar, footer, popup, cookie
│   │           ├── content.js     # Slides, achievements, categories, about, legal
│   │           ├── projects.js    # Project CRUD + gallery + draft/publish
│   │           ├── submissions.js # Leads + contacts + CSV export
│   │           └── users.js       # Admin users + audit logs
│   ├── models/            # 16 Mongoose models
│   ├── middleware/         # Auth, audit, rate limiting
│   └── seed.js            # Database seeder
├── .env                   # Environment config
├── vite.config.js
└── package.json
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both Vite + Express in development |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Express server only |
| `npm run build` | Production build to `./dist/` |
| `npm start` | Start production server |
| `npm run seed` | Seed database with initial data |

---

## Admin Dashboard

Access at `/admin` (or `/admin-login` if not authenticated).

**Sections:**
- **Dashboard** — Stats overview + quick actions
- **Content** — Projects, hero slides, achievements, categories, about page, legal pages
- **Settings** — Site config, navbar, footer, popup, cookie consent
- **Data** — Leads (with CSV export), contact messages
- **System** — Admin users, audit log
