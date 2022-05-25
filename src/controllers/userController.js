const userModel = require("../Models/userModel")
const aws = require("../Middleware/aws")
const bcrypt = require('bcryptjs')
const {isValid} = require("../Middleware/validation")  // as a object{isvalid}

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
        let {fname , lname , email , phone , password, }= req.body
        if(!fname) {
            return res.status(400).send({status:false, message:"Frist Name is Missing"})
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
         if(!isValid(data.address)){
             return res.status(400).send({status:false, message:"address should be object"})
         }
         data.address = JSON.parse(data.address)
         //console.log(address.shipping)
         if(!isValid(data.address.shipping)){
            return res.status(400).send({status:false, message:"shipping should be object"})
        }
        
        //let shipping = address.shipping
        if(!data.address.shipping.street){
            return res.status(400).send({status:false, message:"street Is Missing"})
        }
        if(!data.address.shipping.city){
                return res.status(400).send({status:false, message:"City Is Missing"})
        }
        if(!data.address.shipping.pincode){
                return res.status(400).send({status:false, message:"Pincode is Missing"})
        }
        if(!isValid(data.address.billing)){
            return res.status(400).send({status:false, message:"billing address should be object"})
        }
       //let billing = address.billing
        if(!data.address.billing.street){
            return res.status(400).send({status:false, message:"Billing Street is Missing"})
        }
        if(!data.address.billing.city){
            return res.status(400).send({status:false, message:"Billing City is Missing"})
        }
        if(!data.address.billing.pincode){
            return res.status(400).send({status:false, message:"Billing Pincode is Missing"})
        }
    
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res
              .status(400)
              .send({ status: false, data: "plz enter a valid Email" });
            }
        if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) {
            return res
              .status(400)
              .send({ status: false, message: "Plz enter valid phone no." });
            }
        if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) {
            return res
              .status(400)
              .send({ status: false, message: "Plz enter valid Password, min 8 and mix 15 " });
            }
        let checkUniqueData = await userModel.findOne({$or:[{phone: phone}, {email: email}]  });
            if (checkUniqueData) {
            if(checkUniqueData.phone == data.phone){
            return res.status(400).send({status:false, message: "Phone No.already exists"})
            }
            if(checkUniqueData.email == data.email){
            return res.status(400).send({status:false, message:"Email Id already exists"})
            }
        }
         //this function will uplode file.
        if(files && files.length>0){
        let uploadedFileURL = await aws.uploadFile(files[0])
        data.profileImage = uploadedFileURL
        }else{
        res.status(400).send({msg:"No file found"})
        }
         
      if(!(data.email && data.password)){
          return res.status(400).send({status:false, message:"Data not formatted properly"})
      }
      //generate salt to hash password
        //const salt = await bcrypt.genSalt(10)
        let enPassword =await bcrypt.hash(password,10)
        data.password=enPassword

    let newUser = await userModel.create(data);
     res.status(201).send({
      status: true,
      message: "New User created successfully",
      data: newUser,
    });
   
    } catch (err) {
        res.status(500).send({ status: false, data: err.message });
    }
}
module.exports.registerUser=registerUser
