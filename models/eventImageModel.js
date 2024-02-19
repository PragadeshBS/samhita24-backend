const mongoose = require("mongoose");

const eventImageSchame = mongoose.Schema(
  {
    image: { data: Buffer, contentType: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventImage", eventImageSchame);
