const express = require("express");
const userRoute = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const {UserModel} = require("../model/user.model");
const {BlacklistModel} = require("../model/blacklist.model");
const {BlogModel} = require("../model/blog.model");
const {auth} = require("../middleware/auth")
const {authorise} = require("../middleware/authorise")


userRoute.post("/signup",async(req,res) =>{
    try {
        const {email, password, role} = req.body;

        const isUserPresent = await UserModel.findOne({email});
        if(isUserPresent){
            return res.status(400).send({msg:"User already present, Please login"})
        }

        const hashPassword = bcrypt.hashSync(password , 4);
        const newuser = new UserModel({...req.body, password:hashPassword});
        await newuser.save();
        res.status(200).send({msg:"Signup seccessful", newUser:newuser})
    } catch (error) {
        res.status(400).send({msg:"Something went wrong", error:error.message})
    }
})

userRoute.post("/login",async(req,res) =>{
    try {
        const {email, password} = req.body;

        const isUserPresent = await UserModel.findOne({email});
        if(!isUserPresent){
            return res.status(400).send({msg:"Please signUp"});
        }

        const isPasswordCorrect = bcrypt.compareSync(password, isUserPresent.password)
        if(!isPasswordCorrect){
            return res.status(400).send({msg:"Wrong Credential"})
        }

        const accessToken = jwt.sign({userid:isUserPresent._id,email, role:isUserPresent.role},process.env.JWT_SECRET_TOKEN,{expiresIn:"1m"})

        const refreshToken = jwt.sign({userid:isUserPresent._id,email, role:isUserPresent.role},process.env.REFRESH_TOKEN,{expiresIn:"3m"})
        res.cookie("accessToken", accessToken, {maxAge:1000*60})
        res.cookie("refreshToken", refreshToken, {maxAge:1000*60*3})
        res.status(200).send({msg:"Login Seccessfull"})
    } catch (error) {
        res.status(400).send({msg:"Something went wrong", error:error.message})
    }
})

userRoute.get("/logout",auth,async(req,res) =>{
    try {
        const {accessToken,refreshToken} = req.cookies
        const blacklistAccesstoken = new BlacklistModel(accessToken)
        const blacklistRefreshtoken = new BlacklistModel(refreshToken)
        await blacklistAccesstoken.save()
        await blacklistRefreshtoken.save()
        res.status(200).send({msg:"Logout Seccessfull"})
    } catch (error) {
        res.status(400).send({msg:"Something went wrong", error:error.message})
    }
})

userRoute.post("/auth/refresh-token",auth,authorise(["User"]),async(req,res) =>{
    try {
        const {accessToken} = req.cookies || req.headers?.authorization

        const isTokenBlacklisted = await BlacklistModel.findOne({token:accessToken});
        if(isTokenBlacklisted){
            return res.send({msg: "Please Login"}); 
        }
        const isTokenValid = jwt.verify(accessToken,JWT_SECRET_TOKEN)
        if(!isTokenValid){
           return res.send({"msg":"Login first"});
        }

        const newAccessToken = jwt.sign({userid:isUserPresent._id,email, role:isUserPresent.role},process.env.JWT_SECRET_TOKEN,{expiresIn:"1m"})
        res.cookie("accessToken", newAccessToken, {maxAge:1000*60})
        res.status(200).send({msg:"New access token has been generated"})
    } catch (error) {
        res.status(400).send({msg:"Something went wrong", error:error.message})
    }
})


userRoute.get("/all-blogs",auth,authorise(["User"]),async(req,res)=>{
 try {
    const bolgs = await BlogModel.find()
    res.send({msg:"Your all Blogs", Blogs:bolgs})
 } catch (error) {
    res.send(error.message + "...........")
 }
})


userRoute.patch("/update/:id",auth,authorise(["User"]),async(req,res)=>{
   const {id} = req.params

   const blog = await BlogModel.findByIdAndUpdate({_id:id})
   res.send({msg:"Blog Has been Updated"})
})



userRoute.post("/add",auth,async(req,res)=>{
    try {
        
        const newblog = new BlogModel(req.body)
        await newblog.save();
        res.status(200).send({msg:"New blog created", Blog:newblog})
    } catch (error) {
        res.status(400).send({msg:"Something went wrong", error:error.message})
    }
})
userRoute.delete("/delete/:id",auth,authorise(["User"]),async(req,res)=>{
    const {id} = req.params
   const blog = await BlogModel.findByIdAndDelete({_id:id})
   res.send({msg:"Blog Has been deleted User"})
})
userRoute.delete("/delete-mod/:id",auth,authorise(["Moderator"]),async(req,res)=>{
    const {id} = req.params

   const blog = await BlogModel.findByIdAndDelete({_id:id})
   res.send({msg:"Blog Has been deleted By Moderator"})
})


module.exports = {
    userRoute
}