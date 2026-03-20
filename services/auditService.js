const AuditLog = require("../models/auditLog.model");

const logAudit = async ({
  req,
  action,
  entity,
  entityId,
  before = null,
  after = null,
  metadata = {},
  status = "SUCCESS",
}) => {
  const log = {
    action,
    entity,
    entityId,
    performedBy: {
      userId: req.user?.id,
      email: req.user?.email,
    },
    changes: { before, after },
    metadata,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    status,
  };

  // 1. Save to DB
  await AuditLog.create(log);
};

module.exports = { logAudit };
