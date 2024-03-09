const Ticket = require("../models/ticketModel");

const validateTickets = async (req, res, next) => {
  const { checkoutIds } = req.body;
  const tickets = await Ticket.find({ checkoutId: { $in: checkoutIds } });
  if (tickets.length !== checkoutIds.length) {
    return res.status(400).json({ message: "One or more invalid checkoutIds" });
  }
  for (let ticket of tickets) {
    if (!ticket.active) {
      return res
        .status(400)
        .json({ message: "One or more tickets not active" });
    }
    if (ticket.applicableGender === "Male" && req.user.gender !== "Male") {
      return res.status(400).json({
        message:
          "One or more tickets are applicable only for male participants",
      });
    } else if (
      ticket.applicableGender === "FEMALE" &&
      req.user.gender !== "FEMALE"
    ) {
      return res.status(400).json({
        message:
          "One or more tickets are applicable only for female participants",
      });
    }
  }
  next();
};

module.exports = { validateTickets };
