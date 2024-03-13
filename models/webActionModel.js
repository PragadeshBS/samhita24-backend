const mongoose = require("mongoose");

const webActionSchema = mongoose.Schema(
  {
    ua: String,
    status: String,
    country: String,
    countryCode: String,
    region: String,
    regionName: String,
    city: String,
    zip: String,
    lat: String,
    lon: String,
    timezone: String,
    isp: String,
    org: String,
    as: String,
    query: String,
    path: String,
    user: String,
    message: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WebAction", webActionSchema);
