const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = mongoose.Schema({
    email : {type : String , require:true, unique:true},
    password : {type: String, require:true},
    role : {type:String , require:true, default:"User", enum : ["User","Moderator"]}
})

const UserModel = mongoose.model("user", userSchema);

module.exports = {
    UserModel
}