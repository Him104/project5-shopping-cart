const jwt = require("jsonwebtoken");
const UserModel = require("../Models/userModel");


const authToken = (token) => {
    let tokenValidate = jwt.verify(token, "Project-5-group-32", (err, data) => {
        if (err)
            return null;
        else {
            return data;
        }
    });
    return tokenValidate;
};

const validateToken = async function (req, res, next) {
    try {
        let token = req.headers["x-Api-Key"] || req.headers["x-api-key"];
        if (!token) {
            return res.status(401).send({ status: false, msg: "token must be prsent" });
        }
        let decodedToken = authToken(token);
        if (!decodedToken) {
            return res.status(401).send({ status: false, msg: "Invalid token" });
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


//Authentication................................................................

const authentication = function (req, res, next) {
    try {
        const token = req.headers["authorization"]
        if (!token) {
            return res.status(400).send({ status: false, message: "token must be present" });
        }
        const bearer = token.split(' ')
        const bearerToken = bearer[1]
        const decodedToken = jwt.verify(bearerToken, "projectfiveshoppingkart");

        if (!decodedToken) {
            return res.status(400).send({ status: false, message: "token is invalid" });
        }
        //req.decodedToken=decodedToken
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ msg: err.message })
    }

}


//Authorization.....................................................................

let authorisation = async function (req, res, next) {

    try {
        let token = req.headers["authorization"]
        if (!token) { return res.status(400).send({ status: false, message: "token must be present" }) }

        const bearer = token.split(' ')
        const bearerToken = bearer[1]
        const decodedToken = jwt.verify(bearerToken, "projectfiveshoppingkart");

        if (!decodedToken) {
            return res.status(400).send({ status: false, message: "token is invalid" });
        }

        let decodedUserId = decodedToken.userId
        let userIdParams = req.params.userId

        let userDetailsId = await UserModel.findById({ _id: userIdParams })
        if (!userDetailsId) {
            return res.status(401).send({ status: false, msg: "no data found with this Id" });
        }

        let checkUserId = userDetailsId._id

        if (decodedUserId != checkUserId) { return res.status(403).send({ status: false, message: "You are not an authorized person to make these changes" }) }
        next()
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}


module.exports.authentication = authentication
module.exports.authorisation = authorisation
module.exports.validateToken = validateToken;

