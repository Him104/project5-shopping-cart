
  const jwt= require("jsonwebtoken")
  
  
  const authentication = async function(req, res, next){
      try{

    let token = req.headers["authorization"];
        //    console.log(token);
          if(!token){
              return res.status(400).send({status:false, msg: "login is required, token is required"})
          }
          const bearer= token.split(" ")[1];
        
          console.log(bearer)

          const decodedtoken =jwt.verify(bearer, "uranium")
        //   req.userIdToken =   decodedtoken._id
          console.log(decodedtoken)
          if(!decodedtoken){
              return res.status(400).send({status:false, msg: "token is invalid"})
          }
  
          next();
      }
      catch(error){
          return res.status(500).send({status:false,msg: error.message})
      }
  }
  module.exports.authentication=authentication