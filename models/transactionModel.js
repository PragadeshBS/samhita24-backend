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
      enum: ["Success", "Failed", "Pending Verification"],
      default: "Pending Verification",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
