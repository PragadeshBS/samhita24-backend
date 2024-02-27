const {
  getReferral,
  addReferral,
} = require("../controllers/referralController");
const { protect } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", addReferral);

router.get("/:referralCode", protect, getReferral);

module.exports = router;
