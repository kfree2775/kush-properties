/**
 * Admin Users & Audit Logs Routes
 */
import { Router } from 'express';
import bcrypt from 'bcrypt';
import AdminUser from '../../models/AdminUser.js';
import AuditLog from '../../models/AuditLog.js';
import { requireAdmin } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';
import logger from '../../logger.js';

const router = Router();
router.use(requireAdmin);

// ===== Admin Users =====
router.get('/users', async (req, res) => {
  try {
    const users = await AdminUser.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await AdminUser.create({
      name, email: email.toLowerCase().trim(), passwordHash, role: role || 'editor',
    });
    await auditLog(req.session.adminUser.id, 'create', 'AdminUser', user._id);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to create' }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email.toLowerCase().trim();
    if (req.body.role) user.role = req.body.role;
    if (req.body.password) user.passwordHash = await bcrypt.hash(req.body.password, 12);
    await user.save();
    await auditLog(req.session.adminUser.id, 'update', 'AdminUser', user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.session.adminUser.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const user = await AdminUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'delete', 'AdminUser', user._id);
    res.json({ message: 'Deleted' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to delete' }); }
});

// Change own password
router.put('/users/me/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const user = await AdminUser.findById(req.session.adminUser.id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

// ===== Audit Logs (read-only) =====
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query;
    const p = Math.max(1, parseInt(page));
    const s = Math.min(100, Math.max(1, parseInt(pageSize) || 50));
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip((p - 1) * s).limit(s).lean(),
      AuditLog.countDocuments(),
    ]);
    res.json({ logs, total, page: p, pageSize: s, totalPages: Math.ceil(total / s) });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

export default router;
