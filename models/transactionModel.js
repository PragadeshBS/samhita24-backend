const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    upiTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionAmount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    transactionStatus: {
      type: String,
      required: true,
      enum: ["Success", "Failed", "Pending Verification", "Refunded"],
      default: "Pending Verification",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
    purchasedTickets: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Ticket",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
