const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  buisnessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Buisness",
    required: true,
  },
  shavedCount: {
    type: Number,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
