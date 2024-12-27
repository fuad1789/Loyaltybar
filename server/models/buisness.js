const mongoose = require("mongoose");

const BuisnessSchema = new mongoose.Schema(
  {
    buisnessName: {
      type: String,
      required: true,
      trim: true,
    },
    buisnessNumber: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    block: {
      type: Boolean,
      required: true,
    },
  },
  
);

module.exports = mongoose.model("Buisness", BuisnessSchema);
