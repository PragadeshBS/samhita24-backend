const Ticket = require("../models/ticketModel");
const Transaction = require("../models/transactionModel");
const VerifiedTransactions = require("../models/verifiedTransactionsModel");

const addTicket = async (req, res) => {
  try {
    const { ticketName, ticketPrice, ticketDescription, checkoutId, type } =
      req.body;
    const ticket = await Ticket.create({
      ticketName,
      ticketPrice,
      ticketDescription,
      checkoutId,
      type,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerifiedTickets = async (req, res) => {
  try {
    const verifiedTransactions = await VerifiedTransactions.findOne({
      user: req.user._id,
    })
      .populate({
        path: "transactions",
        select: "purchasedTickets",
        populate: {
          path: "purchasedTickets",
        },
      })
      .select("transactions samhitaId");
    if (!verifiedTransactions) {
      return res.status(200).json({ verifiedTickets: [] });
    }
    const verifiedTickets = [];
    for (let transaction of verifiedTransactions.transactions) {
      for (let ticket of transaction.purchasedTickets) {
        verifiedTickets.push(ticket);
      }
    }
    res
      .status(200)
      .json({ verifiedTickets, samhitaId: verifiedTransactions.samhitaId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTicket,
  getTickets,
  getVerifiedTickets,
};
