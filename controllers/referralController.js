const Refferal = require("../models/referralModel");

const addReferral = async (req, res) => {
  try {
    const { referralCode, referredBy, discountPercent, discountAmount } =
      req.body;
    const referral = await Refferal.create({
      referralCode,
      referredBy,
      discountPercent,
      discountAmount,
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
    const { referralCode } = req.params;
    const referral = await Refferal.findOne({ referralCode }).select(
      "-referredBy"
    );
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

module.exports = {
  addReferral,
  getReferral,
};
