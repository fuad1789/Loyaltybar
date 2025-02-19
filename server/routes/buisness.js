const express = require("express");
const {
  getAllBuisness,
  addNewBuisness,
  blockBuisness,
  deleteBuisness,
  adminLogin,
  updateUserShavedCount,
  getBuisnessById,
} = require("../controllers/buisness");
const router = express.Router();

router.get("/getall", getAllBuisness);
router.post("/addnew", addNewBuisness);
router.post("/block", blockBuisness);
router.delete("/delete", deleteBuisness);
router.post("/adminLogin", adminLogin);
router.post("/updateUserShavedCount", updateUserShavedCount);
router.get("/:id", getBuisnessById);

module.exports = router;
