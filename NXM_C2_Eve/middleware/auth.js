const jwt = require("jsonwebtoken");
require("dotenv").config()
const {BlacklistModel} = require("../model/blacklist.model");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const auth = async (req,res,next)=>{
 const {accessToken} = req.cookies
 const isTokenBlacklisted = await BlacklistModel.findOne({token:accessToken});
 if(isTokenBlacklisted){
return res.send({msg: "Please Login"});
 }
 jwt.verify(accessToken,process.env.JWT_SECRET_TOKEN,async(err,decoded)=>{
    if(err){
        if(err.message == "jwt expired"){
            const newAccessToken = await fetch("http://localhost:8080/auth/refresh-token",{
                headers:{
                    "Content-type":"application/json",
                    "Authorization" : req.cookies.accessToken
                },
            }).then((result)=>{
                console.log(result)
                result.json();
            }).catch((err)=>{
                console.log(err)
            });
            res.cookie("accessToken", newAccessToken, {maxAge:1000*60})
            next()
        }
    }else{
        console.log(decoded)
        next()
    }
 })
}

module.exports = {
    auth
}
