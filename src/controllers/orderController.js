const userModel = require("../Models/userModel")
const productModel = require("../Models/productModel")
const cartModel = require("../Models/cartModel")
const orderModel = require("../Models/orderModel")
const mongoose = require('mongoose');
const { isValidObjectId,isValidReqBody, quantityRange, isValidStatus} = require("../Middleware/validation")
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

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body

        const { orderId, status } = requestBody

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })
        if (!await userModel.findById({ _id: userId })) return res.status(404).send({ status: false, message: "user not found" })

        if (!orderId) return res.status(400).send({ status: false, message: "Provide orderId " })
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "invalid order Id.." })

        const searchOrder = await orderModel.findById({ _id: orderId })
        if (!searchOrder) return res.status(404).send({ status: false, message: "order not found" })
        if (searchOrder.userId != userId) return res.status(400).send({ status: false, message: "the order does not belongs to this user" })

        // if (!status) return res.status(400).send({ status: false, message: "Provide Order Status" })
        // if (status !="pending","completed","cancelled") 
        // return res.status(400).send({ status: false, message: "status should be among 'pending','completed' and 'cancelled' only" })


        if (status == 'cancelled' && searchOrder.cancellable !== true) return res.status(400).send({ status: false, message: "You can not cancel the order" })

        const orderUpdated = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        return res.status(200).send({ status: true, message: "Order status updated successfully", data: orderUpdated })


    }

    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.createOrder=createOrder;
module.exports.updateOrder=updateOrder;