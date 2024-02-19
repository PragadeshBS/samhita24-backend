const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    regNo: {
      type: String,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    dept: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    participatedEvents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Event",
    },
    organizedEvents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Event",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
