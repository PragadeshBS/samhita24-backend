const {
  addTransaction,
  getTransactions,
} = require("../controllers/TransactionController");
const { protect } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", protect, addTransaction);

router.get("/", protect, getTransactions);

module.exports = router;
