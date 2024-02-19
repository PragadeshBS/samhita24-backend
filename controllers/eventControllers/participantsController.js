const Event = require("../../models/eventModel");
const User = require("../../models/userModel");
const Registrations = require("../../models/registrationsModel");
const mongoose = require("mongoose");

const getParticipants = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No such event" });
  }
  const event = await Event.findById(id).populate("participants");
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  await res.status(200).json(event.participants);
};

const addParticipant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const event = await Event.findByIdAndUpdate(id, {
    $push: { participants: req.user._id },
  });
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  // add this event to the users' participated events list
  await User.findByIdAndUpdate(req.user.id, {
    $push: { participatedEvents: id },
  });
  // add this event to the registrations collection
  await Registrations.create({ userId: req.user.id, eventId: id });
  res.status(200).json(event);
};

const removeParticipant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const event = await Event.findByIdAndUpdate(id, {
    $pull: { participants: req.user._id },
  });
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  // remove this event from the users' participated events list
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { participatedEvents: id },
  });
  res.status(200).json(event);
};

const removeAllParticipants = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const participants = await Event.findById(id).select("participants");
  const event = await Event.findByIdAndUpdate(id, {
    participants: [],
  });
  participants.participants.forEach(async (p) => {
    await User.findByIdAndUpdate(p._id, {
      $pull: { participatedEvents: id },
    });
  });
  return res.status(200).json(event);
};

module.exports = {
  removeParticipant,
  addParticipant,
  getParticipants,
  removeAllParticipants,
};
