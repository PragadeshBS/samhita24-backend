const Ticket = require("../models/ticketModel");
const VerifiedTransactions = require("../models/verifiedTransactionsModel");
const AccommodationTimings = require("../models/accommodationTimingModel");

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

const getAllVerifiedTickets = async (req, res) => {
  try {
    const verifiedTransactions = await VerifiedTransactions.find({})
      .populate("user", "userName mobile email college dept regNo gender")
      .populate({
        path: "transactions",
        select: "purchasedTickets",
        populate: {
          path: "purchasedTickets",
        },
      });
    return res.status(200).json({ message: "success", verifiedTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerifiedTicketsForSamhitaId = async (req, res) => {
  try {
    const { samhitaId } = req.params;
    if (!samhitaId) {
      return res.status(400).json({ message: "Samhita ID is required" });
    }
    const verifiedTransactions = await VerifiedTransactions.findOne({
      samhitaId,
    })
      .populate("user", "userName mobile email college dept regNo gender")
      .populate({
        path: "transactions",
        select: "purchasedTickets",
        populate: {
          path: "purchasedTickets",
        },
      });
    return res.status(200).json({ message: "success", verifiedTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerifiedParticipantsForOrganizer = async (req, res) => {
  try {
    const managingCheckoutIds = req.user.managingCheckouts;
    const checkoutOutIdParticipantsMap = {};
    for (let checkoutId of managingCheckoutIds) {
      checkoutOutIdParticipantsMap[checkoutId] = [];
    }
    const verifiedTransactions = await VerifiedTransactions.find({})
      .populate("user", "userName mobile email college dept regNo gender")
      .populate({
        path: "transactions",
        select: "purchasedTickets",
        populate: {
          path: "purchasedTickets",
        },
      });
    for (let verifiedTransaction of verifiedTransactions) {
      for (let transaction of verifiedTransaction.transactions) {
        for (let ticket of transaction.purchasedTickets) {
          if (managingCheckoutIds.includes(ticket.checkoutId)) {
            checkoutOutIdParticipantsMap[ticket.checkoutId].push(
              verifiedTransaction.user
            );
          }
        }
      }
    }
    return res
      .status(200)
      .json({ message: "success", checkoutOutIdParticipantsMap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerifiedAccommodationParticipants = async (req, res) => {
  try {
    const managingCheckoutIds = [
      "accommodation_24hrs",
      "accommodation_48hrs",
      "accommodation_24hrs_no_food",
      "accommodation_48hrs_no_food",
      "accommodation_48hrs_no_food_new",
    ];
    const checkoutOutIdParticipantsMap = {};
    for (let checkoutId of managingCheckoutIds) {
      checkoutOutIdParticipantsMap[checkoutId] = [];
    }
    const verifiedTransactions = await VerifiedTransactions.find({})
      .populate("user", "userName mobile email college dept regNo gender")
      .populate({
        path: "transactions",
        select: "purchasedTickets",
        populate: {
          path: "purchasedTickets",
        },
      });
    const accommodationTimings = await AccommodationTimings.find({});
    for (let verifiedTransaction of verifiedTransactions) {
      for (let transaction of verifiedTransaction.transactions) {
        for (let ticket of transaction.purchasedTickets) {
          if (managingCheckoutIds.includes(ticket.checkoutId)) {
            checkoutOutIdParticipantsMap[ticket.checkoutId].push({
              ...verifiedTransaction.user._doc,
              accommodationTiming: accommodationTimings.find(
                (accommodationTiming) =>
                  accommodationTiming.user.toString() ===
                  verifiedTransaction.user._id.toString()
              ),
            });
          }
        }
      }
    }
    return res
      .status(200)
      .json({ message: "success", checkoutOutIdParticipantsMap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyCheckoutIds = async (req, res) => {
  return res.status(200).json({ message: "success" });
};

module.exports = {
  addTicket,
  getTickets,
  getVerifiedTickets,
  getAllVerifiedTickets,
  getVerifiedTicketsForSamhitaId,
  getVerifiedParticipantsForOrganizer,
  verifyCheckoutIds,
  getVerifiedAccommodationParticipants,
};
