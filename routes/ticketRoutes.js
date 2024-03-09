const {
  addTicket,
  getTickets,
  getVerifiedTickets,
  getAllVerifiedTickets,
  getVerifiedTicketsForSamhitaId,
  getVerifiedParticipantsForOrganizer,
  verifyCheckoutIds,
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
  adminOnly,
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

module.exports = router;
