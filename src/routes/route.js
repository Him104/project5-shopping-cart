const express = require('express');
const router = express.Router();
const user = require("../controllers/userController")
const loginController = require("../controllers/loginController")
const productController = require("../controllers/productController")
//const middleWare = require("../middleWare/auth")



router.post("/register", user. registerUser)
router.post("/login", loginController.loginUser)

// product API's
router.post("/products",productController.createProduct )
router.get("/products", productController.getSpecificProduct)
router.get("/products/:productId", productController.getproductbyId)
router.get("/products/:productId", productController.deleteProduct)

module.exports = router;
