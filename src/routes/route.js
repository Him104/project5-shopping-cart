const express = require ('express');
const router = express.Router();
const register = require('../controllers/registerController')
const login = require('../controllers/loginController')
const fetchUserdetails = require('../controllers/getuserController')
const update = require('../controllers/updateUserController') 

router.post("/register", register.registerUser)
router.post("/login",login.loginUser)
router.get("/user/:userId/profile",fetchUserdetails.getUser)
router.put("/user/:userId/profile", update.updateUser)


module.exports = router;