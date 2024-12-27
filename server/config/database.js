const mongoose = require("mongoose");

const database = () => {
  try {
    mongoose
      .connect(process.env.MONGOOSE_URL)
      .then(() => {
        console.log("db is connected");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = database;
