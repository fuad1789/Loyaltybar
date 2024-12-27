const express = require("express");
const { register, login ,token} = require("../controllers/admin");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/token", token);

module.exports = router