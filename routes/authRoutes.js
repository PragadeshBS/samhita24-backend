const {
  login,
  createUser,
  updateUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = require("express").Router();

router.post("/signup", createUser);

router.post("/login", login);

router.patch("/user/:id", updateUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

module.exports = router;
