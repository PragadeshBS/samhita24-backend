const Refferal = require("../models/referralModel");

const addReferral = async (req, res) => {
  try {
    const {
      referralCode,
      referredBy,
      discountPercent,
      discountAmount,
      applicableCollege,
      applicableTicketTypes,
    } = req.body;
    const referral = await Refferal.create({
      referralCode,
      referredBy,
      discountPercent,
      discountAmount,
      applicableCollege,
      applicableTicketTypes,
    });
    return res.status(200).json({
      referral,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const getReferral = async (req, res) => {
  try {
    let { referralCode } = req.params;
    referralCode = referralCode.toLowerCase();
    const referral = await Refferal.findOne({ referralCode }).select(
      "-referredBy"
    );
    if (!referral) {
      return res.status(400).json({
        message: "Referral code not found",
      });
    }
    if (!referral.active) {
      return res.status(400).json({
        message: "Referral code is not active",
      });
    }
    if (
      referral.applicableCollege &&
      referral.applicableCollege.replaceAll(" ", "").replaceAll(".", "") !==
        req.user.college.replaceAll(" ", "").replaceAll(".", "")
    ) {
      return res.status(400).json({
        message: "Referral code is not applicable for your college",
      });
    }
    return res.status(200).json({
      referral,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Refferal.find({});
    return res.status(200).json({
      referrals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  addReferral,
  getReferral,
  getAllReferrals,
};
