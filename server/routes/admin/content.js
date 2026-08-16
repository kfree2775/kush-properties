/**
 * Admin Content Routes — Slides, Achievements, Categories, About, Legal
 */
import { Router } from 'express';
import Slide from '../../models/Slide.js';
import Achievement from '../../models/Achievement.js';
import Category from '../../models/Category.js';
import AboutContent from '../../models/AboutContent.js';
import LegalPage from '../../models/LegalPage.js';
import { requireAdmin } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';
import { upload, uploadToCloudinary, destroyAsset } from '../../cloudinary.js';
import logger from '../../logger.js';

const router = Router();
router.use(requireAdmin);

// ===== Slides =====
router.get('/slides', async (req, res) => {
  try { res.json(await Slide.find().sort({ sortOrder: 1 }).lean()); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.post('/slides', upload.single('image'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'kushproperties/slides' });
      data.imageUrl = result.url;
      data.publicId = result.publicId;
    }
    const slide = await Slide.create(data);
    await auditLog(req.session.adminUser.id, 'create', 'Slide', slide._id);
    res.status(201).json(slide);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to create' }); }
});

router.put('/slides/:id', upload.single('image'), async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Not found' });
    const data = JSON.parse(req.body.data || '{}');
    if (req.file) {
      if (slide.publicId) await destroyAsset(slide.publicId);
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'kushproperties/slides' });
      data.imageUrl = result.url;
      data.publicId = result.publicId;
    }
    Object.assign(slide, data);
    await slide.save();
    await auditLog(req.session.adminUser.id, 'update', 'Slide', slide._id);
    res.json(slide);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/slides/:id', async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Not found' });
    if (slide.publicId) await destroyAsset(slide.publicId);
    await auditLog(req.session.adminUser.id, 'delete', 'Slide', slide._id);
    res.json({ message: 'Deleted' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to delete' }); }
});

// ===== Achievements =====
router.get('/achievements', async (req, res) => {
  try { res.json(await Achievement.find().sort({ sortOrder: 1 }).lean()); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/achievements/:id', async (req, res) => {
  try {
    const ach = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ach) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'update', 'Achievement', ach._id);
    res.json(ach);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

// Bulk update all 4
router.put('/achievements', async (req, res) => {
  try {
    const items = req.body.achievements || [];
    const results = [];
    for (const item of items) {
      if (item._id) {
        const doc = await Achievement.findByIdAndUpdate(item._id, item, { new: true, runValidators: true });
        if (doc) results.push(doc);
      }
    }
    await auditLog(req.session.adminUser.id, 'update', 'Achievement', 'bulk');
    res.json(results);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

// ===== Categories =====
router.get('/categories', async (req, res) => {
  try { res.json(await Category.find().sort({ sortOrder: 1 }).lean()); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    await auditLog(req.session.adminUser.id, 'create', 'Category', cat._id);
    res.status(201).json(cat);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to create' }); }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'update', 'Category', cat._id);
    res.json(cat);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'delete', 'Category', cat._id);
    res.json({ message: 'Deleted' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to delete' }); }
});

// ===== About Content (singleton, draft/publish) =====
router.get('/about', async (req, res) => {
  try { res.json(await AboutContent.findOne().lean() || {}); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/about', upload.fields([
  { name: 'heroImage', maxCount: 1 },
  { name: 'storyImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    // Handle image uploads
    for (const field of ['heroImage', 'storyImage']) {
      if (req.files?.[field]?.[0]) {
        const result = await uploadToCloudinary(req.files[field][0].buffer, { folder: 'kushproperties/about' });
        data[field] = {
          url: result.url,
          publicId: result.publicId
        };
      }
    }
    let doc = await AboutContent.findOne();
    if (doc) { Object.assign(doc, data); await doc.save(); }
    else { doc = await AboutContent.create(data); }
    await auditLog(req.session.adminUser.id, 'update', 'AboutContent', doc._id);
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

// Save as draft
router.put('/about/draft', async (req, res) => {
  try {
    let doc = await AboutContent.findOne();
    if (!doc) doc = new AboutContent({});
    doc.draftOverrides = req.body;
    await doc.save();
    await auditLog(req.session.adminUser.id, 'draft', 'AboutContent', doc._id);
    res.json({ message: 'Draft saved', draftOverrides: doc.draftOverrides });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save draft' }); }
});

// Publish draft
router.post('/about/publish', async (req, res) => {
  try {
    const doc = await AboutContent.findOne();
    if (!doc) return res.status(404).json({ error: 'No content to publish' });
    if (doc.draftOverrides) {
      Object.assign(doc, doc.draftOverrides);
      doc.draftOverrides = undefined;
    }
    doc.isPublished = true;
    await doc.save();
    await auditLog(req.session.adminUser.id, 'publish', 'AboutContent', doc._id);
    res.json(doc);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to publish' }); }
});

// ===== Legal Pages (draft/publish) =====
router.get('/legal', async (req, res) => {
  try { res.json(await LegalPage.find().lean()); }
  catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.get('/legal/:slug', async (req, res) => {
  try {
    const page = await LegalPage.findOne({ slug: req.params.slug }).lean();
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json(page);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/legal/:slug', async (req, res) => {
  try {
    let page = await LegalPage.findOne({ slug: req.params.slug });
    if (page) { Object.assign(page, req.body); await page.save(); }
    else { page = await LegalPage.create({ ...req.body, slug: req.params.slug }); }
    await auditLog(req.session.adminUser.id, 'update', 'LegalPage', page._id);
    res.json(page);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save' }); }
});

router.put('/legal/:slug/draft', async (req, res) => {
  try {
    let page = await LegalPage.findOne({ slug: req.params.slug });
    if (!page) page = new LegalPage({ slug: req.params.slug });
    page.draftOverrides = req.body;
    await page.save();
    await auditLog(req.session.adminUser.id, 'draft', 'LegalPage', page._id);
    res.json({ message: 'Draft saved' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save draft' }); }
});

router.post('/legal/:slug/publish', async (req, res) => {
  try {
    const page = await LegalPage.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: 'Not found' });
    if (page.draftOverrides) {
      Object.assign(page, page.draftOverrides);
      page.draftOverrides = undefined;
    }
    page.isPublished = true;
    await page.save();
    await auditLog(req.session.adminUser.id, 'publish', 'LegalPage', page._id);
    res.json(page);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to publish' }); }
});

export default router;
