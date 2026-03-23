const { logAudit } = require("../services/auditService");

const withAudit = (handler, options) => {
  return async (req, res, next) => {
    let before = null;

    try {
      if (options.getBefore) {
        before = await options.getBefore(req);
      }

      const result = await handler(req, res, next);

      // Success log
      await logAudit({
        req,
        action: options.action,
        entity: options.entity,
        entityId: result?.entityId,
        before: before || result?.before,
        after: result?.after || null,
        changes: result.changes || null,
        metadata: result?.metadata,
        status: "SUCCESS",
      });

      // Middleware sends HTTP response
      return res.status(200).json({
        success: true,
        message: result?.response?.message || "Operation successful",
        data: result?.response?.data || null,
      });
    } catch (error) {
      // Failure log
      await logAudit({
        req,
        action: options.action,
        entity: options.entity,
        before,
        metadata: { error: error.message },
        status: "FAILED",
      });

      // Middleware sends error response
      const statusMap = {
        "Missing credentials": 401,
        "Not found": 404,
        Denied: 400,
        Unauthorized: 401,
      };

      const statusCode = statusMap[error.message] || 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = { withAudit };
