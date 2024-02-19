require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// const corsOptions = {
//   origin: ["http://localhost:5173"],
//   optionsSuccessStatus: 200,
// };

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/logs", analyticsRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(
      `Connected to MongoDB\nServer listening on port ${process.env.PORT}`
    );
  });
});
