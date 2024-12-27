const UserSchema = require("../models/user");
const BuisnessSchema = require("../models/buisness");

const LoginUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserSchema.findOne({ userId });

    const buisness = await BuisnessSchema.findById(user.buisnessId);

    if (!user) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    if (buisness.block == true) {
      return res.status(404).json({ msg: "Işletme çalışmıyor" });
    }

    return res.status(201).json({ status: "OK", user });
  } catch (error) {
    console.error("Error adding new business:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

const getShawedCount = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserSchema.findOne({ userId });

    const buisness = await BuisnessSchema.findById(user.buisnessId);

    if (!user) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    if (buisness.block == true) {
      return res.status(404).json({ msg: "Işletme çalışmıyor" });
    }

    return res.status(201).json({ status: "OK", shwedCount: user.shavedCount });
  } catch (error) {
    console.error("Error adding new business:", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};

module.exports = { LoginUser, getShawedCount };
