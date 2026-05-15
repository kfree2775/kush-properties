# KushProperties — Final Specification

> **This is the single source of truth for building KushProperties.** No other spec documents exist.

---

## 1. Project Overview

A luxury real estate website for **KushProperties** with a public-facing site (Homepage, About, Contact, Projects Listing, Property Detail) and a **graphical admin panel** for 4 admin users to manage all dynamic content visually.

**Stitch Design Project**: ID `12540579130437898339` — "Nocturne Manor" design system. **✅ Design FINALIZED.** See [design_review.md](file:///C:/Users/piyus/.gemini/antigravity/brain/813ae928-4a85-4baa-b698-0eef000acaef/design_review.md) for all 6 mockups.

---

## 2. Core Principle: Zero Redeployment

> **Once deployed, no code changes or redeployments should ever be needed.**

### ENV Variables (Deploy-time only — infrastructure secrets)
```
MONGODB_URI
CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
SESSION_SECRET
NODE_ENV
PORT
ADMIN_SEED              # JSON array: [{"name":"...","email":"...","password":"..."}]
                         # Production: REQUIRED — missing = fail startup (no predictable defaults)
                         # Development: If missing, seeds default admin with console warning
```

### Database (Runtime-editable via admin — everything else)
GA Measurement ID, WhatsApp number, logo, favicon, all text, all content, all config — everything the user sees lives in the DB.

### HTML Pages — Server-Side Head Injection for SEO
HTML files are **shells** with a `<body>` rendered client-side. However, Express **injects `<head>` tags server-side** before serving, so crawlers and social previews get proper metadata:

```js
// For dynamic pages (property/:slug, /terms, /privacy):
// Express reads SEO fields from DB → injects <title>, <meta description>, <meta og:*> into HTML
// For static pages (/, /about, /contact, /projects):
// Express reads SiteConfig.branding.companyName + page-specific defaults from DB
// Body content is still fetched client-side via API calls
```

This gives us proper `<title>`, `og:title`, `og:description`, `og:image` for social sharing and Google indexing without full SSR.

### Reliability Rules
1. Every API endpoint has try-catch with meaningful error responses
2. Every DB query has fallback defaults — never a blank page
3. Image loading has fallback placeholders if Cloudinary is unreachable
4. Graceful degradation — if one section fails, the rest still renders
5. Input validation on both client and server
6. Rate limiting on public form endpoints
7. Env secrets never in code

### Fallback Content Policy

| Section | If Empty/Failed |
|---------|----------------|
| Navbar | Hardcoded fallback: Home, About, Projects, Contact |
| Slideshow | Single placeholder slide "Welcome to KushProperties" |
| Achievements | **Hide section entirely** |
| Projects | "Coming Soon" message |
| Footer | Minimal company name + copyright only |
| About/Contact | "Content coming soon" placeholder |
| Legal pages | "This page is being updated" |
| Popup / Cookie / WhatsApp | Don't show |

Seed script populates demo content. Fallbacks are last resort.

---

## 3. Confirmed Decisions

| Decision | Choice |
|----------|--------|
| Company Name | **KushProperties** |
| Database | **MongoDB Atlas** (free tier) |
| Image Storage | **Cloudinary** (free tier) |
| Deployment | **Render** (web service) |
| Admin Accounts | **4 users** (seeded via script) |
| Rich Text Format | **Sanitized HTML** (sanitize-html server, DOMPurify client) |
| Lightweight Editor | **Pell** (~1KB) or custom contenteditable toolbar |
| Logging | **Winston console-only** (Render-compatible, no file logs) |

---

## 4. Design System: "Nocturne Manor" ✅ FINALIZED

**6 Screens** (Gemini 3.1 Pro, Indian context):
1. Homepage — Hero slideshow, achievements, project cards (₹, Maharashtra)
2. Lead Capture Popup — Glassmorphism modal, +91 phone, T&C hyperlink
3. Admin Panel — Split-pane WYSIWYG editor, 9-section sidebar
4. About Us — Company story, Mission/Vision, key numbers, RERA
5. Contact Us — Form + info cards (Pune address), Google Maps
6. Property Detail — Image gallery, ₹ pricing, BHK specs, MahaRERA, amenities

| Token | Value | Usage |
|-------|-------|-------|
| Primary (Gold) | `#e6c487` / `#c9a96e` | CTAs, accents, highlights |
| Background | `#12121f` | Page background |
| Surface Lowest | `#0d0d1a` | Deepest layer |
| Surface Container | `#1e1e2c` | Cards, sections |
| Surface Container High | `#292937` | Interactive elements |
| On Surface | `#e3e0f4` | Primary text |
| On Surface Variant | `#d0c5b5` | Secondary text |
| Outline Variant | `#4d463a` | Ghost borders (15% opacity) |
| Headline Font | Plus Jakarta Sans | Headlines, display text |
| Body Font | Inter | Body text, labels |
| Roundness | 8px | Card/button corners |

**Rules**: No hard borders (tonal layering only), glassmorphism for modals/navbar, gold gradient CTAs, ambient navy shadows (40-60px blur, 4-8% opacity), 300ms+ transitions.

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **Vite + Vanilla JS** (ES6 modules) |
| Styling | **Vanilla CSS** with CSS custom properties |
| Backend | **Node.js + Express** |
| Database | **MongoDB Atlas** (Mongoose ODM) |
| Image Upload | **Cloudinary** + **multer-storage-cloudinary** |
| Auth | **express-session** + **connect-mongo** |
| CSRF | **csrf-csrf** (double-submit cookie pattern) |
| Rate Limiting | **express-rate-limit** |
| Password Hash | **bcrypt** (cost factor 12) |
| Logging | **Winston** (console transport only) |
| Sanitization | **sanitize-html** (server) + **DOMPurify** (client) |
| Deployment | **Render** (single web service) |

### Security Rules
- **CSRF**: Double-submit cookie on all admin mutation routes. Token delivered via **server-side injection** into `admin.html` and `admin-login.html` (Express replaces `<!--CSRF_TOKEN-->` placeholder with a `<meta name="csrf-token">` tag). JS reads from meta, sends via `X-CSRF-Token` header on every POST/PUT/DELETE.
- **Login rate limit**: 5 attempts per 15 min per IP on `/api/admin/login`.
- **Session cookies**: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (production), `maxAge: 24h`.
- **Password hashing**: bcrypt, cost factor 12.
- **Upload validation**: multer fileFilter allowlist (JPEG/PNG/WebP only), max 5MB per file, Cloudinary auto-transforms (quality auto, format auto, max 1920px width). On image replace/delete, old Cloudinary asset is destroyed via `publicId`.

---

## 6. Data Models (16 Mongoose Models)

### `SiteConfig` — Single Document
```js
{
  branding: {
    companyName: String,       // "KushProperties"
    tagline: String,
    logoUrl: String,           // Cloudinary URL
    logoPublicId: String,
    faviconUrl: String,
    faviconPublicId: String
  },
  contact: {
    phonePrimary: String,      // "+91 98XXX XXXXX"
    phoneSecondary: String,
    emailPrimary: String,
    emailSales: String,
    addressFull: String,
    officeHours: String,
    mapEmbedUrl: String        // Google Maps iframe URL
  },
  social: [{ platform: String, url: String, icon: String, sortOrder: Number }],
  whatsapp: { number: String, enabled: Boolean },
  analytics: { gaMeasurementId: String, enabled: Boolean },
  rera: { companyRegNumber: String, disclaimerText: String },
  pageSeo: {                   // SEO for static pages (not property/legal which have their own)
    home:     { title: String, metaDescription: String, ogImage: String },
    about:    { title: String, metaDescription: String, ogImage: String },
    contact:  { title: String, metaDescription: String, ogImage: String },
    projects: { title: String, metaDescription: String, ogImage: String }
  },
  copyright: String,
  updatedAt: Date
}
```

### `NavbarConfig` — Single Document
```js
{
  links: [{ label: String, href: String, sortOrder: Number, isExternal: Boolean }],
  ctaText: String,             // "Book a Visit"
  ctaPhone: String,
  updatedAt: Date
}
```

### `FooterConfig` — Single Document
```js
{
  aboutText: String,
  columns: [{
    title: String,
    links: [{ label: String, href: String, sortOrder: Number }],
    sortOrder: Number
  }],
  updatedAt: Date
}
```

### `PopupConfig` — Single Document
```js
{
  enabled: Boolean,
  delaySeconds: Number,        // Default: 30
  heading: String,
  subtext: String,
  ctaText: String,
  // Fields are FIXED to fullName/email/phone. Admin can only edit labels and required state.
  fields: [
    { name: 'fullName', label: String, required: Boolean },
    { name: 'email', label: String, required: Boolean },
    { name: 'phone', label: String, required: Boolean }
  ],
  updatedAt: Date
}
```
**Rule: Admin cannot add/remove input fields.** This keeps the Lead model clean with fixed `fullName`, `email`, `phone` columns.

**T&C checkbox is a separate fixed UI element** — always rendered, always required, not part of `PopupConfig.fields`. Maps to `Lead.agreedTc`. Admin cannot remove or disable it. **Link is hardcoded to `/terms`** — not sourced from nav/footer config.

### `CookieConfig` — Single Document
```js
{
  enabled: Boolean,
  bannerText: String,
  acceptText: String,
  declineText: String,
  policyLinkText: String,
  updatedAt: Date
}
```

### `LegalPage` — Collection (multiple docs)
```js
{
  slug: String,                // "terms", "privacy" — unique indexed
  title: String,
  content: String,             // Published sanitized HTML
  metaTitle: String,
  metaDescription: String,
  isPublished: Boolean,
  draftOverrides: Object,      // null = no pending draft. Stores any subset of { title, content, metaTitle, metaDescription }
  updatedAt: Date
}
```

### `Slide`
```js
{ imageUrl: String, publicId: String, headline: String, ctaText: String,
  ctaLink: String, sortOrder: Number, createdAt: Date }
```

### `Achievement`
```js
{ number: String, label: String, icon: String, sortOrder: Number }
```
**Rule: Always exactly 4 achievement cards.** Seeded on first run. Admin can only edit number/label/icon via `PUT /:id`. Cannot add or delete.

### `Category`
```js
{ name: String, slug: String (unique indexed), sortOrder: Number }
```
**Deletion rule: Block delete if any projects reference this category.** Admin must reassign projects first.

### `Project`
```js
{
  name: String,
  slug: String,                         // unique, auto-generated
  location: String,
  coordinates: { lat: Number, lng: Number },
  priceRange: String,                   // Display text: "Starting ₹85 Lakhs"
  priceNumeric: Number,                 // Sortable value in Lakhs: 85. REQUIRED for published projects. Used for price_asc/price_desc.
  status: String,                       // enum: active, sold_out, coming_soon
  isPublished: Boolean,
  category: ObjectId (ref Category),
  coverImage: { url: String, publicId: String },
  images: [{ url, publicId, caption, sortOrder }],  // Max 20 images per project
  description: String,                  // Sanitized HTML
  amenities: [String],
  specs: { area, bedrooms, bathrooms, floors, totalUnits, possessionDate, yearBuilt },
  reraNumber: String,                   // "MahaRERA P52100XXXXX"
  seo: { metaTitle, metaDescription, ogImage: { url, publicId } },
  sortOrder: Number,
  featuredRank: Number,                 // null = not featured (sorts last), lower number = higher priority
  draftOverrides: Object,               // null = no pending draft. Any subset of above fields.
  createdAt: Date, updatedAt: Date
}
```
**Draft workflow**: New unpublished project → all fields are editable directly, `isPublished: false`. Already-published project → edits save to `draftOverrides`. On "Publish", `draftOverrides` is merged into main fields, then set to `null`. Preview API merges `draftOverrides` on top of published fields for display.

### `Lead`
```js
{ fullName: String, email: String, phone: String, agreedTc: Boolean,
  propertyInterest: ObjectId (optional ref Project), source: String,
  contacted: Boolean, createdAt: Date }
```

### `ContactSubmission`
```js
{ name: String, email: String, phone: String, message: String,
  read: Boolean, createdAt: Date }
```

### `AdminUser`
```js
{ name: String, email: String (unique indexed), passwordHash: String,
  role: String, lastLogin: Date, createdAt: Date }
```
**Role policy: All 4 admins are equivalent.** `role` is always `'admin'`. Field exists for future extensibility only — no authorization checks beyond "is admin".

### `AuditLog`
```js
{ adminUser: ObjectId, action: String, collection: String,
  documentId: String, changes: Object, timestamp: Date }
// TTL index: auto-delete after 90 days
```

### `AboutContent` — Single Document
```js
{ heroImage: { url, publicId }, heroTagline: String,
  storyTitle: String, storyContent: String,       // Published sanitized HTML
  mission: String, vision: String,
  teamMembers: [{ name, role, image: { url, publicId } }],  // Max 10 team members
  isPublished: Boolean,
  draftOverrides: Object,     // null = no pending draft. Any subset of { heroImage, heroTagline, storyTitle, storyContent, mission, vision, teamMembers }
  updatedAt: Date }
```
**Same pattern as Project.** Edits to published about page go into `draftOverrides`. On publish, merge and clear.

### `draftOverrides` Merge Rules (applies to Project, AboutContent, LegalPage)
- **Shallow merge at top-level keys.** Each key in `draftOverrides` replaces the entire corresponding key in the published document.
- Example: `draftOverrides: { specs: { area: "1200", bedrooms: "3" } }` replaces the entire `specs` object, not individual sub-fields.
- Example: `draftOverrides: { images: [...] }` replaces the entire `images` array.
- Example: `draftOverrides: { name: "New Name" }` replaces only `name`, all other published fields remain.
- On **Publish**: `Object.assign(doc, doc.draftOverrides); doc.draftOverrides = null; doc.save()`
- On **Preview**: Server returns `Object.assign({}, doc.toObject(), doc.draftOverrides)` without saving.
- On **Discard**: `doc.draftOverrides = null; doc.save()`

### `SeedVersion`
```js
{ version: Number, appliedAt: Date }
```

---

## 7. Database Indexes

```js
Project:           { slug: 1 } unique, { category: 1, isPublished: 1, sortOrder: 1 }, { isPublished: 1, featuredRank: 1 }
Category:          { slug: 1 } unique
AdminUser:         { email: 1 } unique
Lead:              { createdAt: -1 }, { contacted: 1 }
ContactSubmission: { createdAt: -1 }, { read: 1 }
AuditLog:          { timestamp: -1 }, { collection: 1, documentId: 1 }, TTL 90 days
LegalPage:         { slug: 1 } unique
Slide:             { sortOrder: 1 }
```

---

## 8. Express Routing Strategy

```js
// serve() reads the HTML shell, injects <head> SEO tags from DB, then sends
// If ?preview=true AND admin session exists, seoFetcher uses merged draft data
// If no admin session or no ?preview, seoFetcher uses published data only
function serve(file, seoFetcher) { /* reads file, calls seoFetcher(req), 
   replaces <!--SEO_PLACEHOLDER--> with <title>, <meta>, <og:*> tags */ }

app.get('/',               serve('index.html', fetchHomeSEO));
app.get('/about',          serve('about.html', fetchAboutSEO));
app.get('/contact',        serve('contact.html', fetchContactSEO));
app.get('/projects',       serve('projects.html', fetchProjectsSEO));
app.get('/property/:slug', serve('property.html', fetchPropertySEO)); // reads Project.seo by slug
app.get('/terms',          serve('terms.html', fetchLegalSEO));       // reads LegalPage by slug
app.get('/privacy',        serve('privacy.html', fetchLegalSEO));
app.get('/admin',          serve('admin.html'));
app.get('/admin/login',    serve('admin-login.html'));

app.use('/api/admin', adminRoutes);   // Mount FIRST to avoid overlap with /api
app.use('/api',       publicRoutes);

app.use('*',          (req, res) => res.status(404).sendFile('404.html'));
```

`property.html` reads slug from `window.location.pathname.split('/property/')[1]` and calls `GET /api/projects/by-slug/:slug`.

---

## 9. API Routes

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bootstrap` | **Aggregated homepage payload** (siteConfig, navbar, footer, slides, achievements, featuredProjects, categories, popup, cookie) |
| GET | `/api/projects?category=&q=&sort=&page=&pageSize=` | Projects listing (published only, paginated). `q`: search on name+location. `sort`: `newest` (createdAt desc, **default**), `price_asc` (priceNumeric asc), `price_desc` (priceNumeric desc), `name` (alphabetical asc). `pageSize`: default 12. **Response**: `{ projects: [...], total, page, pageSize, totalPages }` |
| GET | `/api/projects/by-slug/:slug` | Single project detail (published only). **Response includes `similarProjects`**: same category, exclude current, published only, limit 3, ordered by featuredRank then createdAt desc. If <3 in category, fills from other published projects. |
| GET | `/api/about` | About page content (published only) |
| GET | `/api/legal/:slug` | Legal page by slug (published only) |
| POST | `/api/leads` | Submit lead/popup form |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/health` | Health check: `{ status, db, uptime, timestamp }` |

### Admin (Protected — requires session)
| Group | Routes |
|-------|--------|
| **Auth** | POST `/login`, POST `/logout`, GET `/session` |
| **Slides** | POST create, PUT `/:id`, DELETE `/:id`, PUT `/reorder` |
| **Achievements** | PUT `/:id` |
| **Categories** | POST, PUT `/:id`, DELETE `/:id` **(returns 409 with `{ error: "Cannot delete: N projects use this category" }` if projects reference it)** |
| **Projects** | POST, PUT `/:id`, DELETE `/:id` (supports draft/publish) |
| **About** | GET, PUT (draft + publish) |
| **Site Config** | GET, PUT (branding, contact, social, whatsapp, analytics, rera) |
| **Navbar** | GET, PUT |
| **Footer** | GET, PUT |
| **Popup** | GET, PUT |
| **Cookie** | GET, PUT |
| **Legal Pages** | GET all, PUT `/:slug` |
| **Leads** | GET all, PUT `/:id` (mark contacted), DELETE `/:id`, DELETE `/bulk` (body: `{ olderThanDays: N }`), GET `/export` (CSV) |
| **Messages** | GET all, PUT `/:id` (mark read), DELETE `/:id` |
| **Preview** | All under `/api/admin/preview/*`. All require admin session. All return data with `draftOverrides` merged on top of published fields. Routes: GET `/homepage` (bootstrap-like payload with all draft content merged), GET `/about` (AboutContent with draftOverrides merged), GET `/legal/:slug` (LegalPage with draftOverrides merged), GET `/project/:slug` (Project with draftOverrides merged, regardless of isPublished), GET `/projects` (all projects including unpublished, with draftOverrides merged, for admin card-grid preview). |
| **Audit Log** | GET (recent activity for dashboard) |
| **Settings** | POST `/logo` (upload), POST `/favicon` (upload) |

---

## 10. Public Pages

### 10.1 Homepage
1. Sticky glassmorphism navbar (logo, links, phone CTA)
2. Hero slideshow (85vh, auto-slide 10s, manual arrows + dots, crossfade 800ms)
3. Achievement bar (4 animated counters, IntersectionObserver)
4. Featured projects (category tabs, card grid, "View All Projects →" CTA)
5. Footer (4 columns, RERA disclaimer)

### 10.2 Projects Listing (`/projects`)
- Dedicated page with search, category filter, sort, pagination
- Navbar "Projects" links here
- Homepage only shows featured/top projects

### 10.3 About Page
- Hero banner + tagline
- Company story/history (sanitized HTML)
- Mission & Vision glass cards
- Team section (photos, names, roles)
- CTA banner

### 10.4 Contact Page
- Two-column: form (left) + info cards (right)
- Google Maps embed (admin-configurable URL)
- Office hours

### 10.5 Property Detail (`/property/:slug`)
- Image gallery (cover + thumbnails, lightbox)
- Name, location, price, RERA number, status badge
- Key specs bar (BHK, Sq.Ft., floors, possession, units)
- Description (sanitized HTML) + amenities grid
- **Map**: Google Maps embed via iframe: `https://maps.google.com/maps?q={lat},{lng}&output=embed`. If coordinates missing, fallback to `https://maps.google.com/maps?q={encodeURIComponent(project.location)}&output=embed` (search by location text). No external JS library.
- "Enquire Now" CTA (pre-fills lead form)
- **Similar projects**: Same category, exclude current slug, published only, limit 3, by featuredRank then newest. If <3 in category, backfill from other published.

### 10.6 Terms & Privacy Pages
- Placeholder content, editable via admin (sanitized HTML)

### 10.7 404 Page
- Dark luxury themed, "404" in gold, "Back to Home" CTA

---

## 11. Admin Panel

### Authentication
- `admin-login.html` — dark themed login page
- 4 admin accounts seeded via startup script
- Sessions stored in MongoDB (connect-mongo)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  Top Bar: Admin Name | "View Live Site" button       │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Main Area (split-pane)                   │
│          │  ┌────────────────┬─────────────────┐    │
│ Dashboard│  │ Live Preview   │ Edit Form Panel  │    │
│ Slideshow│  │ (iframe with   │ (CRUD fields)    │    │
│ Achievmts│  │ ?preview=true) │                  │    │
│ Projects │  │                │ [Save Draft]     │    │
│ About    │  │                │ [Publish]        │    │
│ Contact  │  │ [Refresh ↻]   │ [Discard]        │    │
│ Leads    │  └────────────────┴─────────────────┘    │
│ Messages │                                           │
│ Settings │                                           │
└──────────┴──────────────────────────────────────────┘
```

### Live Preview
- **iframe pointing to actual public page** with `?preview=true` query param
- `?preview=true` tells public JS to fetch from **`/api/admin/preview/*`** instead of `/api/*` (requires admin session cookie)
- Preview endpoints: `/api/admin/preview/homepage`, `/api/admin/preview/about`, `/api/admin/preview/legal/:slug`, `/api/admin/preview/project/:slug`, `/api/admin/preview/projects`
- Preview payloads merge `draftOverrides` on top of published fields before returning
- Zero drift — preview uses the real rendering engine
- "Refresh Preview" button reloads iframe after saving

### Admin Safety

**Two-tier draft/publish model:**

| Tier | Content Types | Behavior |
|------|--------------|----------|
| **Draft/Publish** | Projects, AboutContent, LegalPages | Uses `draftOverrides` pattern. Edits to published content save to `draftOverrides`. On "Publish", overrides merge into main fields and clear. Public API only returns published. Preview API merges overrides for display. |
| **Always Live** | SiteConfig, NavbarConfig, FooterConfig, PopupConfig, CookieConfig, Slides, Achievements | Edits go live immediately on save. Low-risk config changes. **Audit trail only** — audit log records all changes for accountability, but does NOT provide automated rollback. If a config edit is wrong, admin manually re-edits. |

- **Audit Log**: Every write logs to AuditLog. Dashboard shows recent activity. **Audit-only, not rollback.** For accountability and debugging.
- **Optimistic Concurrency**: Save sends `updatedAt`. Server returns 409 if stale.
- **Unsaved Warning**: `beforeunload` on dirty forms.

### Admin Sections (9)

| Section | Preview | Edit Form |
|---------|---------|-----------|
| **Dashboard** | Stats + recent audit log | Read-only |
| **Slideshow** | Slide order strip | Upload/delete/reorder, edit headline/CTA per slide |
| **Achievements** | 4 cards (public layout) | Edit number, label, icon |
| **Projects** | Card grid | Full CRUD: name, slug, location, price, status, category, description (rich text editor), images, amenities, specs, RERA, SEO, draft/publish |
| **About** | About page preview | Story (rich text), mission, vision, team members, draft/publish |
| **Contact** | Contact page preview | Address, phones, emails, hours, map URL |
| **Leads** | Table | View, mark contacted, delete, export CSV, bulk purge |
| **Messages** | Table | View contact form submissions, mark read, delete |
| **Settings** | — | Logo upload, favicon upload, navbar config, footer config, popup config, cookie config, legal pages (rich text), social links, RERA, copyright, analytics |

---

## 12. Additional Features

### WhatsApp Floating Button
- Sticky bottom-right, green icon, pulse on hover
- Opens `wa.me/{SiteConfig.whatsapp.number}`
- Hidden on admin pages, hidden if `whatsapp.enabled === false`

### Cookie Consent + GA4 (Consent-First)
```
User lands → Banner shows (if not previously answered)
├─ "Accept" → localStorage = "accepted" → GA4 injected dynamically → tracking starts
├─ "Decline" → localStorage = "declined" → GA4 NOT loaded. Zero tracking.
└─ Ignored → No GA loaded
```
Custom GA events: `lead_form_submit`, `contact_form_submit`, `whatsapp_click`, `property_view`

### Scroll Animations
- IntersectionObserver (custom, no library), `data-animate` attribute
- Staggered fade-in for grid items
- Respects `prefers-reduced-motion`

### RERA Compliance
- **Company-level**: `SiteConfig.rera` — shown in footer of every page
- **Project-level**: `Project.reraNumber` — shown on property cards + detail page
- Disclaimer text admin-editable

### Logo & Favicon
- AI-generated, gold on dark/transparent
- Stored in Cloudinary, URL in `SiteConfig.branding`

---

## 13. File Structure

```
kushproperties/
├── package.json
├── vite.config.js
├── .env
├── render.yaml
│
├── server/
│   ├── index.js                  # Express entry
│   ├── db.js                     # Mongoose connection
│   ├── logger.js                 # Winston console-only
│   ├── validate-env.js           # Fail-fast env check
│   ├── seed.js                   # Versioned seed script
│   ├── cloudinary.js             # Cloudinary config
│   ├── middleware/
│   │   ├── auth.js               # Session auth
│   │   └── audit.js              # Audit log middleware
│   ├── models/
│   │   ├── SiteConfig.js
│   │   ├── NavbarConfig.js
│   │   ├── FooterConfig.js
│   │   ├── PopupConfig.js
│   │   ├── CookieConfig.js
│   │   ├── LegalPage.js
│   │   ├── Slide.js
│   │   ├── Achievement.js
│   │   ├── Category.js
│   │   ├── Project.js
│   │   ├── Lead.js
│   │   ├── ContactSubmission.js
│   │   ├── AdminUser.js
│   │   ├── AuditLog.js
│   │   ├── AboutContent.js
│   │   └── SeedVersion.js
│   └── routes/
│       ├── public.js
│       └── admin.js
│
├── src/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── projects.html
│   ├── property.html
│   ├── terms.html
│   ├── privacy.html
│   ├── 404.html
│   ├── admin.html
│   ├── admin-login.html
│   ├── css/
│   │   ├── design-system.css
│   │   ├── main.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   ├── animations.css
│   │   └── admin.css
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   ├── slideshow.js
│   │   ├── popup.js
│   │   ├── achievements.js
│   │   ├── projects.js
│   │   ├── projects-listing.js
│   │   ├── property-detail.js
│   │   ├── contact-form.js
│   │   ├── scroll-animations.js
│   │   ├── cookie-consent.js
│   │   ├── whatsapp.js
│   │   └── admin/
│   │       ├── admin.js
│   │       ├── slides-manager.js
│   │       ├── achievements-manager.js
│   │       ├── projects-manager.js
│   │       ├── about-manager.js
│   │       ├── contact-manager.js
│   │       ├── leads-manager.js
│   │       ├── messages-manager.js
│   │       └── settings-manager.js
│   └── assets/                    # Seed/fallback assets ONLY (used before admin uploads to Cloudinary)
│       ├── logo.svg               # Fallback logo — replaced once admin uploads via Settings
│       └── favicon/               # Fallback favicons — replaced once admin uploads
```

---

## 14. Implementation Phases

| Phase | Scope | Files |
|-------|-------|-------|
| **1. Foundation** | Vite + Express + MongoDB + Cloudinary + Winston, env validation, all 16 Mongoose models, versioned seed, design-system.css, logo/favicon | ~22 |
| **2. Homepage** | Navbar, slideshow, achievements, featured projects, footer, WhatsApp, scroll animations, bootstrap API | ~10 |
| **3. Pages** | About, Contact, Property Detail, Projects listing, T&C, Privacy, 404, admin-login | ~12 |
| **4. Popup + UX** | Lead popup (configurable timer), cookie consent (consent-first GA), RERA disclaimer | ~4 |
| **5. Admin Backend** | Auth, all CRUD routes, audit log middleware, image upload, CSV export, draft/publish, optimistic concurrency, preview API, health endpoint | ~12 |
| **6. Admin Frontend** | Layout, 9 section managers, iframe preview, unsaved warning, rich text editor | ~12 |
| **7. Polish** | GA4 (consent-gated), responsive pass, SEO meta, performance, Render deploy | ~4 |

**Total: ~70 files**

---

## 15. Ops & Infrastructure

### Environment Validation
```js
// Fail fast on missing secrets — app won't start
const REQUIRED = ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'SESSION_SECRET'];

// ADMIN_SEED behavior:
// - Production (NODE_ENV=production): ADMIN_SEED is REQUIRED. Missing = fail startup.
//   No predictable default credentials in production.
// - Development: If missing, seeds default admin (admin@kushproperties.in / changeme123)
//   with console warning.
```

### Rate Limits
```
/api/admin/login:  5 requests per 15 min per IP
/api/leads:       10 requests per 15 min per IP
/api/contact:      5 requests per 15 min per IP
```

### Upload Constraints
```
File types:            JPEG, PNG, WebP only
Max file size:         5 MB per image
Max gallery images:    20 per project
Max team members:      10 (with photos)
Favicon accepts:       PNG only (used as-is; no .ico conversion — modern browsers support PNG favicons)
Cloudinary transforms: quality auto, format auto, max width 1920px
Orphan cleanup:        Old assets destroyed via publicId on replace/delete
```

### Health Endpoint
`GET /api/health` → `{ status: "ok", db: "connected", uptime, timestamp }`

### Migration/Seed Strategy
Versioned `SeedVersion` collection. Seed runs on every startup, only applies new versions. Safe to re-run.

### Data Retention
- Leads/Messages: Retained indefinitely, admin can export CSV, delete individual, bulk purge
- Audit Logs: TTL 90 days (MongoDB auto-delete)

### Backup
- MongoDB: `mongodump` (documented in README)
- Cloudinary: Admin owns account, media persists there
- Leads/Messages: CSV export from admin

### Render Deployment
```yaml
services:
  - type: web
    name: kushproperties
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: node server/index.js
    healthCheckPath: /api/health
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: SESSION_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: ADMIN_SEED
        sync: false
```

---

## Status

> [!TIP]
> **✅ Design, Features, and Architecture ALL FINALIZED.** Ready to start coding on your signal.
