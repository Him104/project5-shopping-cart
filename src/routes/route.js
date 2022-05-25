const express = require('express');
const router = express.Router();


const user = require("../controllers/userController")
const loginController = require("../controllers/loginController")
//const middleWare = require("../middleWare/auth")



router.post("/register", user. registerUser)
router.post("/login", loginController.loginUser)




module.exports = router;
