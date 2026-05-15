/**
 * Admin Config Routes — SiteConfig, Navbar, Footer, Popup, Cookie
 */
import { Router } from 'express';
import SiteConfig from '../../models/SiteConfig.js';
import NavbarConfig from '../../models/NavbarConfig.js';
import FooterConfig from '../../models/FooterConfig.js';
import PopupConfig from '../../models/PopupConfig.js';
import CookieConfig from '../../models/CookieConfig.js';
import { requireAdmin } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';
import logger from '../../logger.js';

const router = Router();
router.use(requireAdmin);

// Helper: upsert singleton
async function upsertSingleton(Model, body, adminId, label) {
  let doc = await Model.findOne();
  if (doc) {
    Object.assign(doc, body);
    await doc.save();
    await auditLog(adminId, 'update', label, doc._id);
  } else {
    doc = await Model.create(body);
    await auditLog(adminId, 'create', label, doc._id);
  }
  return doc;
}

// ===== Site Config =====
router.get('/site-config', async (req, res) => {
  try {
    const config = await SiteConfig.findOne().lean();
    res.json(config || {});
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/site-config', async (req, res) => {
  try {
    const doc = await upsertSingleton(SiteConfig, req.body, req.session.adminUser.id, 'SiteConfig');
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

// ===== Navbar Config =====
router.get('/navbar', async (req, res) => {
  try { res.json(await NavbarConfig.findOne().lean() || {}); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/navbar', async (req, res) => {
  try {
    const doc = await upsertSingleton(NavbarConfig, req.body, req.session.adminUser.id, 'NavbarConfig');
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

// ===== Footer Config =====
router.get('/footer', async (req, res) => {
  try { res.json(await FooterConfig.findOne().lean() || {}); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/footer', async (req, res) => {
  try {
    const doc = await upsertSingleton(FooterConfig, req.body, req.session.adminUser.id, 'FooterConfig');
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

// ===== Popup Config =====
router.get('/popup', async (req, res) => {
  try { res.json(await PopupConfig.findOne().lean() || {}); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/popup', async (req, res) => {
  try {
    const doc = await upsertSingleton(PopupConfig, req.body, req.session.adminUser.id, 'PopupConfig');
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

// ===== Cookie Config =====
router.get('/cookie', async (req, res) => {
  try { res.json(await CookieConfig.findOne().lean() || {}); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/cookie', async (req, res) => {
  try {
    const doc = await upsertSingleton(CookieConfig, req.body, req.session.adminUser.id, 'CookieConfig');
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

export default router;
