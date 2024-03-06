const {
  getAccommodationTimings,
  getAllAccommodationTimings,
  setAccommodationTimings,
} = require("../controllers/accommodationTimingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", protect, getAccommodationTimings);

router.get("/all", protect, adminOnly, getAllAccommodationTimings);

router.post("/", protect, setAccommodationTimings);

module.exports = router;
