const router = require("express").Router();

const {
  logRequest,
  getPageViews,
  getAllUsers,
} = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", logRequest);

router.get("/page-views", protect, adminOnly, getPageViews);

router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
