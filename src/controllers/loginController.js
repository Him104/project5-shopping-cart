const jwt = require('jsonwebtoken')
const userModel = require('../Models/userModel')
const bcrypt = require('bcrypt')



const loginUser = async function (req,res){
 try {
    const data = req.body
    if (Object.keys(data) == 0)
             return res.status(400).send({ status: false, message: "Bad Request, No data provided" })

             if(!data.email)
             {
              return  res.status(400).send({status:false, message:"Username is required to login"})
             }

             if(!data.password)
             {
                res.status(400).send({status:false, message:"password is required to login"})
             }

             let userName = data.email;
             let password = data.password;

             let findUser = await userModel.findOne({email:userName})

             if(!findUser)
             {
                return res.status(400).send({status:false,message:"username is invalid"})
             }
             bcrypt.compare(password,findUser.password, function(err, result){
                if(result){
                let token = jwt.sign({
                    userId: findUser._id,
                    iat: Math.floor(Date.now() / 1000),
                    expiresIn:"2hr"
                },"uranium");
                const userData = {
                    userId:findUser._id,
                    token:token
                }
                res.status(201).send({status: true, message: "user login successful", data: userData })
             }
             })
           
 } catch(error){
return res.status(500).send({status:false, message: error.message})
    
 }   
}

module.exports.loginUser = loginUser;