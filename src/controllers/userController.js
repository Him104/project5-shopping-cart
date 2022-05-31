const mongoose = require("mongoose");
const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken");
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
        // ==validation Email
        if(!isValid(email)) {
            return res.status(400).send({status:false, message:"email is missing"})
        }
        if(isValidEmail(email)){
            return res.status(400).send({status:false, message:"please enter the valid email"})
        }
        let checkUniqueemail = await userModel.findOne({email:email})
        if(checkUniqueemail) 
        return res.status(400).send({status:false, message:"email id is already exit"})
        if(!isValid(phone)){
            return res.status(400).send({status:false, message:"Phone No. is missing"})
        }
        if(!isValidMobile(phone)){
            return res.status(400).send({status:false, message:"please enter the valid Phone No."})
        }
        let checkUniquePhone = await userModel.findOne({phone:phone})
        if(checkUniquePhone) {
            return res.status(400).send({status:false, message:"phone no is already exit"})
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

/*******Login ******/

const loginUser = async function (req,res) {
    try{
        if(!Object.keys(req.body).length===0)
        return res.status(400).send({status:false, msg:"Please enter mail and password"});
    // let userName = req.body.email;
    // let password = req.body.password;

    let data = req.body;
    //username validation
    if(!data.email || data.email ===undefined) {
        return res.status(400) .send({status:false, msg :"Please enter email"});
    }
    //password validation
    if(!data.password || data.password ===undefined) {
        return res.status(400) .send({status:false, msg :"Please enter password"});
    }
    userName = data.email.trim().toLowerCase();
    password = data.password.trim();
    let user = await userModel.findOne({email:userName});
    if(!user) 
    return res.status(404).send({status: false, msg: "Please enter a valid email address"})
    
    //creating token
    // const myEncryptPassword = await Encrypt.cryptPassword(password);
    // console.log(myEncryptPassword)
    bcrypt.compare(password, user.password, function (err, result) {
    if(result) {
    let token = jwt.sign(
        {
            userId:user._id.toString(),
            group:"32",
            project:5,
        },
        "Project-5-group-32",  { expiresIn: "3600s" }
    );
    //set this token in response in header and also in body
    res.setHeader("x-api-key", token)
    return res.status(200).send({status:true, data:{userId:user._id,token:token}});
}
else if(err) return res.status(201).send({ status: true, message: "Please provide correct password" })
})
    
 } catch(err) {
        console.log(err.message);
        return res.status(500).send({status:"error", msg:err.message});
    }
};



//*******/ getData /*******//

const getData = async function (req,res) {
    try {
        if (req.params.userId == undefined)
            return res.status(400).send({ status: false, message: "userId is required." });
        let userId = req.params.userId

        if (userId) {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).send({ status: false, msg: "userId is not a type of objectId" })
            }
        }
        let check = await userModel.findOne({ _id: userId }).select()
        if (!check) {
            return res.status(400).send({ status: false, msg: "please valid userId" })
        }
        if (check.length === 0) {
            return res.status(404).send({ status: false, msg: "user not found" })
        }

        const user = await userModel.findById(userId).select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1, createdAt: 1, updatedAt: 1 })

        
        return res.status(200).send({ status: true, message: "User Details", data: user })

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: "error", error: err.message })
    }
}

//updareDetails
const updateProfile = async function (req, res) {
    try {
      let userId = req.params.userId;
      let files = req.files;
      if(!isValidObjectId(userId))return res.status(400).send({  status: false, message: "Please Provide valid userId"})
      let data = req.body;
      
     
  
      let userProfile = await userModel.findById(userId);
      if(!userProfile){return res.status(404).send("user not found!")}
  
  
      if (data.isDeleted === true) {
        return res
          .status(400)
          .send({ status: false, message: "User already deleted" });
      }
      let { fname, lname, email, phone, password, address, } = data
        if (fname ||lname) {
          if (!/^([a-zA-Z ]+)$/.test(fname || lname)) {
            return res
              .status(400)
              .send({
                Status: false,
                message: " Firstname and lastname is not valid format",
              });
          }
        }
        if (email) {
          if (
            !/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)
          ) {
            return res
              .status(400)
              .send({ status: false, data: "plz enter a valid Email" });
          }
        }
        if (files.profileImage) {
          if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            data.profileImage = uploadedFileURL;
          } else {
            res.status(400).send({ msg: "No file found" });
          }
        }
        if (phone) {
          if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) {
            return res
              .status(400)
              .send({ status: false, message: "Plz enter valid phone no." });
          }
        }
        if (password) {
          if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) {
            return res
              .status(400)
              .send({
                status: false,
                message: "Plz enter valid Password, min 8 and mix 15 ",
              });
          }
        }
        let checkUniqueData = await userModel.findOne({
          $or: [{ phone: phone }, { email: email }],
        });
        if (checkUniqueData) {
          if (checkUniqueData.phone == phone) {
            return res
              .status(400)
              .send({ status: false, message: "Phone No.already exists" });
          }
          if (checkUniqueData.email == email) {
            return res
              .status(400)
              .send({ status: false, message: "Email Id already exists" });
          }
        }
        if (password) {
          let enPassword = await bcrypt.hash(password, 10);
           data.password = enPassword;
        }
    
      if(address) {
        
        if (!isValid(data.address)) return res.status(400).send({ status: false, message: "Address should be in object and must contain shipping and billing addresses" });
  
        //JSON.parse(JSON.stringify(userProfile.address))
        address = JSON.parse(address)
        
        let tempAddress = userProfile.address
  
        if(address.shipping) {
          
          if (!isValid(address.shipping)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });
  
          if(address.shipping.street){
            if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "Street of shipping address should be valid and not an empty string" });
  
            tempAddress.shipping.street =address.shipping.street 
          }
  
          
          if (address.shipping.city) {
            if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "City of shipping address should be valid and not an empty string" });
  
            tempAddress.shipping.city = address.shipping.city
          }
  
          
          if (address.shipping.pincode) {
            if (!isValid(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode of shipping address and should not be an empty string" });
  
            if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode should be in numbers" });
  
           
  
            tempAddress.shipping.pincode =address.shipping.pincode;
          }
        }
  
        if(address.billing) {
        
          if (!isValid(address.billing)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });
  
          if(address.billing.street){
            if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "Street of billing address should be valid and not an empty string" });
  
            tempAddress.billing.street = address.billing.street 
          }
  
          
          if (address.billing.city) {
            if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "City of billing address should be valid and not an empty string" });
  
            tempAddress.billing.city = address.billing.city
          }
  
          
          if (address.billing.pincode) {
            if (!isValid(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode of billing address and should not be an empty string" });
  
            if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be in numbers" });
  
           
            tempAddress.billing.pincode = address.billing.pincode;
          }
        }
  
      data.address = tempAddress;
      }
      
      let updateUser = await userModel.findOneAndUpdate(
        {_id: userId},
        data,
        {new: true}
      )
      res.status(201).send({ status: true, message: "User profile updated", data: updateUser });
     
    } catch (err) {
      res.status(500).send({ status: false, error: err.message })
    }
  }


module.exports.registerUser=registerUser
module.exports.loginUser = loginUser;
module.exports.getData = getData
module.exports.updateProfile=updateProfile
