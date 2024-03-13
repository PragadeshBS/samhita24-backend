const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const axios = require("axios");
const requestIp = require("request-ip");
const WebAction = require("../models/webActionModel");

const saveAction = async (clientIp, path, user, ua, message) => {
  if (clientIp) {
    axios.get(`http://ip-api.com/json/${clientIp}`).then(async (response) => {
      await WebAction.create({
        ua,
        path,
        user: user?._id,
        ...response.data,
        message,
      });
    });
  }
  console.log(
    clientIp,
    ua,
    user?._id,
    user?.userName,
    user?.email,
    "from protect"
  );
};

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
        await saveAction(
          clientIp,
          req.originalUrl,
          req.user,
          ua,
          `Unauthorized access attempt with inactive user`
        );
        return res.status(401).json({ error: "Not authorized" });
      }

      await saveAction(
        clientIp,
        req.originalUrl,
        req.user,
        ua,
        `Authorized access attempt`
      );

      next();
    } catch (error) {
      await saveAction(
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
    await saveAction(
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
  if (req.user && req.user.organizedEvents.length > 0) {
    next();
  } else {
    res.status(401).json({ error: "Not authorized. Insufficient permissions" });
  }
};

module.exports = { protect, adminOnly, organizerOnly };
