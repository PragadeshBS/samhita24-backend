const { addBlockedIp } = require("../controllers/blockedIpController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", protect, adminOnly, addBlockedIp);

module.exports = router;
