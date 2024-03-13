const requestIp = require("request-ip");
const BlockedIp = require("../models/blockedIpModel");
const WebAction = require("../models/webActionModel");

const verifyIp = async (req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  console.log("verifying req from", clientIp);
  const blockedIps = await BlockedIp.find({ blocked: true });
  const blocked = blockedIps.some((blockedIp) => blockedIp.ip === clientIp);
  if (blocked) {
    await WebAction.create({
      ua: req.get("User-Agent"),
      path: req.originalUrl,
      message: `Blocked IP attempted access: ${clientIp}`,
    });
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

module.exports = verifyIp;
