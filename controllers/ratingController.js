const Rating = require("../models/ratingModel");

const addRating = async (req, res) => {
  const user = req.user.id;
  const { eventId } = req.params;
  const { ratingVal } = req.body;
  const existingRating = await Rating.findOne({ user, event: eventId });
  if (!existingRating) {
    const rating = await Rating.create({
      user,
      event: eventId,
      ratingVal,
    });
    res.status(200).json(rating);
  } else {
    const rating = await Rating.findByIdAndUpdate(existingRating._id, {
      ratingVal,
    });
    res.status(200).json(rating);
  }
};

const getRating = async (req, res) => {
  const user = req.user.id;
  const { eventId } = req.params;
  const existingRating = await Rating.findOne({ user, event: eventId });
  if (!existingRating) {
    return res.status(400).json({ error: "No such rating" });
  }
  res.status(200).json(existingRating);
};

module.exports = { addRating, getRating };
