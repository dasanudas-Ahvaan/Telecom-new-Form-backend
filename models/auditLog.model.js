// models/auditLog.model.js
const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // CREATE, UPDATE, DELETE
    entity: { type: String, required: true }, // ADMIN, USER, ORDER //who did it?
    entityId: { type: mongoose.Schema.Types.ObjectId },

    performedBy: {
      userId: String,
      email: String,
    },

    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },

    metadata: mongoose.Schema.Types.Mixed,

    ip: String,
    userAgent: String,

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);