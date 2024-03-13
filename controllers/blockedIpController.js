const BlockedIp = require("../models/blockedIpModel");

const addBlockedIp = async (req, res) => {
  try {
    const { ip } = req.body;
    const blockedIp = new BlockedIp({ ip });
    await blockedIp.save();
    res.status(201).json({ message: "IP blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBlockedIp,
};
