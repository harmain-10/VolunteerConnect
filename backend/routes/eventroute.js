const express=require("express");
const router=express.Router();

const protect=require("../middleware/protect");
const authorize=require("../middleware/authorize");
const {createevent,getmyevent,getallevent, getsingleevent,updateevent,deleteevent}=require("../controllers/eventcontroller");
const checkorganizationapproval = require("../middleware/checkorganizationapproval");

router.post(
	"/",
	protect,
	authorize("organization"),
	checkorganizationapproval,
	createevent
);

// organization-specific events
router.get("/my-events", protect, authorize("organization"), getmyevent);

// public / volunteer listing
router.get("/", getallevent);
router.get("/:id", getsingleevent);
router.put("/:id", protect, authorize("organization"), checkorganizationapproval, updateevent);
router.delete("/:id", protect, authorize("organization"), checkorganizationapproval, deleteevent);
   
module.exports = router;