const requestIp = require("request-ip");
const axios = require("axios");
const WebLog = require("../models/webLogModel");
const User = require("../models/userModel");

const logRequest = async (req, res) => {
  const clientIp = requestIp.getClientIp(req);
  const ua = req.get("User-Agent");
  const { path, user, localTime } = req.body;
  if (clientIp) {
    axios.get(`http://ip-api.com/json/${clientIp}`).then(async (response) => {
      await WebLog.create({ ua, path, user, localTime, ...response.data });
    });
  }
  res.end();
};

const getPageViews = async (req, res) => {
  const pageViews = await WebLog.countDocuments();
  res.json({ pageViews });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { logRequest, getPageViews, getAllUsers };
