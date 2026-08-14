const mongoose=require("mongoose");
const dotenv=require("dotenv");
const app=require("./app");
const connectDB=require("./config/db");

dotenv.config();
connectDB();


app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT }`);
})
