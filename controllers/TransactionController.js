const Transaction = require("../models/transactionModel");
const Ticket = require("../models/ticketModel");

const addTransaction = async (req, res) => {
  try {
    const { upiTransactionId, checkoutIds } = req.body;
    if (!upiTransactionId || !checkoutIds) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (upiTransactionId.length !== 12) {
      return res
        .status(400)
        .json({ message: "UPI Transaction ID must be 12 characters long" });
    }
    let amount = 0;
    const purchasedTicketIds = [];
    for (let i = 0; i < checkoutIds.length; i++) {
      const ticket = await Ticket.findOne({ checkoutId: checkoutIds[i] });
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      purchasedTicketIds.push(ticket._id);
      amount += parseFloat(ticket.ticketPrice.toString());
    }
    const transaction = await Transaction.create({
      upiTransactionId,
      transactionAmount: amount,
      userId: req.user._id,
      purchasedTickets: purchasedTicketIds,
    });
    return res
      .status(200)
      .json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
    }).populate("purchasedTickets");
    return res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
};
