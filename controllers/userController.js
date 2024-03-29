const User = require("../models/userModel");

const getUserDetails = async (req, res) => {
  res.status(200).json(req.user);
};

const getOrganisedEvents = async (req, res) => {
  const user = await User.findById(req.user.id).populate("organizedEvents");
  if (!user) {
    res.status(400).json({ error: "No such user" });
  }
  res.status(200).json(user.organizedEvents);
};

const getParticipatedEvents = async (req, res) => {
  const user = await User.findById(req.user.id).populate("participatedEvents");
  if (!user) {
    res.status(400).json({ error: "No such user" });
  }
  res.status(200).json(user.participatedEvents);
};

const getUserIds = async (req, res) => {
  const users = await User.find({}).select("id");
  res.status(200).json(users.map((user) => user._id));
};

const getUserInfoWithMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: "No such user" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const setGender = async (req, res) => {
  try {
    const { gender } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(400).json({ error: "No such user" });
    }
    user.gender = gender;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getUserDetails,
  getOrganisedEvents,
  getParticipatedEvents,
  getUserIds,
  setGender,
  getUserInfoWithMobile,
};
