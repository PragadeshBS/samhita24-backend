const Ticket = require("../models/ticketModel");

// const addTicket = async (req, res) => {
//   try {
//     const { ticketName, ticketPrice, ticketDescription, checkoutId, type } =
//       req.body;
//     const ticket = await Ticket.create({
//       ticketName,
//       ticketPrice,
//       ticketDescription,
//       checkoutId,
//       type,
//     });
//     res.status(201).json(ticket);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // addTicket,
  getTickets,
};
