const { accommodationCheckoutIdHoursMap } = require("../constants");
const AccommodationTiming = require("../models/accommodationTimingModel");
const VerifiedTransactions = require("../models/verifiedTransactionsModel");
const {
  getVerifiedAccommodationTicketsForUsers,
} = require("../shared/getVerifiedAccTickets");

const getAccommodationTimings = async (req, res) => {
  try {
    const verifiedAccommodationInfo = await getAccommodationTicketsForUser(
      req.user._id
    );
    if (!verifiedAccommodationInfo.verifiedAccommodationTickets.length) {
      return res.status(200).json({
        purchasedAccommodationTickets: false,
        hours: 0,
      });
    }
    const accommodationTimings = await AccommodationTiming.findOne({
      user: req.user._id,
    });
    if (!accommodationTimings) {
      return res.status(200).json({
        purchasedAccommodationTickets: true,
        hours: verifiedAccommodationInfo.hours,
      });
    }
    return res.status(200).json({
      purchasedAccommodationTickets: true,
      hours: verifiedAccommodationInfo.hours,
      accommodationTimings,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const setAccommodationTimings = async (req, res) => {
  try {
    const { checkIn, checkOut, remarks } = req.body;
    const existingAccommodationTiming = await AccommodationTiming.findOne({
      user: req.user._id,
    });
    if (!existingAccommodationTiming) {
      const accommodationTiming = new AccommodationTiming({
        checkIn,
        checkOut,
        user: req.user._id,
        remarks,
      });
      await accommodationTiming.save();
      return res.status(201).json({ accommodationTiming });
    } else {
      existingAccommodationTiming.checkIn = checkIn;
      existingAccommodationTiming.checkOut = checkOut;
      existingAccommodationTiming.remarks = remarks;
      await existingAccommodationTiming.save();
      return res.status(200).json({ existingAccommodationTiming });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAccommodationTicketsForUser = async (userId) => {
  try {
    const verifiedTransactions = await VerifiedTransactions.findOne({
      user: userId,
    }).populate({
      path: "transactions",
      select: "purchasedTickets",
      populate: {
        path: "purchasedTickets",
        match: { type: "accommodation" },
      },
    });
    const verifiedAccommodationTickets = [];
    if (!verifiedTransactions) {
      return {
        verifiedAccommodationTickets,
        hours: 0,
      };
    }
    let hours = 0;
    for (let transaction of verifiedTransactions.transactions) {
      for (let ticket of transaction.purchasedTickets) {
        if (ticket.type === "accommodation") {
          verifiedAccommodationTickets.push(ticket);
          hours += accommodationCheckoutIdHoursMap[ticket.checkoutId];
        }
      }
    }
    return {
      verifiedAccommodationTickets,
      hours,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllAccommodationTimings = async (req, res) => {
  try {
    const accommodationTimings = await AccommodationTiming.find().populate(
      "user"
    );
    const userIdAccommodationTimingsMap = {};
    const userIds = [];
    for (const timing of accommodationTimings) {
      userIds.push(timing.user._id);
      userIdAccommodationTimingsMap[timing.user._id] = timing;
    }
    const verifiedAccommodationTickets =
      await getVerifiedAccommodationTicketsForUsers(userIds);
    for (const verifiedAccommodationTicket of verifiedAccommodationTickets) {
      const userId = verifiedAccommodationTicket.user._id;
      if (userIdAccommodationTimingsMap[userId]) {
        userIdAccommodationTimingsMap[userId] = {
          ...userIdAccommodationTimingsMap[userId]._doc,
          verifiedAccommodationTickets:
            verifiedAccommodationTicket.purchasedAccommodationTickets,
        };
      }
    }
    return res.status(200).json({
      accommodationTimings: Object.values(userIdAccommodationTimingsMap),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAccommodationTimings,
  getAllAccommodationTimings,
  setAccommodationTimings,
};
