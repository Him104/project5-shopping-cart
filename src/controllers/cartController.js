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
            console.log(data)
           
            if(isValidReqBody(data)){
                return res.status(400).send({status:false, message:"Please provide Data"})
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

    const updateCart = async function (req, res) {
        try {
            const userId = req.params.userId
            const { cartId, productId, removeProduct } = req.body
            // console.log(removeProduct )
    
            const key = Object.keys(req.body)
    
            if (key == 0) {
                return res.status(400).send({ status: false, msg: "please enter some data" })
            }
    
            if (!isValidObjectId(userId)) {
                return res.status(400).send({ status: false, msg: "userId is invalid" })
            }
    
            if (!isValid(cartId)) {
                return res.status(400).send({ status: false, msg: "cartId is required" })
            }
    
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, msg: "cartId is invalid" })
            }
    
            if (!isValid(productId)) {
                return res.status(400).send({ status: false, msg: "productId is required" })
            }
    
            if (!isValidObjectId(productId)) {
                return res.status(400).send({ status: false, msg: "productId is invalid" })
            }
    
            if (!isValid(removeProduct)) {
                return res.status(400).send({ status: false, msg: "removeProduct is required" })
            }
    
            let cartData = await cartModel.findById(cartId)
            console.log(cartData)
            if (!cartData) { return res.status(404).send({ status: false, msg: "cartData not found !" }) 
        }
       
            
            if (removeProduct == 0) {
                let items = []
                let dataObj = {}
                let removePrice = 0
                
                for (let i = 0; i < cartData.items.length; i++) {
                    console.log(cartData.items.length )
    
                    if (cartData.items[i].productId != productId) {
                        return res.status(400).send({ status: false, msg: "product not found in the cart" })
                    }
                    if (cartData.items[i].productId == productId) {
                        const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                        if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                        removePrice = productRes.price * cartData.items[i].quantity
                    }
                    items.push(cartData.items[i])
    
                }
                productPrice = cartData.totalPrice - removePrice
                dataObj.totalPrice = productPrice
                dataObj.totalItems = items.length
                dataObj.items = items
                const removeRes = await cartModel.findOneAndUpdate({ productId: productId }, dataObj, { new: true })
                return res.status(200).send({ status: true, message: "remove success", data: removeRes })
    
            }
            if(removeProduct == 1) {
                let dataObj = {}
                let item =[]
                let productPrice = 0
                for (let i = 0; i < cartData.items.length; i++) {
                    if (cartData.items[i].productId == productId) {
                        const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                        if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                        item.push({productId:productId,quantity:cartData.items[i].quantity - 1})
                        dataObj.totalPrice = cartData.totalPrice - productRes.price
                        dataObj.totalItems = item.length
                        dataObj.items = item
                    }
                    if (cartData.items[i].productId != productId) {
                        console.log(productId )
                        console.log(cartData.items[i].productId  )
                        return res.status(400).send({ status: false, msg:  "product not found in the cart" })}
                 
                   
                    
                
                    const reduceData = await cartModel.findOneAndUpdate({productId:productId},dataObj,{new:true})
    
                    return res.status(200).send({ status: true, message: "success", data:reduceData})
    
                }
    
            }
            else{
                return res.status(400).send({ status: false, msg: "removeProduct field should be allowed only 0 and 1 " }) 
            }
    
        }
        catch (err) {
            return res.status(500).send({ status: false, msg: err.message })
        }
    }
    

    const getCart = async function (req, res) {
        try{
          let userIdFromParams = req.params.userId
          let userIdFromToken = req.userId
      
          if (!isValidObjectId(userIdFromParams)) {
              return res.status(400).send({ status: false, msg: "userId is invalid" });
          }
      
          const userByuserId = await usermodel.findById(userIdFromParams);
      
          if (!userByuserId) {
              return res.status(404).send({ status: false, message: 'user not found.' });
          }
      
          if (userIdFromToken != userIdFromParams) {
              return res.status(403).send({status: false,message: "Unauthorized access." });
          }
      
          const findCart = await cartmodel.findOne({ userId: userIdFromParams })
          
          if (!findCart) {
              return res.status(400).send({ status: false, message: "no cart exist with this id" })
          }
          
          if(findCart.totalPrice === 0){
              return res.status(404).send({status:false, msg:"your cart is empty."})
          }
      
         return res.status(200).send({status:true, msg:"Cart Details.", data:findCart})
      }
      catch(error){
          return res.status(500).json({ status: false, message: error.message });
      }
      }

const deleteCart = async function(req,res){
    try {

        const userId = req.params.userId
        

        if (!isValidObjectId(userId)) 
            return  res.status(400).send({ status: false, message: "userid is not valid in params" })
        
const findingUserId = await userModel.findById(userId)
if(!findingUserId)
return res.status(400).send({status:true,message:"userId not found"})

// let tokenId = req.userId
// console.log(tokenId);
// if (tokenId != userId) 
//     return res.status(400).send({ status: false, message: "unauthorized access" })

    let findingcartInUserid = await cartModel.findById(userId)

    if(!findingcartInUserid)

    return res.status(400).send({ status: false, message: "No cart found" })

    let updateCart = await cartModel.findByIdAndUpdate(userId, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
    return res.status(204).send({ status: true, message:"cart has been deleted", data:updateCart})
            
        
    } catch (error) {

        return res.status(500).send({status:false, message:error.message})
        
    }
}
module.exports.createCart=createCart
module.exports.deleteCart = deleteCart;
module.exports.getCart= getCart;
module.exports.updateCart=updateCart;
