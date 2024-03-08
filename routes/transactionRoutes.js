const {
  addTransaction,
  getTransactions,
  getAllTransactions,
  verifyTransactions,
  addReferralToTransaction,
  getUserCollegeFromTransaction,
} = require("../controllers/TransactionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", protect, addTransaction);

router.get("/", protect, getTransactions);

router.get("/all", protect, adminOnly, getAllTransactions);

router.post("/verify", protect, adminOnly, verifyTransactions);

router.post("/add-referral", protect, adminOnly, addReferralToTransaction);

router.post(
  "/get-user-college",
  protect,
  adminOnly,
  getUserCollegeFromTransaction
);

module.exports = router;
