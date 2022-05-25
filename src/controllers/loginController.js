const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

const loginUser = async function (req,res) {
    try{
        if(!Object.keys(req.body).length===0)
        return res.status(400).send({status:false, msg:"Please enter mail and password"});
    let userName = req.body.email;
    let password = req.body.password;
    //username validation
    if(!userName || userName ===undefined) {
        return res.status(400) .send({status:false, msg :"Please enter email"});
    }
    //password validation
    if(!password || password ===undefined) {
        return res.status(400) .send({status:false, msg :"Please enter password"});
    }
    userName = userName.trim().toLowerCase();
    password = password.trim();
    let user = await userModel.findOne({email:userName , password:password});
    if(!user) 
    return res.status(404).send({status: false, msg: "Please enter a valid email address and password"})
    
    //creating token
    let token = jwt.sign(
        {
            userId:user._id.toString(),
            group:"32",
            project:5,
        },
        "Project-5-group-32",  { expiresIn: "3600s" }
    );
    //set this token in response in header and also in body
    return res.status(200).send({status:true, data:{userId:user._id,token:token}});
    } catch(err) {
        console.log(err.message);
        return res.status(500).send({status:"error", msg:err.message});
    }
};

module.exports.loginUser = loginUser;