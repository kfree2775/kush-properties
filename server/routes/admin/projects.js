/**
 * Admin Projects Routes — Full CRUD with images, draft/publish
 */
import { Router } from 'express';
import Project from '../../models/Project.js';
import Category from '../../models/Category.js';
import { requireAdmin } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';
import { upload, uploadToCloudinary, destroyAsset } from '../../cloudinary.js';
import logger from '../../logger.js';

const router = Router();
router.use(requireAdmin);

// List all (including unpublished)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    res.json(projects);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

// Get single
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('category', 'name slug').lean();
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

// Create
router.post('/', upload.single('coverImage'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'kushproperties/projects' });
      data.coverImage = { url: result.url, publicId: result.publicId };
    }
    // Auto-generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const project = await Project.create(data);
    await auditLog(req.session.adminUser.id, 'create', 'Project', project._id);
    res.status(201).json(project);
  } catch (e) {
    logger.error(e.message);
    if (e.code === 11000) return res.status(400).json({ error: 'A project with this slug already exists' });
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update
router.put('/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    const data = JSON.parse(req.body.data || '{}');
    if (req.file) {
      if (project.coverImage?.publicId) await destroyAsset(project.coverImage.publicId);
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'kushproperties/projects' });
      data.coverImage = { url: result.url, publicId: result.publicId };
    }
    Object.assign(project, data);
    await project.save();
    await auditLog(req.session.adminUser.id, 'update', 'Project', project._id);
    res.json(project);
  } catch (e) {
    logger.error(e.message);
    if (e.code === 11000) return res.status(400).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Add gallery image
router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'kushproperties/projects/gallery' });
    const caption = req.body.caption || '';
    const sortOrder = project.images?.length || 0;
    project.images = project.images || [];
    project.images.push({ url: result.url, publicId: result.publicId, caption, sortOrder });
    await project.save();
    await auditLog(req.session.adminUser.id, 'update', 'Project', project._id);
    res.json(project.images);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to upload' }); }
});

// Remove gallery image
router.delete('/:id/images/:imageId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    const img = project.images?.id(req.params.imageId);
    if (!img) return res.status(404).json({ error: 'Image not found' });
    if (img.publicId) await destroyAsset(img.publicId);
    project.images.pull(req.params.imageId);
    await project.save();
    res.json({ message: 'Image removed' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to remove' }); }
});

// Save draft overrides
router.put('/:id/draft', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    project.draftOverrides = req.body;
    await project.save();
    await auditLog(req.session.adminUser.id, 'draft', 'Project', project._id);
    res.json({ message: 'Draft saved', draftOverrides: project.draftOverrides });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to save draft' }); }
});

// Publish (apply draft + set isPublished)
router.post('/:id/publish', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.draftOverrides) {
      Object.assign(project, project.draftOverrides);
      project.draftOverrides = undefined;
    }
    project.isPublished = true;
    await project.save();
    await auditLog(req.session.adminUser.id, 'publish', 'Project', project._id);
    res.json(project);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to publish' }); }
});

// Unpublish
router.post('/:id/unpublish', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { isPublished: false }, { new: true });
    if (!project) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'unpublish', 'Project', project._id);
    res.json(project);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed' }); }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    // Cleanup images
    if (project.coverImage?.publicId) await destroyAsset(project.coverImage.publicId);
    for (const img of (project.images || [])) {
      if (img.publicId) await destroyAsset(img.publicId);
    }
    await Project.deleteOne({ _id: project._id });
    await auditLog(req.session.adminUser.id, 'delete', 'Project', project._id);
    res.json({ message: 'Deleted' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to delete' }); }
});

export default router;
