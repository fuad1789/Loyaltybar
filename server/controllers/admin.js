const AdminSchema = require("../models/admin");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email and password are required" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await AdminSchema.create({ email, password: passwordHash });
    return res.status(201).json({
      status: "OK",
      newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // findOne metoduna nesne olarak parametre geçildi
    const user = await AdminSchema.findOne({ email: email });
    if (!user) {
      return res.status(500).json({ msg: "Admin diğilsiniz" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(500).json({ msg: "Şifre yanlış" });
    }
    return res.status(200).json({
      status: "OK",
      user,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
};

const token = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await AdminSchema.findOne({ _id: id });
    if (!user) {
      return res.status(500).json({ msg: "Admin diğilsiniz" });
    }

    return res.status(200).json({
      status: "OK",
      id,
      user,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

module.exports = { register, login, token };
