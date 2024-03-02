const mongoose = require("mongoose");

const referralSchema = mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    discountPercent: {
      type: mongoose.Types.Decimal128,
    },
    discountAmount: {
      type: mongoose.Types.Decimal128,
    },
    applicableCollege: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Referral", referralSchema);
