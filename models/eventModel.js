const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    eventStartDate: {
      type: Date,
      required: true,
    },
    eventEndDate: {
      type: Date,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["Technical", "Non-technical"],
      default: "Technical",
    },
    firstPrizeMoney: {
      type: Number,
    },
    secondPrizeMoney: {
      type: Number,
    },
    thirdPrizeMoney: {
      type: Number,
    },
    venue: {
      type: String,
      required: true,
    },
    dept: {
      type: String,
    },
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    otherInfo: {
      type: String,
    },
    image: {
      type: mongoose.Types.ObjectId,
      ref: "EventImage",
    },
    externalImageLink: {
      type: String,
    },
    link: {
      type: String,
    },
    organisers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    public: {
      type: Boolean,
      default: false,
    },
    whatsapp: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
