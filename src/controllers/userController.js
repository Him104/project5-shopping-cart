const userModel = require("../Models/userModel")

const updateUser = async function (req,res){
try {
    let userId = req.params.userId

    let updateDetails = {};
    let data = req.body
  
   
    if(Object.keys(data)==0)
        return res.status(400).send({ status: false, message: "Enter data to update" }) 
       
       
    
    let findingUser = await userModel.findById(userId)
    if(!findingUser)
    
        return res.status(400).send({status:false, message: "couldn't find userId"})
    
        const phoneDuplicate = await userModel.findOne({phone:data.phone})
        if(phoneDuplicate)

        return res.status(400).send({status:false,message:"phone can not be duplicate"})

    const updateUser = await userModel.findOneAndUpdate({_id:userId},
    { $set: { fname: data.fname, lname : data.lname,email: data.email,profileImage: data.profileImage, phone: data.phone, password: data.password, address:data.address, billing:address.billing } },
    { new: true })

    return res.status(201).send({status:true, message: "User profile updated", data: updateUser})
    
} catch (error) {

    return res.status(500).send({status:false, message:error.message})
    
}
}


module.exports.updateUser = updateUser;