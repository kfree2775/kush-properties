/**
 * KushProperties — Public API Routes
 */

import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';
import mongoose from 'mongoose';

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
import Lead from '../models/Lead.js';
import ContactSubmission from '../models/ContactSubmission.js';
import logger from '../logger.js';

const router = Router();

// ---------- Rate Limiters ----------

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- Health Check ----------

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'ok',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---------- Bootstrap (aggregated homepage payload) ----------

router.get('/bootstrap', async (req, res) => {
  try {
    const [siteConfig, navbar, footer, slides, achievements, categories, popup, cookie] = await Promise.all([
      SiteConfig.findOne().lean(),
      NavbarConfig.findOne().lean(),
      FooterConfig.findOne().lean(),
      Slide.find().sort({ sortOrder: 1 }).lean(),
      Achievement.find().sort({ sortOrder: 1 }).lean(),
      Category.find().sort({ sortOrder: 1 }).lean(),
      PopupConfig.findOne().lean(),
      CookieConfig.findOne().lean(),
    ]);

    // Featured projects: published, ordered by featuredRank (non-null first, lower = higher priority), then by createdAt desc
    const featuredProjects = await Project.find({ isPublished: true })
      .populate('category', 'name slug')
      .sort({ featuredRank: 1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({
      siteConfig: siteConfig || {},
      uiStrings: siteConfig?.uiStrings || {},
      navbar: navbar || {},
      footer: footer || {},
      slides: slides || [],
      achievements: achievements || [],
      featuredProjects: featuredProjects || [],
      categories: categories || [],
      popup: popup || {},
      cookie: cookie || {},
    });
  } catch (err) {
    logger.error(`Bootstrap API error: ${err.message}`);
    res.status(500).json({ error: 'Failed to load site data' });
  }
});

// ---------- Projects Listing ----------

router.get('/projects', async (req, res) => {
  try {
    const { category, q, sort = 'newest', page = 1, pageSize = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const size = Math.min(50, Math.max(1, parseInt(pageSize) || 12));

    // Build filter
    const filter = { isPublished: true };

    if (category && category !== 'all') {
      const cat = await Category.findOne({ slug: category }).lean();
      if (cat) filter.category = cat._id;
    }

    if (q) {
      const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { location: searchRegex },
      ];
    }

    // Build sort
    let sortObj = {};
    switch (sort) {
      case 'price_asc':
        sortObj = { priceNumeric: 1 };
        break;
      case 'price_desc':
        sortObj = { priceNumeric: -1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip((pageNum - 1) * size)
        .limit(size)
        .lean(),
      Project.countDocuments(filter),
    ]);

    res.json({
      projects,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (err) {
    logger.error(`Projects listing error: ${err.message}`);
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

// ---------- Single Project by Slug ----------

router.get('/projects/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug, isPublished: true })
      .populate('category', 'name slug')
      .lean();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Similar projects: same category, exclude current, published, limit 3
    let similarProjects = [];
    if (project.category) {
      similarProjects = await Project.find({
        isPublished: true,
        _id: { $ne: project._id },
        category: project.category._id || project.category,
      })
        .populate('category', 'name slug')
        .sort({ featuredRank: 1, createdAt: -1 })
        .limit(3)
        .lean();
    }

    // Backfill if < 3
    if (similarProjects.length < 3) {
      const excludeIds = [project._id, ...similarProjects.map(p => p._id)];
      const backfill = await Project.find({
        isPublished: true,
        _id: { $nin: excludeIds },
      })
        .populate('category', 'name slug')
        .sort({ featuredRank: 1, createdAt: -1 })
        .limit(3 - similarProjects.length)
        .lean();

      similarProjects = [...similarProjects, ...backfill];
    }

    res.json({ ...project, similarProjects });
  } catch (err) {
    logger.error(`Project detail error: ${err.message}`);
    res.status(500).json({ error: 'Failed to load project' });
  }
});

// ---------- About Page ----------

router.get('/about', async (req, res) => {
  try {
    const about = await AboutContent.findOne().lean();
    if (!about || !about.isPublished) {
      return res.json({
        heroTagline: 'About KushProperties',
        storyTitle: 'Our Story',
        storyContent: '<p>Content coming soon.</p>',
        mission: '',
        vision: '',
        teamMembers: [],
      });
    }
    res.json(about);
  } catch (err) {
    logger.error(`About page error: ${err.message}`);
    res.status(500).json({ error: 'Failed to load about content' });
  }
});

// ---------- Legal Pages ----------

router.get('/legal/:slug', async (req, res) => {
  try {
    const page = await LegalPage.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).lean();

    if (!page) {
      return res.status(404).json({
        title: 'Page Not Found',
        content: '<p>This page is being updated.</p>',
      });
    }

    res.json(page);
  } catch (err) {
    logger.error(`Legal page error: ${err.message}`);
    res.status(500).json({ error: 'Failed to load page' });
  }
});

// ---------- Lead Submission ----------

router.post('/leads', leadLimiter, async (req, res) => {
  try {
    const { fullName, email, phone, agreedTc, propertyInterest, source } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!agreedTc) {
      return res.status(400).json({ error: 'You must agree to the Terms & Conditions' });
    }

    const lead = await Lead.create({
      fullName: sanitizeHtml(fullName.trim(), { allowedTags: [] }),
      email: email ? sanitizeHtml(email.trim(), { allowedTags: [] }) : '',
      phone: phone ? sanitizeHtml(phone.trim(), { allowedTags: [] }) : '',
      agreedTc: true,
      propertyInterest: propertyInterest || null,
      source: source || 'popup',
    });

    logger.info(`New lead: ${lead.fullName} (${lead.email || lead.phone})`);
    res.status(201).json({ message: 'Thank you! We will be in touch soon.' });
  } catch (err) {
    logger.error(`Lead submission error: ${err.message}`);
    res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
});

// ---------- Contact Form ----------

router.post('/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const submission = await ContactSubmission.create({
      name: sanitizeHtml(name.trim(), { allowedTags: [] }),
      email: sanitizeHtml(email.trim(), { allowedTags: [] }),
      phone: phone ? sanitizeHtml(phone.trim(), { allowedTags: [] }) : '',
      message: sanitizeHtml(message.trim(), { allowedTags: [] }),
    });

    logger.info(`New contact message from: ${submission.name} (${submission.email})`);
    res.status(201).json({ message: 'Message sent! We will get back to you soon.' });
  } catch (err) {
    logger.error(`Contact form error: ${err.message}`);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

export default router;
