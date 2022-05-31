const cartModel = require("../Models/cartModel")
const mongoose = require('mongoose');



const isValid = function (value) {
    if (typeof value == 'undefined' || value == 'null' || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidInteger = function isInteger(value) {
    return value % 1 == 0;
}
const isValidString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
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

module.exports.updateCart=updateCart
