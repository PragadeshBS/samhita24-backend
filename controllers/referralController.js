const Refferal = require("../models/referralModel");
const Transaction = require("../models/transactionModel");
const { validateReferral } = require("../shared/validateReferral");

const addReferral = async (req, res) => {
  try {
    const {
      referralCode,
      referredBy,
      discountPercent,
      discountAmount,
      applicableCollege,
      applicableTicketTypes,
      applicableCheckoutIds,
      applicableDept,
    } = req.body;
    const referral = await Refferal.create({
      referralCode,
      referredBy,
      discountPercent,
      discountAmount,
      applicableCollege,
      applicableDept,
      applicableTicketTypes,
      applicableCheckoutIds,
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
    const validateReferralResult = validateReferral(referral, req.user);
    if (!validateReferralResult.success) {
      return res.status(400).json({
        message: validateReferralResult.message,
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

const getAllReferrals = async (_req, res) => {
  try {
    let referrals = await Refferal.find({});
    referrals = referrals.map((referral) => referral.toObject());
    for (let i = 0; i < referrals.length; i++) {
      referrals[i].usageCount = await Transaction.countDocuments({
        referral: referrals[i]._id,
      });
    }
    return res.status(200).json({
      referrals,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const setReferralActiveStatus = async (req, res) => {
  try {
    const { referralCode, active } = req.body;
    const referral = await Refferal.findOne({ referralCode });
    if (!referral) {
      return res.status(400).json({
        message: "Referral code not found",
      });
    }
    referral.active = active;
    await referral.save();
    return res.status(200).json({
      referral,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  addReferral,
  getReferral,
  getAllReferrals,
  setReferralActiveStatus,
};
