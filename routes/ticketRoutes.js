const {
  addTicket,
  getTickets,
  getVerifiedTickets,
  getAllVerifiedTickets,
  getVerifiedTicketsForSamhitaId,
} = require("../controllers/TicketController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

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

module.exports = router;
