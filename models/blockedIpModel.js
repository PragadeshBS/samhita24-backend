const mongoose = require("mongoose");

const blockedIpSchema = mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
    },
    blocked: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockedIp", blockedIpSchema);
