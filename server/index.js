import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { rateLimit } from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import logger from './logger.js';
import validateEnv from './validate-env.js';
import connectDB from './db.js';
import pingRoute from './routes/ping.js';

// Validate environment before anything else
validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy is required for Render to correctly handle secure cookies and rate-limiting IPs
app.set('trust proxy', 1);

// ---------- Middleware ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60, // 24 hours
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// CSRF — double-submit cookie pattern
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
  },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Make CSRF token generator available to routes
app.use((req, res, next) => {
  req.csrfToken = () => generateToken(req, res);
  next();
});

// ---------- SEO Head Injection ----------

/**
 * Reads an HTML file, replaces <!--SEO_PLACEHOLDER--> with <title>, <meta>, <og:*> tags,
 * and <!--CSRF_TOKEN--> with a <meta name="csrf-token"> tag (for admin pages).
 */
function serve(fileName, seoFetcher) {
  return async (req, res) => {
    try {
      // In production, serve from dist/; in dev, serve from src/
      const baseDir = isProd
        ? path.join(__dirname, '..', 'dist')
        : path.join(__dirname, '..', 'src');

      const filePath = path.join(baseDir, fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Page not found');
      }

      let html = fs.readFileSync(filePath, 'utf-8');

      // Inject SEO tags
      if (seoFetcher) {
        try {
          const seo = await seoFetcher(req);
          const seoTags = buildSeoTags(seo);
          html = html.replace('<!--SEO_PLACEHOLDER-->', seoTags);
        } catch (err) {
          logger.error(`SEO injection failed for ${fileName}: ${err.message}`);
          // Fallback — inject minimal tags
          html = html.replace('<!--SEO_PLACEHOLDER-->', '<title>KushProperties</title>');
        }
      }

      // Inject CSRF token (for admin pages)
      if (fileName.includes('admin')) {
        try {
          const token = req.csrfToken();
          html = html.replace('<!--CSRF_TOKEN-->', `<meta name="csrf-token" content="${token}">`);
        } catch {
          html = html.replace('<!--CSRF_TOKEN-->', '');
        }
      }

      res.type('html').send(html);
    } catch (err) {
      logger.error(`Error serving ${fileName}: ${err.message}`);
      res.status(500).send('Internal Server Error');
    }
  };
}

function buildSeoTags({ title, description, ogImage, ogUrl }) {
  const tags = [];
  if (title) {
    tags.push(`<title>${escapeHtml(title)}</title>`);
    tags.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
  }
  if (description) {
    tags.push(`<meta name="description" content="${escapeHtml(description)}">`);
    tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
  }
  if (ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(ogImage)}">`);
  }
  if (ogUrl) {
    tags.push(`<meta property="og:url" content="${escapeHtml(ogUrl)}">`);
  }
  tags.push('<meta property="og:type" content="website">');
  return tags.join('\n    ');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------- SEO Fetchers ----------
// These import models and read from DB. Lazy imports to avoid circular dependency issues.

async function fetchHomeSEO() {
  const { default: SiteConfig } = await import('./models/SiteConfig.js');
  const config = await SiteConfig.findOne().lean();
  const seo = config?.pageSeo?.home || {};
  return {
    title: seo.title || `${config?.branding?.companyName || 'KushProperties'} — Luxury Real Estate`,
    description: seo.metaDescription || '',
    ogImage: seo.ogImage || '',
  };
}

async function fetchAboutSEO() {
  const { default: SiteConfig } = await import('./models/SiteConfig.js');
  const config = await SiteConfig.findOne().lean();
  const seo = config?.pageSeo?.about || {};
  return {
    title: seo.title || `About — ${config?.branding?.companyName || 'KushProperties'}`,
    description: seo.metaDescription || '',
    ogImage: seo.ogImage || '',
  };
}

async function fetchContactSEO() {
  const { default: SiteConfig } = await import('./models/SiteConfig.js');
  const config = await SiteConfig.findOne().lean();
  const seo = config?.pageSeo?.contact || {};
  return {
    title: seo.title || `Contact — ${config?.branding?.companyName || 'KushProperties'}`,
    description: seo.metaDescription || '',
    ogImage: seo.ogImage || '',
  };
}

