const {
  getReferral,
  addReferral,
  getAllReferrals,
} = require("../controllers/referralController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", protect, adminOnly, addReferral);

router.get("/:referralCode", protect, getReferral);

router.get("/", protect, adminOnly, getAllReferrals);

module.exports = router;
