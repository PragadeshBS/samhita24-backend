const Event = require("../../models/eventModel");
const mongoose = require("mongoose");
const EventImage = require("../../models/eventImageModel");

const uploadEventImage = async (req, res) => {
  const image = {
    data: new Buffer.from(req.file.buffer, "base64"),
    contentType: req.file.mimetype,
  };
  const savedImage = await EventImage.create({ image });
  res.send(savedImage);
};

const getEventImage = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No such event" });
  }
  const event = await Event.findById(id).populate("image");
  if (!event || !event.image) {
    return res.status(400).json({ error: "No such event image" });
  }
  res.set("Content-type", event.image.contentType);
  res.send(event.image.image.data);
};

module.exports = {
  uploadEventImage,
  getEventImage,
};
