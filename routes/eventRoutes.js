const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
const { protect } = require("../middleware/authMiddleware");

const {
  getArchives,
  createEvent,
  getEvent,
  updateEvent,
  checkConflictingEvents,
  getUpcomingEvents,
  getEventIds,
  getEvents,
} = require("../controllers/eventControllers/eventController");

const {
  uploadEventImage,
  getEventImage,
} = require("../controllers/eventControllers/imageController");

const {
  addParticipant,
  removeParticipant,
  getParticipants,
  removeAllParticipants,
} = require("../controllers/eventControllers/participantsController");

const {
  addOrganizer,
  removeOrganizer,
  getOrganizers,
} = require("../controllers/eventControllers/organizersController");

// get all events
router.get("/", getEvents);

router.get("/archives", getArchives);

// get all event ids
router.get("/ids", getEventIds);

// get upcoming events
router.get("/upcoming-events", getUpcomingEvents);

// get a specific event by id
router.get("/:id", getEvent);

// add a new event
router.post("/", protect, createEvent);

// check for conflicting events
router.post("/check-conflicts", protect, checkConflictingEvents);

// add image to event
router.post("/image", upload.single("img"), uploadEventImage);

// get image for an event
router.get("/image/:id", getEventImage);

// update a event
router.patch("/:id", protect, updateEvent);

// add participants for an event
router.post("/participants/:id", protect, addParticipant);

// remove participant
router.delete("/participants/:id", protect, removeParticipant);

// add organizer for an event
router.post("/organizers/:id", protect, addOrganizer);

// remove organizer
router.delete("/organizers/:eventId/:userId", protect, removeOrganizer);

// get organizers for an event
router.get("/organizers/:id", getOrganizers);

// remove All participants from an event
router.delete("/all-participants/:id", protect, removeAllParticipants);

// get participants for an event
router.get("/participants/:id", protect, getParticipants);

module.exports = router;
