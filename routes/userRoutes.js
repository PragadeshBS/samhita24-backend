const express = require("express");
const {
  getUserDetails,
  getOrganisedEvents,
  getParticipatedEvents,
  getUserIds,
  setGender,
  getUserInfoWithMobile,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserDetails);

router.get("/ids", getUserIds);

router.get("/events-organised", protect, getOrganisedEvents);

router.get("/events-participated", protect, getParticipatedEvents);

router.post("/gender", protect, setGender);

router.post("/mobile", protect, adminOnly, getUserInfoWithMobile);

module.exports = router;
