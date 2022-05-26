const userModel = require("../Models/userModel")
const aws = require("../middleware/aws")
const bcrypt = require('bcrypt')

let isValid = function (value){
    if(typeof value === "undefined" || value === null) return false
    if(typeof value === "String" && value.trim().length === 0) return false
    return true
}
//POST /register



const registerUser = async function(req, res){
    try {
        let data = req.body
        // console.log(data)
        let files = req.files
        if(!data){
            return res.status(400).send({status:false, message:"Data is Missing"})
        }
        if (Object.keys(data).length===0) {
            return res.status(400).send({status:false,message:'no data provided'})
        }
        // console.log(data)
        let {fname , lname , email , phone , password,address }= data
        if(!fname) {
            return res.status(400).send({status:false, message:"First Name is Missing"})
        }
        if(!lname) {
            return res.status(400).send({status:false, message:"last name is Missing"})
        }
        if(!email){
            return res.status(400).send({status:false, message:"email is missing"})
        }
        
        if(!phone){
            return res.status(400).send({status:false, message:"Phone No. is missing"})
        }
        if(!password){
            return res.status(400).send({status:false, message:"password is Missing"})
        }
        
    
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, data: "plz enter a valid Email" });
            }
        if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) {
            return res.status(400).send({ status: false, message: "Plz enter valid phone no." });
            }
        if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) {
            return res.status(400).send({ status: false, message: "Plz enter valid Password, min 8 and max 15 " });
            }
            let checkUniqueEmail = await userModel.findOne( {email: email}  );
        if (checkUniqueEmail) {

                return res.status(400).send({status:false, message:"Email Id already exists"})
                }

            let checkUniquephone = await userModel.findOne({phone:phone})
            if(checkUniquephone){
            return res.status(400).send({status:false, message: "Phone No.already exists"})
            }
            
         //this function will uplode file.
        if(files && files.length>0){
        let uploadedFileURL = await aws.uploadFile(files[0])
        data.profileImage = uploadedFileURL
        }else{
        res.status(400).send({msg:"No file found"})
        }
         
      if(!email){
          return res.status(400).send({status:false, message:"email is required"})
      }
      if(!password)
      {
        return res.status(400).send({status:false, message: "phone is a required field"})
      }
      //generate salt to hash password
        //const salt = await bcrypt.genSalt(10)
        let salt =await bcrypt.genSalt(10)
        data.password= await bcrypt.hash(data.password,salt);

        // // if (!data.address) {
        // //     return res.status(400).send({ status: false, msg: " address is required" })
        // }
        if (address) 
        {
            let addressValidation = data.address
        
        
        if (!addressValidation.shipping.street) {
            return res.status(400).send({ status: false, msg: "street is a required field in shipping address" })
        }

        if (!addressValidation.shipping.city) {
            return res.status(400).send({ status: false, msg: "city is a required field in shipping address" })
        }

        if (!addressValidation.shipping.pincode) {
            return res.status(400).send({ status: false, msg: "pincode is a required field in shipping address" })
        }

        if (!addressValidation.billing.street) {
            return res.status(400).send({ status: false, msg: "street is a required field in billing address" })
        }

        if (!addressValidation.billing.city) {
            return res.status(400).send({ status: false, msg: "city is a required field in billing address" })
        }

        if (!addressValidation.billing.pincode) {
            return res.status(400).send({ status: false, msg: "pincode is a required field in billing address" })
        }
    

    let userCreated = await userModel.create(data);
     res.status(201).send({status: true, message: "User created successfully", data: userCreated,
    });
}
   
    } catch (err) {
        res.status(500).send({ status: false, data: err.message });
    }
}


module.exports.registerUser=registerUser