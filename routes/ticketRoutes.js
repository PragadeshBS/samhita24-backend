const { addTicket, getTickets } = require("../controllers/TicketController");

const router = require("express").Router();

router.get("/", getTickets);

// router.post("/", addTicket);

module.exports = router;
