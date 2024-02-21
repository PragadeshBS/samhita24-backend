const Joi = require("joi");
const User = require("../models/userModel");
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const PasswordReset = require("../models/passwordResetModel");
const argon2 = require("argon2");

const createUser = async (req, res) => {
  try {
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { userName, regNo, mobile, email, dept, password } = req.body;

    // finding duplicates
    let exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }
    exists = await User.findOne({ mobile });
    if (exists) {
      return res.status(400).json({ error: "Mobile no. already exists" });
    }
    exists = await User.findOne({ regNo });
    if (exists) {
      return res.status(400).json({ error: "Reg. no. already exists" });
    }

    // hash pwd
    let hashedPassword;
    try {
      hashedPassword = await argon2.hash(password);
    } catch (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    const user = await User.create({
      userName,
      regNo,
      mobile,
      email,
      dept,
      password: hashedPassword,
    });
    const userInfo = JSON.parse(JSON.stringify(user));
    delete userInfo.password;
    res.status(200).json({ email, token: generateToken(user._id), userInfo });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateUpdate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { regNo, mobile, email } = req.body;

    // finding duplicates
    let exists = await User.findOne({ email });
    if (exists && exists.id !== id) {
      return res.status(400).json({ error: "Email already exists" });
    }
    exists = await User.findOne({ mobile });
    if (exists && exists.id !== id) {
      return res.status(400).json({ error: "Mobile no. already exists" });
    }
    exists = await User.findOne({ regNo });
    if (exists && exists.id !== id) {
      return res.status(400).json({ error: "Reg. no. already exists" });
    }
    if (req.body.password) {
      // hash pwd
      let hashedPassword;
      try {
        hashedPassword = await argon2.hash(password);
      } catch (err) {
        return res.status(500).json({ error: "Something went wrong" });
      }
      req.body.password = hashedPassword;
    }
    const user = await User.findByIdAndUpdate(id, {
      ...req.body,
    });
    res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // validate pwd
    let validPassword = false;
    try {
      if (await argon2.verify(user.password, password)) {
        validPassword = true;
      } else {
        validPassword = false;
      }
    } catch (err) {
      // internal failure
      return res.status(500).json({ error: "Something went wrong" });
    }

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const userInfo = JSON.parse(JSON.stringify(user));
    delete userInfo.password;
    res
      .status(200)
      .json({ email: user.email, token: generateToken(user._id), userInfo });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const validateSignup = (data) => {
  const schema = Joi.object({
    userName: Joi.string().required().label("Name"),
    regNo: Joi.string().required().length(10).label("Register Number"),
    mobile: Joi.string().required().length(10).label("Mobile "),
    dept: Joi.string().empty("").label("Department"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().length(8).required().label("Password"),
    confirmPassword: Joi.string()
      .length(8)
      .required()
      .label("Confirm Password"),
  });
  return schema.validate(data);
};

const validatePasswordUpdate = (data) => {
  const schema = Joi.object({
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

const validateUpdate = (data) => {
  const schema = Joi.object({
    userName: Joi.string().required().label("Name"),
    regNo: Joi.string().empty("").label("Register Number"),
    mobile: Joi.string().required().label("Mobile "),
    dept: Joi.string().empty("").label("Department"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().empty("").label("Password"),
    confirmPassword: passwordComplexity().empty("").label("Confirm Password"),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "14d",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ msg: "success" });
  }
  const token = generatePasswordResetToken();

  await PasswordReset.create({
    token,
    user: user._id,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PWD,
    },
  });

  var mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Password reset - Samhita 2024",
    html: `<p>Click the following link to reset your password. If you did not request for password reset, you can ignore this mail.</p>
    <a href="https://samhita.me/#/reset-password?token=${token}">Reset password</a>`,
  };

  transporter.sendMail(mailOptions);

  res.status(200).json({ msg: "success" });
};

const generatePasswordResetToken = () => {
  return crypto.randomBytes(128).toString("hex");
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const pwdReset = await PasswordReset.findOne({ token })
    .where("createdAt")
    .gt(yesterday)
    .where("expired")
    .equals(false);
  if (!pwdReset) {
    return res
      .status(400)
      .json({ error: "This link has either expired or is invalid" });
  }
  // const { error } = validatePasswordUpdate({ password });
  // if (error) {
  //   return res.status(400).json({ error: error.details[0].message });
  // }
  let hashedPassword;
  try {
    hashedPassword = await argon2.hash(password);
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong" });
  }
  await User.findOneAndUpdate(
    { _id: pwdReset.user },
    { password: hashedPassword }
  );
  await PasswordReset.findOneAndUpdate({ token }, { expired: true });
  res.status(200).json({ msg: "succcess" });
};

module.exports = {
  login,
  createUser,
  updateUser,
  forgotPassword,
  resetPassword,
};
