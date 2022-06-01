const userModel = require("../Models/userModel")
const productModel = require("../Models/productModel")
const cartModel = require("../Models/cartModel")
const orderModel = require("../Models/orderModel")
const mongoose = require('mongoose');
// const {isValidReqBody,isValidNum,ValidFiles,isValid,isValidPincode, isValidObjectId, isValidEmail, isValidMobile, isValidName,isValidPassowrd,isValidPrice,isValidEnum} = require("../util/regex");


//## POST /users/:userId/orders
const createOrder = async function(req, res){
    try {
        const userId = req.params.userId;
        //const data = req.body
        //==validation for user
        if(!userId){
            return res.status(400).send({status:false, message:"Invalid user Id"})
        }
        let ID = mongoose.Types.ObjectId.isValid(userId)
        if(ID==false){
            return res.status(400).send({status:false, message:" user not  found"})
        }
        let user = await userModel.findOne({ _id: userId })
        if(!user){
            return res.status(404).send({status:false, message:"user absent"})
        }
        //==validating data
        //(data){
            //return res.status(400).send({status:false,message:"data not found"})
        //}
        let data = req.body
         let {cancellable,status } = data
        
        const cart = await cartModel.findOne({userId: userId })//.select({
            // items:1, 
            // totalPrice:1,
            // totalItems:1,})
        if(!cart ){
            return res.status(404).send({status:false, message:"cart not found"})
        }
        
        
        // if(!userId ){
        //     return res.status(400).send({status:false, message:""})
        // }
        // if(userIdfromParams !== userId){

        //     return res.status(400).send({status:false, message:""})
        // }
        // if(!cancellable){
        //     return res.status(400).send({status:false, message:"cancellable not found"})
        // }
        // if(!status){
        //     return res.status(400).send({status:false, message:"status is not found"})
        // }
        data.totalQuantity = 0
        //console.log(typeof(totalQuantity))
        cart.items.map(x => {
         data.totalQuantity += x.quantity
        })
        data.userId = userId
        data.items = cart.items,
        data.totalPrice= cart.totalPrice,
        data.totalItems= cart.totalItems;


      const orderCreate = await orderModel.create(data)
      res.status(201).send({status:true, message:"success", data: orderCreate})
    } catch (error) {
         console.log(error)
         res.status(500).send({ status: false, message: error.message });
    }
}
module.exports.createOrder=createOrder