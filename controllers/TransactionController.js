const Transaction = require("../models/transactionModel");
const Ticket = require("../models/ticketModel");
const Referral = require("../models/referralModel");
const VerifiedTransactions = require("../models/verifiedTransactionsModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const axios = require("axios");
const {
  validateReferralForTransaction,
} = require("../shared/validateReferral");

const addTransaction = async (req, res) => {
  try {
    const { upiTransactionId, checkoutIds, referralCode, captchaValue } =
      req.body;
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      `secret=${process.env.RECAPTCHA_SECRET}&response=${captchaValue}`
    );
    console.log("captcha response", response.data);
    if (!response.data.success) {
      return res.status(400).json({ error: "Invalid captcha" });
    }
    if (!upiTransactionId || !checkoutIds) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (upiTransactionId.length !== 12) {
      return res
        .status(400)
        .json({ message: "UPI Transaction ID must be 12 characters long" });
    }
    if (isNaN(upiTransactionId)) {
      return res
        .status(400)
        .json({ message: "UPI Transaction ID must be a number" });
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
    const ticketTypes = [];
    for (let i = 0; i < checkoutIds.length; i++) {
      const ticket = await Ticket.findOne({ checkoutId: checkoutIds[i] });
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      ticketTypes.push(ticket.type);
      if (ticket.type === "accommodation") {
        containsAccommodationTicket = true;
      }
      purchasedTicketIds.push(ticket._id);
      amount += parseFloat(ticket.ticketPrice.toString());
    }
    const lowerCaseReferralCode = referralCode.toLowerCase();
    const referral = await Referral.findOne({
      referralCode: lowerCaseReferralCode,
    });
    if (referral) {
      if (containsAccommodationTicket) {
        return res
          .status(400)
          .json({ message: "Referral code not applicable for accommodation" });
      }
      const validateReferralResult = validateReferralForTransaction(
        referral,
        req.user,
        checkoutIds,
        ticketTypes
      );
      if (!validateReferralResult.success) {
        return res.status(400).json({
          message: validateReferralResult.message,
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
    return res.status(500).json({ error: error.message });
  }
};

const addTransactionAdmin = async (req, res) => {
  try {
    const { upiTransactionId, checkoutIds, mobile, referralCode } = req.body;
    if (!upiTransactionId || !checkoutIds || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (upiTransactionId.length !== 12) {
      return res.status(400).json({
        message: "UPI Transaction ID must be 12 characters long",
      });
    }
    if (isNaN(upiTransactionId)) {
      return res
        .status(400)
        .json({ message: "UPI Transaction ID must be a number" });
    }
    const existingTransaction = await Transaction.findOne({
      upiTransactionId,
    });
    if (existingTransaction) {
      return res
        .status(400)
        .json({ message: "A Transaction with this UPI ID already exists" });
    }
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let amount = 0;
    const purchasedTicketIds = [];
    const ticketTypes = [];
    for (let i = 0; i < checkoutIds.length; i++) {
      const ticket = await Ticket.findOne({ checkoutId: checkoutIds[i] });
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      purchasedTicketIds.push(ticket._id);
      amount += parseFloat(ticket.ticketPrice.toString());
    }
    const lowerCaseReferralCode = referralCode.toLowerCase();
    const referral = await Referral.findOne({
      referralCode: lowerCaseReferralCode,
    });
    if (referralCode && !referral) {
      return res.status(400).json({ message: "Referral code not found" });
    }
    if (referral) {
      const validateReferralResult = validateReferralForTransaction(
        referral,
        user,
        checkoutIds,
        ticketTypes
      );
      if (!validateReferralResult.success) {
        return res.status(400).json({
          message: validateReferralResult.message,
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
      userId: user._id,
      purchasedTickets: purchasedTicketIds,
      transactionStatus: "Success",
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

const addTransactionToVerified = async (transaction) => {
  try {
    const userId = transaction.userId;
    const existingVerifiedTransactions = await VerifiedTransactions.findOne({
      user: userId,
    });
    if (existingVerifiedTransactions) {
      existingVerifiedTransactions.transactions.push(transaction._id);
      await existingVerifiedTransactions.save();
    } else {
      await VerifiedTransactions.create({
        user: userId,
        transactions: [transaction._id],
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendNotificationToUser = async (emails) => {
  // const user = await User.findById(userId).select("email");
  // console.log(user.email);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PWD,
    },
  });

  var mailOptions = {
    from: process.env.MAIL_USERNAME,
    bcc: emails,
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
    const emailIds = [];
    for (let i = 0; i < transactionsToAdd.length; i++) {
      const userId = transactionsToAdd[i].userId;
      await addTransactionToVerified(transactionsToAdd[i]);
      const user = await User.findById(userId).select("email");
      emailIds.push(user.email);
    }
    console.log("sending emails to", emailIds);
    if (emailIds.length > 0) {
      await sendNotificationToUser(emailIds);
    }
    res.status(200).json({
      message: "Transactions verified successfully",
      transactionsAdded: transactionsToAdd.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addReferralToTransaction = async (req, res) => {
  try {
    const { upiTransactionId, referralCode } = req.body;
    const lowerCaseReferralCode = referralCode.toLowerCase();
    const referral = await Referral.findOne({
      referralCode: lowerCaseReferralCode,
    });
    if (!referral) {
      return res.status(400).json({ message: "Referral code not found" });
    }
    const transaction = await Transaction.findOne({ upiTransactionId });
    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }
    if (transaction.referral) {
      return res
        .status(400)
        .json({ message: "Referral already added to transaction" });
    }
    const user = await User.findById(transaction.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const checkoutIds = [],
      ticketTypes = [];
    for (let i = 0; i < transaction.purchasedTickets.length; i++) {
      const ticket = await Ticket.findById(transaction.purchasedTickets[i]);
      checkoutIds.push(ticket.checkoutId);
      ticketTypes.push(ticket.type);
    }
    for (let i = 0; i < checkoutIds.length; i++) {}
    const validateReferralResult = validateReferralForTransaction(
      referral,
      user,
      checkoutIds,
      ticketTypes
    );
    if (!validateReferralResult.success) {
      return res.status(400).json({
        message: validateReferralResult.message,
      });
    }
    transaction.referral = referral._id;
    if (referral.discountAmount) {
      transaction.transactionAmount -= parseFloat(
        referral.discountAmount.toString()
      );
    } else if (referral.discountPercent) {
      transaction.transactionAmount -=
        (transaction.transactionAmount *
          parseFloat(referral.discountPercent.toString())) /
        100;
    }
    transaction.transactionStatus = "Success";
    await transaction.save();
    return res
      .status(200)
      .json({ message: "Referral added to transaction successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getUserCollegeFromTransaction = async (req, res) => {
  try {
    const { upiTransactionId } = req.body;
    const transaction = await Transaction.findOne({ upiTransactionId });
    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }
    const user = await User.findById(transaction.userId).select("college");
    const applicableReferral = await Referral.findOne({
      applicableCollege: user.college,
    }).select("referralCode");
    return res.status(200).json({
      college: user.college,
      applicableReferralCode: applicableReferral?.referralCode,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getAllTransactions,
  verifyTransactions,
  addReferralToTransaction,
  getUserCollegeFromTransaction,
  addTransactionAdmin,
};
