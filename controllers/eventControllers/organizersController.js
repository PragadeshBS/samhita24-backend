const Event = require("../../models/eventModel");
const User = require("../../models/userModel");

const addOrganizer = async (req, res) => {
  const { id } = req.params;
  const { organizerRegNo } = req.body;
  const user = await User.findOne({ regNo: organizerRegNo });
  if (!user) {
    return res
      .status(400)
      .json({ error: "No user exists with the given email" });
  }
  const event = await Event.findByIdAndUpdate(id, {
    $push: { organisers: user._id },
  });
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  // add this event to the users' organized events list
  await User.findByIdAndUpdate(user._id, {
    $push: { organizedEvents: id },
  });
  res.status(200).json(user);
};

const removeOrganizer = async (req, res) => {
  const { eventId, userId } = req.params;
  const user = await User.findById(userId);
  let isOrganizer = false;
  const organizedEvents = await User.findById(req.user.id)
    .select("organizedEvents")
    .populate("organizedEvents");
  for (let i = 0; i < organizedEvents.organizedEvents.length; i++) {
    if (organizedEvents.organizedEvents[i]._id.toString() === eventId) {
      isOrganizer = true;
      break;
    }
  }
  if (!isOrganizer) {
    return res.status(401).json({ error: "Not authorized" });
  }
  if (!user) {
    return res.status(400).json({ error: "No user exists" });
  }
  const event = await Event.findByIdAndUpdate(eventId, {
    $pull: { organisers: userId },
  });
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  // remove this event from the users' organized events list
  await User.findByIdAndUpdate(userId, {
    $pull: { organizedEvents: eventId },
  });
  res.status(200).json(user);
};

const getOrganizers = async (req, res) => {
  const { id } = req.params;
  const organisers = await Event.findById(id)
    .select("organisers")
    .populate("organisers");
  res.status(200).json(organisers.organisers);
};

module.exports = { addOrganizer, removeOrganizer, getOrganizers };
