const requestIp = require("request-ip");
const BlockedIp = require("../models/blockedIpModel");
const WebAction = require("../models/webActionModel");
const saveWebAction = require("./saveWebActions");

const checkRateLimit = async (clientIp) => {
  const rateLimitMinutes = process.env.RATE_LIMIT_MINUTES;
  const rateLimitCount = process.env.RATE_LIMIT_COUNT;
  const lastFewMinutes = new Date(Date.now() - rateLimitMinutes * 60 * 1000);
  const lastFewMinuteActions = await WebAction.find({
    query: clientIp,
    createdAt: { $gt: lastFewMinutes },
  });
  console.log(
    "lastFewMinuteActions for",
    clientIp,
    ":",
    lastFewMinuteActions.length
  );
  if (lastFewMinuteActions.length > rateLimitCount) {
    // add ip to blocked list
    await BlockedIp.create({ ip: clientIp, blocked: true });
    return true;
  }
  return false;
};

const isValidUa = (ua) => {
  if (!ua) return false;
  const blockedUas = process.env.BLOCKED_UAS.split(",");
  if (blockedUas.some((blockedUa) => ua.indexOf(blockedUa) > -1)) {
    return false;
  }
  return true;
};

const verifyIp = async (req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  console.log("verifying req from", clientIp);
  await saveWebAction(
    clientIp,
    req.originalUrl,
    null,
    req.get("User-Agent"),
    "Access attempt"
  );
  if (!isValidUa(req.get("User-Agent"))) {
    await saveWebAction(
      clientIp,
      req.originalUrl,
      null,
      req.get("User-Agent"),
      "Blocked UA"
    );
    return res.status(403).json({ message: "Unauthorized" });
  }
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
  const rateLimited = await checkRateLimit(clientIp);
  if (rateLimited) {
    await WebAction.create({
      ua: req.get("User-Agent"),
      path: req.originalUrl,
      message: `Rate limited IP attempted access: ${clientIp}`,
    });
    return res.status(429).json({ message: "Too many requests" });
  }
  next();
};

module.exports = verifyIp;
