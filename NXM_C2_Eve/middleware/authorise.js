

const authorise =  (roles)=>{
    return async(req,res,next)=>{
        const user_role = req.role
        if(roles.includes(user_role)){
            next()
        }else{
            res.status(400).send({"msg":"Unauthorise"})
        }
    }
}

module.exports = {
    authorise
}