const {
  addTicket,
  getTickets,
  getVerifiedTickets,
} = require("../controllers/TicketController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", getTickets);

router.post("/", protect, adminOnly, addTicket);

router.get("/verified", protect, getVerifiedTickets);

module.exports = router;
