const requestIp = require("request-ip");
const axios = require("axios");
const WebLog = require("../models/webLogModel");

const logRequest = async (req, res) => {
  const clientIp = requestIp.getClientIp(req);
  const ua = req.get("User-Agent");
  const { path, user } = req.body;
  if (clientIp) {
    axios.get(`http://ip-api.com/json/${clientIp}`).then(async (response) => {
      await WebLog.create({ ua, path, user, ...response.data });
    });
  }
  res.end();
};

const getPageViews = async (req, res) => {
  const pageViews = await WebLog.countDocuments();
  res.json({ pageViews });
};

module.exports = { logRequest, getPageViews };
