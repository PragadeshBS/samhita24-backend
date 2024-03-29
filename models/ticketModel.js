const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
  {
    ticketName: {
      type: String,
      required: true,
    },
    ticketPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    ticketDescription: {
      type: String,
    },
    checkoutId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["event", "workshop", "other", "workshop-combo", "accommodation"],
      default: "event",
    },
    active: {
      type: Boolean,
      default: true,
    },
    applicableGender: {
      type: String,
      enum: ["Male", "Female"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
