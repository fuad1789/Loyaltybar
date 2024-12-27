const express = require("express");
const { LoginUser, getShawedCount } = require("../controllers/user");
const router = express.Router();

router.post("/userLogin", LoginUser);
router.post("/getShawedCount", getShawedCount);

module.exports = router;
