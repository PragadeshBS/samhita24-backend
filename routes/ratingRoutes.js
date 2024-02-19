const { addRating, getRating } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/:eventId", protect, addRating);

router.get("/:eventId", protect, getRating);

module.exports = router;
