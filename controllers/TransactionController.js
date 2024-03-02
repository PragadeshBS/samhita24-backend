const Transaction = require("../models/transactionModel");
const Ticket = require("../models/ticketModel");
const Referral = require("../models/referralModel");
const VerifiedTransactions = require("../models/verifiedTransactionsModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

const addTransaction = async (req, res) => {
  try {
    const { upiTransactionId, checkoutIds, referralCode } = req.body;
    if (!upiTransactionId || !checkoutIds) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (upiTransactionId.length !== 12) {
      return res
        .status(400)
        .json({ message: "UPI Transaction ID must be 12 characters long" });
    }
    const existingTransaction = await Transaction.findOne({
      upiTransactionId,
    });
    if (existingTransaction) {
      return res
        .status(400)
        .json({ message: "A Transaction with this UPI ID already exists" });
    }
    let amount = 0;
    const purchasedTicketIds = [];
    let containsAccommodationTicket = false;
    for (let i = 0; i < checkoutIds.length; i++) {
      const ticket = await Ticket.findOne({ checkoutId: checkoutIds[i] });
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      if (ticket.type === "accommodation") {
        containsAccommodationTicket = true;
      }
      purchasedTicketIds.push(ticket._id);
      amount += parseFloat(ticket.ticketPrice.toString());
    }
    const referral = await Referral.findOne({
      referralCode,
    });
    if (referral) {
      if (!referral.active) {
        return res.status(400).json({ message: "Referral code is not active" });
      } else if (
        referral.applicableCollege &&
        referral.applicableCollege !== req.user.college
      ) {
        return res.status(400).json({
          message: "Referral code is not applicable for your college",
        });
      }
      if (containsAccommodationTicket) {
        return res.status(400).json({
          message: "Referral code is not applicable for accommodation tickets",
        });
      }
      if (referral.discountAmount) {
        amount -= parseFloat(referral.discountAmount.toString());
      } else if (referral.discountPercent) {
        amount -=
          (amount * parseFloat(referral.discountPercent.toString())) / 100;
      }
    }
    const transactionObject = {
      upiTransactionId,
      transactionAmount: amount,
      userId: req.user._id,
      purchasedTickets: purchasedTicketIds,
    };
    if (referral) {
      transactionObject.referral = referral._id;
    }
    const transaction = await Transaction.create(transactionObject);
    return res
      .status(200)
      .json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("purchasedTickets")
      .populate("referral userId");
    return res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
    })
      .populate("purchasedTickets")
      .populate("referral");
    return res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const addTransactionToVerified = async (transaction, user) => {
  try {
    const existingVerifiedTransactions = await VerifiedTransactions.findOne({
      user,
    });
    if (existingVerifiedTransactions) {
      existingVerifiedTransactions.transactions.push(transaction._id);
      await existingVerifiedTransactions.save();
    } else {
      await VerifiedTransactions.create({
        user,
        transactions: [transaction._id],
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendNotificationToUser = async (userId) => {
  const user = await User.findById(userId).select("email");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PWD,
    },
  });

  var mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Transaction Verified - Samhita 2024",
    html: `<p>Hi! <br>A transaction you made at samhita.me was verified. Click the below link to view
    all your purchased tickets.</p>
    <a href="https://samhita.me/#/my-tickets">View your Tickets</a>`,
  };

  transporter.sendMail(mailOptions);
};

const verifyTransactions = async (req, res) => {
  try {
    const existingVerifiedTransactions = await VerifiedTransactions.find();
    const successfulTransactions = await Transaction.find({
      transactionStatus: "Success",
    });
    const transactionsToAdd = [];
    successfulTransactions.forEach((transaction) => {
      const isVerified = existingVerifiedTransactions.some(
        (verifiedTransaction) =>
          verifiedTransaction.transactions.includes(transaction._id)
      );
      if (!isVerified) {
        transactionsToAdd.push(transaction);
      }
    });
    const userIdsToSendNotifications = [];
    for (let i = 0; i < transactionsToAdd.length; i++) {
      await addTransactionToVerified(
        transactionsToAdd[i],
        transactionsToAdd[i].userId
      );
      userIdsToSendNotifications.push(transactionsToAdd[i].userId);
    }
    for (let userId of userIdsToSendNotifications) {
      await sendNotificationToUser(userId);
    }
    res.status(200).json({
      message: "Transactions verified successfully",
      transactionsAdded: transactionsToAdd.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getAllTransactions,
  verifyTransactions,
};
