const express=require ("express");
const cors=require("cors");
const authRoute=require("./routes/authRoute")
const adminroute=require("./routes/adminroute")
const eventroute=require("./routes/eventroute")
const applicationroute=require("./routes/applicationroute")

const app=express();
console.log("App loaded");
//middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoute)
app.use("/api/admin",adminroute);
app.use("/api/events", eventroute);
app.use("/api/application",applicationroute)

module.exports=app;

