const express = require ('express');
const router = express.Router();
const register = require('../controllers/registerController')
const login = require('../controllers/loginController')
const fetchUserdetails = require('../controllers/getuserController')
const update = require('../controllers/updateUserController'); 
const middleware = require('../middleware/auth');
const productController = require('../controllers/productController')

router.post("/register", register.registerUser)
router.post("/login",login.loginUser)
router.get("/user/:userId/profile", middleware.authentication, fetchUserdetails.getUser)
router.put("/user/:userId/profile", update.updateUser)
router.post("/products",productController.createProduct)
router.get("/products", productController.getSpecificProduct)
router.get("/products/:productId", productController.getproductbyId)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId", productController.deleteProduct)

module.exports = router;