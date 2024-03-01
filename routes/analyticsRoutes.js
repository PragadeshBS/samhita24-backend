const router = require("express").Router();

const {
  logRequest,
  getPageViews,
  getAllNonMitUsers,
} = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", logRequest);

router.get("/page-views", protect, adminOnly, getPageViews);

router.get("/non-mit-users", protect, adminOnly, getAllNonMitUsers);

module.exports = router;
