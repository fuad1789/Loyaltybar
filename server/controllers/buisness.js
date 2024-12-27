const BuisnessSchema = require("../models/buisness");
const UserSchema = require("../models/user");
const AdminSchema = require("../models/admin");
const mongoose = require("mongoose");
const socketHelper = require("../socketHelper");

const addNewBuisness = async (req, res) => {
  try {
    const { buisnessName, buisnessNumber, owner, adminId } = req.body;
    const user = await AdminSchema.findOne({ _id: adminId });
    if (!user) {
      return res.status(500).json({ msg: "Admin diğilsiniz" });
    }
    const newBuisness = new BuisnessSchema({
      buisnessName,
      buisnessNumber,
      owner,
      block: false,
      updatedAt: new Date(),
    });
    await newBuisness.save();
    const users = [];
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setHours(date.getHours() - 5);
      const newUser = new UserSchema({
        userId: `${newBuisness._id}_${i}`,
        buisnessId: newBuisness._id,
        shavedCount: 0,
        updatedAt: date,
      });
      await newUser.save();
      users.push(newUser);
    }
    newBuisness.users = users.map((user) => user._id);
    newBuisness.updatedAt = new Date();
    await newBuisness.save();
    return res.status(201).json({ status: "OK", newBuisness, users });
  } catch (error) {
    console.error("Error adding new business:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

const getAllBuisness = async (req, res) => {
  try {
    const buisnesses = await BuisnessSchema.find({}).populate("users");
    return res.status(200).json(buisnesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

const blockBuisness = async (req, res) => {
  try {
    const { buisnessId } = req.body;
    const buisness = await BuisnessSchema.findById(buisnessId);
    if (!buisness) {
      return res.status(404).json({ msg: "İşletme bulunamadı" });
    }
    buisness.block = !buisness.block;
    await buisness.save();
    return res
      .status(200)
      .json({ status: "OK", message: "İşletme bloke edildi", buisness });
  } catch (error) {
    console.error("Error blocking business:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

const deleteBuisness = async (req, res) => {
  try {
    const { buisnessId } = req.body;
    const buisness = await BuisnessSchema.findById(buisnessId);
    if (!buisness) {
      return res.status(404).json({ msg: "İşletme bulunamadı" });
    }
    await UserSchema.deleteMany({ buisnessId: buisnessId });
    await BuisnessSchema.findByIdAndDelete(buisnessId);
    return res
      .status(200)
      .json({ status: "OK", message: "İşletme ve kullanıcılar silindi" });
  } catch (error) {
    console.error("Error deleting business:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { buisnessId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(buisnessId)) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid buisness ID format" });
    }

    const buisness = await BuisnessSchema.findById(buisnessId);
    if (!buisness) {
      return res.status(404).json({ msg: "İşletme bulunamadı" });
    }
    return res.status(200).json({ status: "OK", buisness });
  } catch (error) {
    console.error("Error logging in:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

const updateUserShavedCount = async (req, res) => {
  try {
    const { userId, currentTime, buisnessId } = req.body;

    const buisness = await BuisnessSchema.findById(buisnessId);
    const user = await UserSchema.findOne({ userId });

    if (!user) {
      return res.status(400).json({ msg: "Kullanıcı bulunamadı" });
    }

    if (buisness.block == true) {
      return res.status(400).json({ msg: "Işletme engellendi" });
    }

    const hoursDifference =
      (new Date(currentTime) - new Date(user.updatedAt)) / (1000 * 60 * 60);

    if (hoursDifference < 0.005) {
      return res.status(400).json({
        msg: "5 saatten daha az bir süre geçtiği için yeni traş eklenemez",
      });
    }

    user.shavedCount = (user.shavedCount + 1) % 10;
    user.updatedAt = new Date(currentTime);

    await user.save();

    // Kullanıcı güncellendikten sonra Socket.IO üzerinden mesaj gönder
    const io = socketHelper.getIo();
    io.emit("qrScanned", userId);

    return res.status(200).json({ status: "OK", user });
  } catch (error) {
    console.error("Error updating shaved count:", error);
    return res
      .status(500)
      .json({ status: "Error", msg: "Internal server error" });
  }
};

module.exports = {
  getAllBuisness,
  addNewBuisness,
  blockBuisness,
  deleteBuisness,
  adminLogin,
  updateUserShavedCount,
};
