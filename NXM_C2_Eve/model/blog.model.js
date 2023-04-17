const mongoose = require("mongoose");
require("dotenv").config();

const blogSchema = mongoose.Schema({
   title: {type:String, require:true},
   sub: {type:String, require:true},
   userid : String
})

const BlogModel = mongoose.model("blog", blogSchema);

module.exports = {
    BlogModel
}