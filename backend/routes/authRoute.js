const express = require("express");
const router = express.Router();

const { register, login, updateProfile } = require("../controllers/authcontroller");
const protect = require("../middleware/protect");

router.post("/register", register);
router.post("/login", login);
router.put("/profile", protect, updateProfile);
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;