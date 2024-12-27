const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const database = require("./config/database");
const admin = require("./routes/admin");
const buisness = require("./routes/buisness");
const user = require("./routes/user");
const http = require("http");
const socketHelper = require("./socketHelper");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketHelper.init(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

database();

app.use("/admin", admin);
app.use("/buisness", buisness);
app.use("/user", user);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log("server is running", PORT);
});
