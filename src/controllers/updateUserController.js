const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken")
const aws = require("../middleware/aws")
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')


const updateUser = async function (req,res){
    try {
        let userId = req.params.userId
    
        let data = req.body
    
        

        let {fname, lname, email, password, phone, address} = data
      
       if(!isValidObjectId(userId))
return res.status(400).send({status:false, message:"objectid is not valid"})

        if(Object.keys(data)==0)
            return res.status(400).send({ status: false, message: "Enter data to update" }) 
        
        let findingUser = await userModel.findById(userId)
        if(!findingUser)
        
            return res.status(400).send({status:false, message: "couldn't find userId"})
    if(fname)
                if (!fname)
                    return res.status(400).send({ status: false, message: "Please provide first name" })
    if(lname)
                if (!lname)
                    return res.status(400).send({ status: false, message: "Please provide last name" })
    if(email)
                    if (!email)
                    return res.status(400).send({ status: false, message: "Please provide email" })
    if(password)
                    if (!password)
                    return res.status(400).send({ status: false, message: "Please provide password" })
    if(phone)
                    if (!phone)
                    return res.status(400).send({ status: false, message: "Please provide phone number" })
    
                    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                        return res.status(400).send({ status: false, data: "plz enter a valid Email" });
                        }
                    if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) {
                        return res.status(400).send({ status: false, message: "Plz enter valid phone no." });
                        }
                    if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) {
                        return res.status(400).send({ status: false, message: "Plz enter valid Password, min 8 and max 15 " });
                        }
    
            
            const phoneDuplicate = await userModel.findOne({phone:data.phone})
            if(phoneDuplicate)
    
            return res.status(400).send({status:false,message:"phone can not be duplicate"})
    
            const emailDuplicate = await userModel.findOne({email:data.email})
            if(emailDuplicate)
    
            return res.status(400).send({status:false,message:"email can not be duplicate"})
    
            if (address) 
            {
                let shipAddress = data.address
    
                if (!shipAddress.shipping.street)
                    return res.status(400).send({ status: false, message: "shipping street field is required or not valid" })
    
                if (!shipAddress.shipping.city)
                    return res.status(400).send({ status: false, message: "shipping city field is required or not valid" })
    
                if (!shipAddress.shipping.pincode)
                    return res.status(400).send({ status: false, message: "shipping pincode field is required or not valid" })
    
                if (!shipAddress.billing.street)
    
                    return res.status(400).send({ status: false, message: "billing street field is required or not valid" })
    
                if (!shipAddress.billing.city)
                    return res.status(400).send({ status: false, message: "billing city field is required or not valid" })
    
                if (!shipAddress.billing.pincode)
                    return res.status(400).send({ status: false, message: "billing pincode field is required" })
    
                    const updateAddress = await userModel.findOneAndUpdate({_id:userId},
                        { $set: { address:address
                        } })
                      
                        console.log(address);
    
                    }
    
                    // let files = req.files
                    // if(files){
                    //     if(files && files.length>0){
                    //         let uploadFile = await aws.uploadFile(files[0])
                    //     }
                    // }
    
        const updateUser = await userModel.findOneAndUpdate({_id:userId},
        { $set: {fname: data.fname, lname : data.lname,email: data.email, phone: data.phone
        } },
        { new: true })
    
        return res.status(201).send({status:true, message: "User profile updated", data: updateUser})
        
    } catch (error) {
    
        return res.status(500).send({status:false, message:error.message})
        
    }
    }
    
    module.exports.updateUser = updateUser;