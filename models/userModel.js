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
    college: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Not Specified"],
      default: "Not Specified",
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
    managingCheckouts: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
