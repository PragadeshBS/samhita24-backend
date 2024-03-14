const {
  addTicket,
  getTickets,
  getVerifiedTickets,
  getAllVerifiedTickets,
  getVerifiedTicketsForSamhitaId,
  getVerifiedParticipantsForOrganizer,
  verifyCheckoutIds,
  getVerifiedAccommodationParticipants,
} = require("../controllers/TicketController");
const {
  protect,
  adminOnly,
  organizerOnly,
} = require("../middleware/authMiddleware");
const { validateTickets } = require("../middleware/ticketMiddleware");

const router = require("express").Router();

router.get("/", getTickets);

router.post("/", protect, adminOnly, addTicket);

router.get("/verified", protect, getVerifiedTickets);

router.get("/verified/all", protect, adminOnly, getAllVerifiedTickets);

router.get(
  "/verified/:samhitaId",
  protect,
  organizerOnly,
  getVerifiedTicketsForSamhitaId
);

router.get(
  "/organizer/verified/",
  protect,
  organizerOnly,
  getVerifiedParticipantsForOrganizer
);

router.post(
  "/verify-checkout-ids",
  protect,
  validateTickets,
  verifyCheckoutIds
);

router.get(
  "/accommodation-participants",
  protect,
  adminOnly,
  getVerifiedAccommodationParticipants
);

module.exports = router;
