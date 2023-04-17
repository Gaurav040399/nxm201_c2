const express = require("express");
const { connection } = require("./database/db");
const cookieParser = require("cookie-parser")
require("dotenv").config();
const {auth} = require("./middleware/auth")
const {userRoute} = require("./route/user.route")


const app = express();
app.use(express.json());
app.use(cookieParser())
// app.use(auth)

app.use("/",userRoute)

app.listen(process.env.PORT,async(req,res)=>{
    try {
        await connection
        console.log("connected to DB")
    } catch (error) {
        console.log("Cannot connect to DB")
        console.log(error.message)
    }
})