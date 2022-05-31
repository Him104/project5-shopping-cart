const express = require('express');
const router = express.Router();


const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
//const middleWare = require("../middleWare/auth")
const productController = require("../controllers/productController")




router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", userController.getData)
router.put("/user/:userId/profile", userController.updateProfile)


router.post("/products",productController.createProduct)
router.get("/products/:productId", productController.getProductId)
router.put("//products/:productId", productController.updateProduct)
router.delete("/products/:productId", productController.deleteProductId)

router.post("/users/:userId/cart",cartController.createCart)


module.exports = router;
