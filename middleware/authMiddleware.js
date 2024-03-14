const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const requestIp = require("request-ip");
const saveWebAction = require("../shared/saveWebActions");

const protect = async (req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  const ua = req.get("User-Agent");
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get token from header
      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

      // get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user.active) {
        await saveWebAction(
          clientIp,
          req.originalUrl,
          req.user,
          ua,
          `Unauthorized access attempt with inactive user`
        );
        return res.status(401).json({ error: "Not authorized" });
      }

      await saveWebAction(
        clientIp,
        req.originalUrl,
        req.user,
        ua,
        `Authorized access attempt`
      );

      next();
    } catch (error) {
      await saveWebAction(
        clientIp,
        req.originalUrl,
        req.user,
        ua,
        `Unauthorized access attempt with invalid token`
      );
      res.status(401).json({ error: "Not authorized" });
    }
  }
  if (!token) {
    await saveWebAction(
      clientIp,
      req.originalUrl,
      req.user,
      ua,
      `Unauthorized access attempt without a token`
    );
    res.status(401).json({ error: "Not authorized, no token" });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Not authorized. Insufficient permissions" });
  }
};

const organizerOnly = async (req, res, next) => {
  if (
    req.user &&
    (req.user.organizedEvents.length > 0 || req.user.isOrganizer)
  ) {
    next();
  } else {
    res.status(401).json({ error: "Not authorized. Insufficient permissions" });
  }
};

module.exports = { protect, adminOnly, organizerOnly };
