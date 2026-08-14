const express=require("express");
const authorize=(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:"access denied"
            })
        }
        next();
    };
};
module.exports=authorize