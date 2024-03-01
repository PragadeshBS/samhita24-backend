const { addTicket, getTickets } = require("../controllers/TicketController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", getTickets);

router.post("/", protect, adminOnly, addTicket);

module.exports = router;
