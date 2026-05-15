import AuditLog from '../models/AuditLog.js';
import logger from '../logger.js';

/**
 * Log an admin action to the audit trail.
 * @param {string} adminUserId - ObjectId of the admin
 * @param {string} action - e.g. 'create', 'update', 'delete', 'publish', 'login'
 * @param {string} model - e.g. 'Project', 'SiteConfig'
 * @param {string} targetId - ID of the affected document
 * @param {object} changes - diff or summary of what changed
 */
export async function auditLog(adminUserId, action, model, targetId = '', changes = {}) {
  try {
    await AuditLog.create({
      adminUser: adminUserId,
      action,
      model,
      targetId: String(targetId),
      changes,
    });
  } catch (err) {
    // Audit logging should never crash the request
    logger.error(`Audit log write failed: ${err.message}`);
  }
}
