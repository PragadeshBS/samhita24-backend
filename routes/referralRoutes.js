const {
  getReferral,
  addReferral,
} = require("../controllers/referralController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", protect, adminOnly, addReferral);

router.get("/:referralCode", protect, getReferral);

module.exports = router;
