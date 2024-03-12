const VerifiedTransactions = require("../models/verifiedTransactionsModel");

const getVerifiedAccommodationTicketsForUsers = async (userIds) => {
  try {
    const verifiedTransactions = await VerifiedTransactions.find({
      user: { $in: userIds },
    }).populate({
      path: "transactions",
      select: "purchasedTickets",
      populate: {
        path: "purchasedTickets",
      },
    });
    const verifiedAccommodationTickets = [];
    for (const verifiedTransaction of verifiedTransactions) {
      verifiedAccommodationTickets.push({
        user: verifiedTransaction.user,
        purchasedAccommodationTickets: [],
      });
      for (const transaction of verifiedTransaction.transactions) {
        for (const ticket of transaction.purchasedTickets) {
          if (ticket.type === "accommodation") {
            verifiedAccommodationTickets[
              verifiedAccommodationTickets.length - 1
            ].purchasedAccommodationTickets.push(ticket.ticketName);
          }
        }
      }
    }
    return verifiedAccommodationTickets;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getVerifiedAccommodationTicketsForUsers,
};
