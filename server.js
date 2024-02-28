require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const referralRoutes = require("./routes/referralRoutes");

const app = express();

// const corsOptions = {
//   origin: ["https://samhita.me"],
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token, Authorization"
  );
  next();
});

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
app.use("/api/tickets", ticketRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/referrals", referralRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(
      `Connected to MongoDB\nServer listening on port ${process.env.PORT}`
    );
  });
});
