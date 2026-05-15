/**
 * KushProperties — Admin API Router
 * Mounts auth, preview, and all CRUD sub-routers.
 */
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit';
import { requireAdmin } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import AdminUser from '../models/AdminUser.js';
import logger from '../logger.js';

// Preview model imports
import SiteConfig from '../models/SiteConfig.js';
import NavbarConfig from '../models/NavbarConfig.js';
import FooterConfig from '../models/FooterConfig.js';
import PopupConfig from '../models/PopupConfig.js';
import CookieConfig from '../models/CookieConfig.js';
import Slide from '../models/Slide.js';
import Achievement from '../models/Achievement.js';
import Category from '../models/Category.js';
import Project from '../models/Project.js';
import AboutContent from '../models/AboutContent.js';
import LegalPage from '../models/LegalPage.js';

// Sub-routers
import configRoutes from './admin/config.js';
import contentRoutes from './admin/content.js';
import projectRoutes from './admin/projects.js';
import submissionRoutes from './admin/submissions.js';
import userRoutes from './admin/users.js';

const router = Router();

// ---------- Login Rate Limiter ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- Auth (no requireAdmin) ----------
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.adminUser = { id: admin._id, name: admin.name, email: admin.email, role: admin.role };
    admin.lastLogin = new Date();
    await admin.save();
    await auditLog(admin._id, 'login', 'AdminUser', admin._id);
    logger.info(`Admin login: ${admin.email}`);
    res.json({ message: 'Login successful', user: { name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) { logger.error(`Login error: ${err.message}`); res.status(500).json({ error: 'Login failed' }); }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) { logger.error(`Logout error: ${err.message}`); return res.status(500).json({ error: 'Logout failed' }); }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/session', requireAdmin, (req, res) => {
  res.json({ user: req.session.adminUser });
});

// ---------- Preview Endpoints ----------
router.get('/preview/homepage', requireAdmin, async (req, res) => {
  try {
    const [siteConfig, navbar, footer, slides, achievements, categories, popup, cookie] = await Promise.all([
      SiteConfig.findOne().lean(), NavbarConfig.findOne().lean(), FooterConfig.findOne().lean(),
      Slide.find().sort({ sortOrder: 1 }).lean(), Achievement.find().sort({ sortOrder: 1 }).lean(),
      Category.find().sort({ sortOrder: 1 }).lean(), PopupConfig.findOne().lean(), CookieConfig.findOne().lean(),
    ]);
    const projects = await Project.find().populate('category', 'name slug').sort({ featuredRank: 1, createdAt: -1 }).limit(6).lean();
    const mergedProjects = projects.map(p => p.draftOverrides ? { ...p, ...p.draftOverrides } : p);
    res.json({ siteConfig: siteConfig || {}, navbar: navbar || {}, footer: footer || {}, slides: slides || [],
      achievements: achievements || [], featuredProjects: mergedProjects, categories: categories || [],
      popup: popup || {}, cookie: cookie || {} });
  } catch (err) { logger.error(`Preview homepage error: ${err.message}`); res.status(500).json({ error: 'Failed' }); }
});

router.get('/preview/about', requireAdmin, async (req, res) => {
  try {
    const about = await AboutContent.findOne().lean();
    if (!about) return res.json({});
    res.json(about.draftOverrides ? { ...about, ...about.draftOverrides } : about);
  } catch (err) { logger.error(err.message); res.status(500).json({ error: 'Failed' }); }
});

router.get('/preview/legal/:slug', requireAdmin, async (req, res) => {
  try {
    const page = await LegalPage.findOne({ slug: req.params.slug }).lean();
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json(page.draftOverrides ? { ...page, ...page.draftOverrides } : page);
  } catch (err) { logger.error(err.message); res.status(500).json({ error: 'Failed' }); }
});

router.get('/preview/project/:slug', requireAdmin, async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).populate('category', 'name slug').lean();
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project.draftOverrides ? { ...project, ...project.draftOverrides } : project);
  } catch (err) { logger.error(err.message); res.status(500).json({ error: 'Failed' }); }
});

// ---------- Mount CRUD Sub-Routers ----------
router.use('/', configRoutes);       // /api/admin/site-config, /navbar, /footer, /popup, /cookie
router.use('/', contentRoutes);      // /api/admin/slides, /achievements, /categories, /about, /legal
router.use('/projects', projectRoutes);  // /api/admin/projects/*
router.use('/', submissionRoutes);   // /api/admin/leads, /contacts
router.use('/', userRoutes);         // /api/admin/users, /audit-logs

export default router;
