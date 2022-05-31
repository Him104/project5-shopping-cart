const cartModel = require("../Models/cartModel")
const mongoose = require("mongoose");
const userModel = require("../Models/userModel")
const productModel = require("../Models/productModel")
const { isValidObjectId,isValidReqBody, quantityRange} = require("../Middleware/validation")


//********* POST /users/:userId/cart ***********/

    const createCart = async function(req, res) {
        try {
            const userId = req.params.userId
            const data = req.body
            //==check Data
            if(isValidReqBody(data)){
                return res.status(400).send({status:false, message:"Please provied Data"})
            }
            //===check userId
            if(!isValidObjectId(userId)){
                return res.status(400).send({status:false, message:"Plz provied userId"})
            }
            //===destructuring
            let { quantity,  productId } = data
            //==check productId
            // if(!isValidObjectId(productId)){
            //     return res.status(400).send({status:false, message:"plz provied valid productId"})
            // }
            let x = mongoose.Types.ObjectId.isValid(productId)
            if(x==false){
                return res.send({status:false, msg:"product  found"})
            }
            //==check quantity
            // if(!quantityRange(quantity)){
            //     return res.status(400).send({status:false, message:"plz provide valid quantity"})
            // }
            console.log(quantity)
            if(quantity == undefined) {   //set the quantity true 1
               quantity = 1 
            }
            //==finduser
            const user = await userModel.findOne({ _id: userId })
            if(!user){
                return res.status(400).send({status:false, message:"user not found"})
            }
            //==findproduct
            const product = await productModel.find({ _id: productId})
            //console.log(product)
            if(!product){
                return res.status(400).send({status:false, message:"product not found"})
            }
            let findCart = await cartModel.findOne({ userId : userId })
            
            if(findCart == undefined){   //jo humre program m hota nhi hai wo chiz hum dund rhe hai 
            data.items = [{ productId:product[0]._id, quantity: quantity}]
            data.totalPrice = (product[0].price) * quantity
            data.totalItems = quantity
            
            let cartCreate = await cartModel.create(data)
             return res.status(201).send({status:true, message:"Cart Data", data: cartCreate})
            
            }if(Object.keys(findCart).length !== 0 ){
            
                //const checkproduct = await cartModel.find({ productId: productId})
                let price = findCart.totalPrice + (quantity * product[0].price)
                let arr = findCart.items
                //updating quantity.    ///use of for in loop
                for(i in arr){
                    if(arr[i].productId.toString() == productId){
                        arr[i].quantity += quantity
                        //findCart.totalItems += quantity 
                        let updateCart = {items: arr, totalPrice:price, totalItems:arr[i].quantity} 
                        const addcart = await cartModel.findOneAndUpdate({_id:findCart._id},updateCart,{new:true})
                        return res.status(201).send({status:true, message:"CartData", data: addcart})
                    }
                }
            
                arr.push({ productId: productId, quantity: quantity }) //storing the updated prices and quantity to the newly created array.
                let updatedCart = { items: arr, totalPrice:price, totalItems:arr.length }   //object ko define kr re h
                let responseData = await cartModel.findOneAndUpdate({ _id: findCart._id }, updatedCart, { new: true })
                return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
            } 
            
        } catch (error) {
            console.log(error)
            res.status(500).send({status:false, message:error.message})
        }
    }


module.exports.createCart=createCart
//module.exports.updateCart = updateCart