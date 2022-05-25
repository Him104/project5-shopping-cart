const jwt = require("jsonwebtoken");

const authToken = (token) =>{
    let tokenValidate = jwt.verify(token, "Project-5-group-32", (err, data) => {
        if(err)
        return null;
        else {
            return data;
        }
    });
    return tokenValidate;
};

const validateToken = async function(req, res, next) {
    try{
        let token = req.headers["x-Api-Key"] || req.headers["x-api-key"];
        if(!token) {
            return res.status(401).send({status: false, msg:"token must be prsent"});
        }
        let decodedToken = authToken(token);
        if(!decodedToken) {
            return res.status(401).send({status: false, msg:"Invalid token"});
        }
        console.log(decodedToken);

        req["userId"] = decodedToken.userId;
        console.log(req["userId"])
        next();
        }
        catch (erre) {
            return res.status(500).send({ status: "Error", error: erre.message });
          }
        };

 module.exports.validateToken = validateToken;       
    
