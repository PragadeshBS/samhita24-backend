const mongoose = require("mongoose");
const Counter = require("./counterModel");

const verifiedTransactions = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    transactions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Transaction",
    },
    samhitaId: {
      type: Number,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

verifiedTransactions.pre("save", async function (next) {
  if (!this.samhitaId) {
    const counter = await Counter.findOne({ counterName: "samhitaId" });
    this.samhitaId = counter.count;
    counter.count = counter.count + 1;
    await counter.save();
  }
  next();
});

module.exports = mongoose.model("VerifiedTransactions", verifiedTransactions);
