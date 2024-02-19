const Event = require("../../models/eventModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const Joi = require("joi");

const createEvent = async (req, res) => {
  const { error } = validateEvent(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const user = await User.findById(req.user.id);
  if (!user.isAdmin) {
    return res.status(401).json({ error: "Not authorized" });
  }
  console.log(req.body);
  const {
    eventName,
    eventStartDate,
    eventEndDate,
    venue,
    dept,
    eventType,
    firstPrizeMoney,
    secondPrizeMoney,
    otherInfo,
    contactName,
    contactPhone,
    contactEmail,
    link,
    image,
    public,
    whatsapp,
  } = req.body;
  try {
    const event = await Event.create({
      eventName,
      eventStartDate,
      eventEndDate,
      venue,
      dept,
      eventType,
      firstPrizeMoney,
      secondPrizeMoney,
      otherInfo,
      contactName,
      contactPhone,
      contactEmail,
      link,
      image,
      public,
      whatsapp,
      organisers: [req.user.id],
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: { organizedEvents: event._id },
    });
    console.log(event);
    console.log(image);
    return res.status(200).json(event);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const thisUserId = req.user._id;
  let isOrganizer = false;
  const organizedEvents = await User.findById(thisUserId)
    .select("organizedEvents")
    .populate("organizedEvents");
  for (let i = 0; i < organizedEvents.organizedEvents.length; i++) {
    if (organizedEvents.organizedEvents[i]._id.toString() === id) {
      isOrganizer = true;
      break;
    }
  }
  if (!isOrganizer) {
    return res.status(401).json({ error: "Not authorized" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No such event" });
  }
  const { error } = validateEvent(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const newEvent = { ...req.body };
  if (newEvent["image"] === "") {
    newEvent["image"] = null;
  }
  const event = await Event.findOneAndUpdate({ _id: id }, newEvent);
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  res.status(200).json(event);
};

const getEvents = async (req, res) => {
  const events = await Event.find({ public: true }).sort({ createdAt: -1 });
  res.status(200).json(events);
};

const getArchives = async (req, res) => {
  const events = await Event.find({ public: true })
    .sort({ createdAt: -1 })
    .where("eventEndDate")
    .lt(new Date());
  res.status(200).json(events);
};

const getEventIds = async (req, res) => {
  const events = await Event.find({}).select("_id");
  res.status(200).json(events.map((e) => e._id));
};

const getUpcomingEvents = async (req, res) => {
  const events = await Event.find({ public: true })
    .where("eventEndDate")
    .gte(new Date());
  res.status(200).json(events);
};

const getEvent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No such event" });
  }
  const event = await Event.findById(id)
    .populate("organisers")
    .populate("participants");
  if (!event) {
    return res.status(400).json({ error: "No such event" });
  }
  res.status(200).json(event);
};

const checkConflictingEvents = async (req, res) => {
  const { from, to } = req.body;
  const startTime = new Date(new Date(from).getTime() + 19800000);
  const endTime = new Date(new Date(to).getTime() + 19800000);
  const events = await Event.find({});
  let conflictingEvents = [];
  for (let i = 0; i < events.length; i++) {
    if (
      events[i].eventStartDate < endTime &&
      events[i].eventEndDate > startTime
    ) {
      conflictingEvents.push(events[i]);
    }
  }
  res.status(200).json({
    conflict: conflictingEvents.length ? true : false,
    events: conflictingEvents,
  });
};

const validateEvent = (data) => {
  const schema = Joi.object({
    eventName: Joi.string().required().label("Event name"),
    eventStartDate: Joi.date().required().label("Event startDate"),
    eventEndDate: Joi.date().label("Event end Date"),
    eventType: Joi.string().required().label("Event type"),
    venue: Joi.string().required().label("Venue"),
    dept: Joi.string().empty("").label("Dept"),
    firstPrizeMoney: Joi.number().label("First prize money"),
    secondPrizeMoney: Joi.number().label("Second prize money"),
    contactName: Joi.string().required().label("Contact name"),
    contactPhone: Joi.string().empty("").label("Contact phone"),
    contactEmail: Joi.string().email().empty("").label("Contact email"),
    otherInfo: Joi.string().empty("").label("Other Info"),
    link: Joi.string().empty("").label("Website Link"),
    image: Joi.string().empty("").label("Event image"),
    public: Joi.bool().label("Visible"),
    whatsapp: Joi.bool().label("WhatsApp no."),
  });
  return schema.validate(data);
};

module.exports = {
  createEvent,
  getEvents,
  getArchives,
  getEvent,
  getEventIds,
  getUpcomingEvents,
  updateEvent,
  checkConflictingEvents,
};
