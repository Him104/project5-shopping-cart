const { default: mongoose } = require("mongoose");
const userModel = require("../Models/userModel");

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)}


const getUser = async function (req,res)
{
    try {

        let userId = req.params.userId;

        if (Object.keys(userId).length == 0)
            return res.status(400).send({ status: false, msg: "provide input" }) 

        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false,message:"user id is not valid"})
        }

        const findingUser = await userModel.findById(userId)
        if(!findingUser)
        
          return  res.status(400).send({status:false, message:"couldn't find user"})
        
        return res.status(200).send({status:true,message:findingUser, data: findingUser})
        
    } catch (error) {
        
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports.getUser = getUser;