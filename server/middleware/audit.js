import AuditLog from '../models/AuditLog.js';
import logger from '../logger.js';

/**
 * Log an admin action to the audit trail.
 * @param {string} adminUserId - ObjectId of the admin
 * @param {string} action - e.g. 'create', 'update', 'delete', 'publish', 'login'
 * @param {string} collection - e.g. 'Project', 'SiteConfig'
 * @param {string} documentId - ID of the affected document
 * @param {object} changes - diff or summary of what changed
 */
export async function auditLog(adminUserId, action, collection, documentId = '', changes = {}) {
  try {
    await AuditLog.create({
      adminUser: adminUserId,
      action,
      collection,
      documentId: String(documentId),
      changes,
    });
  } catch (err) {
    // Audit logging should never crash the request
    logger.error(`Audit log write failed: ${err.message}`);
  }
}
