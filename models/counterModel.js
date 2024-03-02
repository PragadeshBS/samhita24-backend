const mongoose = require("mongoose");

const counterSchema = mongoose.Schema(
  {
    counterName: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Counter", counterSchema);