async function fetchProjectsSEO() {
  const { default: SiteConfig } = await import('./models/SiteConfig.js');
  const config = await SiteConfig.findOne().lean();
  const seo = config?.pageSeo?.projects || {};
  return {
    title: seo.title || `Projects — ${config?.branding?.companyName || 'KushProperties'}`,
    description: seo.metaDescription || '',
    ogImage: seo.ogImage || '',
  };
}

async function fetchPropertySEO(req) {
  const { default: Project } = await import('./models/Project.js');
  const slug = req.params.slug;
  const project = await Project.findOne({ slug, isPublished: true }).lean();

  // If preview mode and admin session, also check unpublished/draft
  if (!project && req.query.preview === 'true' && req.session?.adminUser) {
    const draft = await Project.findOne({ slug }).lean();
    if (draft) {
      const merged = draft.draftOverrides ? { ...draft, ...draft.draftOverrides } : draft;
      return {
        title: merged.seo?.metaTitle || merged.name || 'Property',
        description: merged.seo?.metaDescription || '',
        ogImage: merged.seo?.ogImage?.url || merged.coverImage?.url || '',
      };
    }
  }

  return {
    title: project?.seo?.metaTitle || project?.name || 'Property — KushProperties',
    description: project?.seo?.metaDescription || '',
    ogImage: project?.seo?.ogImage?.url || project?.coverImage?.url || '',
  };
}

async function fetchLegalSEO(req) {
  const { default: LegalPage } = await import('./models/LegalPage.js');
  // slug from the route path (e.g. /terms → 'terms', /privacy → 'privacy')
  const urlPath = req.path.replace(/^\//, '');
  const page = await LegalPage.findOne({ slug: urlPath, isPublished: true }).lean();
  return {
    title: page?.metaTitle || page?.title || 'KushProperties',
    description: page?.metaDescription || '',
  };
}

// ---------- Start Server ----------
async function startServer() {
  await connectDB();

  // Run seeds on startup (inline check — seed.js is for CLI only since it closes the connection)
  try {
    const { default: SeedVersion } = await import('./models/SeedVersion.js');
    const seedApplied = await SeedVersion.findOne({ version: 1 });
    if (!seedApplied) {
      logger.info('First startup — seeds not yet applied. Run `npm run seed` to populate demo data.');
    }
  } catch (err) {
    logger.warn(`Seed check skipped: ${err.message}`);
  }

  // ---------- Routes ----------
  // UptimeRobot ping route
  app.use('/ping', pingRoute);

  // Import routes (created in Phase 2+)
  try {
    const { default: publicRoutes } = await import('./routes/public.js');
    const { default: adminRoutes } = await import('./routes/admin.js');

    // Admin routes FIRST (to avoid overlap with /api)
    app.use('/api/admin', adminRoutes);
    app.use('/api', publicRoutes);
  } catch {
    logger.warn('Route files not found yet — serving HTML only');

    // Minimal health endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', db: 'connected', uptime: process.uptime(), timestamp: new Date().toISOString() });
    });
  }

  // ---------- HTML Page Routes ----------
  app.get('/', serve('index.html', fetchHomeSEO));
  app.get('/about', serve('about.html', fetchAboutSEO));
  app.get('/contact', serve('contact.html', fetchContactSEO));
  app.get('/projects', serve('projects.html', fetchProjectsSEO));
  app.get('/property/:slug', serve('property.html', fetchPropertySEO));
  app.get('/terms', serve('terms.html', fetchLegalSEO));
  app.get('/privacy', serve('privacy.html', fetchLegalSEO));
  app.get('/admin', serve('admin.html'));
  app.get('/admin/login', serve('admin-login.html'));

  // Static files (CSS, JS, assets) — in dev, Vite handles this; in prod, serve dist/
  if (isProd) {
    app.use(express.static(path.join(__dirname, '..', 'dist')));
  }

  // 404 catch-all
  app.use('*', (req, res) => {
    // Don't catch API routes
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    const notFoundPath = path.join(
      __dirname, '..', isProd ? 'dist' : 'src', '404.html'
    );
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).sendFile(notFoundPath);
    }
    res.status(404).send('Not Found');
  });

  // Global error handler
  app.use((err, req, res, _next) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    logger.info(`KushProperties server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

export default app;
