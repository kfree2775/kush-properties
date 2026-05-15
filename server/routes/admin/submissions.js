/**
 * Admin Submissions Routes — Leads, Contacts, CSV export
 */
import { Router } from 'express';
import Lead from '../../models/Lead.js';
import ContactSubmission from '../../models/ContactSubmission.js';
import { requireAdmin } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';
import logger from '../../logger.js';

const router = Router();
router.use(requireAdmin);

// ===== Leads =====
router.get('/leads', async (req, res) => {
  try {
    const { page = 1, pageSize = 25, source } = req.query;
    const p = Math.max(1, parseInt(page));
    const s = Math.min(100, Math.max(1, parseInt(pageSize) || 25));
    const filter = {};
    if (source) filter.source = source;
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip((p - 1) * s).limit(s).lean(),
      Lead.countDocuments(filter),
    ]);
    res.json({ leads, total, page: p, pageSize: s, totalPages: Math.ceil(total / s) });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'delete', 'Lead', lead._id);
    res.json({ message: 'Deleted' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to delete' }); }
});

// CSV export
router.get('/leads/export', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    const header = 'Full Name,Email,Phone,Source,Property Interest,Agreed T&C,Date\n';
    const rows = leads.map(l =>
      `"${esc(l.fullName)}","${esc(l.email)}","${esc(l.phone)}","${esc(l.source)}","${esc(l.propertyInterest || '')}","${l.agreedTc ? 'Yes' : 'No'}","${l.createdAt?.toISOString() || ''}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads_${Date.now()}.csv"`);
    res.send(header + rows);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to export' }); }
});

// ===== Contact Submissions =====
router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, pageSize = 25 } = req.query;
    const p = Math.max(1, parseInt(page));
    const s = Math.min(100, Math.max(1, parseInt(pageSize) || 25));
    const [contacts, total] = await Promise.all([
      ContactSubmission.find().sort({ createdAt: -1 }).skip((p - 1) * s).limit(s).lean(),
      ContactSubmission.countDocuments(),
    ]);
    res.json({ contacts, total, page: p, pageSize: s, totalPages: Math.ceil(total / s) });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to load' }); }
});

router.put('/contacts/:id/read', async (req, res) => {
  try {
    const contact = await ContactSubmission.findByIdAndUpdate(
      req.params.id, { isRead: true }, { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Not found' });
    res.json(contact);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Not found' });
    await auditLog(req.session.adminUser.id, 'delete', 'ContactSubmission', contact._id);
    res.json({ message: 'Deleted' });
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to delete' }); }
});

router.get('/contacts/export', async (req, res) => {
  try {
    const contacts = await ContactSubmission.find().sort({ createdAt: -1 }).lean();
    const header = 'Name,Email,Phone,Message,Read,Date\n';
    const rows = contacts.map(c =>
      `"${esc(c.name)}","${esc(c.email)}","${esc(c.phone)}","${esc(c.message)}","${c.isRead ? 'Yes' : 'No'}","${c.createdAt?.toISOString() || ''}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="contacts_${Date.now()}.csv"`);
    res.send(header + rows);
  } catch (e) { logger.error(e.message); res.status(500).json({ error: 'Failed to export' }); }
});

function esc(str) {
  return String(str || '').replace(/"/g, '""');
}

export default router;
