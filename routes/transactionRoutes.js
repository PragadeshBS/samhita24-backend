const {
  addTransaction,
  getTransactions,
  getAllTransactions,
  verifyTransactions,
} = require("../controllers/TransactionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", protect, addTransaction);

router.get("/", protect, getTransactions);

router.get("/all", protect, adminOnly, getAllTransactions);

router.post("/verify", protect, adminOnly, verifyTransactions);

module.exports = router;
