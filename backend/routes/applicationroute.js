const express=require("express")
const router=express.Router();
const {
  applyforevent,
  getmyapplication,
  geteventapplication,
  getorgallapplications,
  acceptapplication,
  rejectapplication,
} = require("../controllers/applicationcontroller");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const checkorganizationapproval = require("../middleware/checkorganizationapproval");

router.post("/:eventid", protect, authorize("volunteer"), applyforevent);
router.get("/myapplications", protect, authorize("volunteer"), getmyapplication);
router.get(
  "/organization/all",
  protect,
  authorize("organization"),
  checkorganizationapproval,
  getorgallapplications
);
router.get("/event/:eventid", protect, authorize("organization"), geteventapplication);
router.put(
  "/:id/accept",
  protect,
  authorize("organization"),
  checkorganizationapproval,
  acceptapplication
);

router.put(
  "/:id/reject",
  protect,
  authorize("organization"),
  checkorganizationapproval,
  rejectapplication
);
module.exports=router;