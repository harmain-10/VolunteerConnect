const express=require("express");
const router=express.Router();

const protect=require("../middleware/protect");
const authorize=require("../middleware/authorize");

const {
  getpendingorganization,
  approveorganization,
  rejectorganization,
  getadminstats,
  getallorganizations,
  getallvolunteers,
} = require("../controllers/admincontroller");

router.get(
  "/pendingorganizations",
  protect,
  authorize("admin"),
  getpendingorganization
);

router.get(
  "/stats",
  protect,
  authorize("admin"),
  getadminstats
);

router.get(
  "/organizations",
  protect,
  authorize("admin"),
  getallorganizations
);

router.get(
  "/volunteers",
  protect,
  authorize("admin"),
  getallvolunteers
);

router.put(
  "/approve/:id",
  protect,
  authorize("admin"),
  approveorganization
);

router.put(
  "/reject/:id",
  protect,
  authorize("admin"),
  rejectorganization
);

module.exports = router;