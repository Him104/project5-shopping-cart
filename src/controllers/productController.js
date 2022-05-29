const productModel = require('../Models/productModel')
const mongoose = require('mongoose')
const aws = require("../Middleware/aws")
const moment = require('moment')

// validations
const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidNumber = (value) => {
    return (!isNaN(value) && value > 0)
}

const isValidInteger = function isInteger(value) {
    return value % 1 == 0;
}

const isValidImage = (image) => {
    if (/.*\.(jpeg|jpg|png)$/.test(image.originalname)) {
        return true
    }
    return false
}


const isValidBoolean = (value) => {
    return (value === "true" || value === "false")
}

const isValidFiles = (requestFiles) => {
    return requestFiles.length > 0
}

const isValidSize = (Arr) => {
    let newArr = []
    if (!Arr.length > 0)
        return false

    for (let i = 0; i < Arr.length; i++) {
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(Arr[i].toUpperCase())) {
            return false
        }
        newArr.push(Arr[i].toUpperCase())
    }
    return newArr
}
const validString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


//////////// PROJECT API's////////////////

// 1. post product API

const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files

        let {title,description,price,currencyId,currencyFormat,isFreeShipping,availableSizes,installments} = data
             
            // body validation
            if(!isValidRequestBody(data)) {
                return res
                .status(400)
                .send({ status: false, message: `invalid request params` })
            }

        // title validation
        if (!title)
        { res.status(400).send({ status: false, message: "Title is required" }) }

        let checkProduct = await productModel.findOne({ title: title })
        if (checkProduct) 
        { return res.status(400).send({ status: false, message: "Product title is already present" }) }

        // description validation
        if (!description) 
        { return res.status(400).send({ status: false, message: "description is required" }) }

        // productPrice validation
        if (!price)
         { return res.status(400).send({ status: false, message: "price is required" }) }

         if (!isValid(price))
         if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
             return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
         }
         //currencyID validation
        if (!currencyId) 
        { return res.status(400).send({ status: false, message: "currency Id is required" }) }

        if(currencyId != 'INR') {
            return res.status(400).send({ status: false, message: `${currencyId} is Not A Valid Currency Id` })
        }
        // currency format validation
        if (!currencyFormat)
          return res.status(400).send({ status: false, message: "currency Format is required" }) 

        if(currencyFormat != '₹') {
            return res.status(400).send({ status: false, message: `${currencyFormat} Is Not A Valid Curency Format` })}

        // freeShipping validation
        if (!isValidBoolean(isFreeShipping)) 
        {return res.status(400).send({ status: false, message: `isFreeShipping Should Be a Boolean value is TRUE/FALSE` })}
        
        // availableSizes validations
        if (!availableSizes) 
        { return res.status(400).send({ status: false, message: `please Provide Avilable Sizes` }) }

        if (availableSizes.length === 0) {
            return res.status(400).send({ status: false, message: ` In Valid Input` })}
        
        const SizesEnum = function (availableSizes) {
            return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1
        }
        if (!SizesEnum(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Is not valid available Sizes provide S, XS, M, X, L, XXL, XL " })
        }

        // installments validation
        if (!isValidNumber(installments))
         if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
             return res.status(400).send({ status: false, msg: "Please Enter Valid Installment number" })
         }

        //  uploadFiles
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.productImage = uploadedFileURL
        } else {
            return res.status(400).send({ msg: "No image found to upload" })
        }

        // dataCreation
        let createdProduct = await productModel.create(data)
        return res.send({ status: "Product created successfully", data: createdProduct })}
    catch (error) {
        return res.send(error.message)
    }
}

// 2. get products by query params

const getSpecificProduct = async function (req, res) {
    try{
        let data = {
            isDeleted: false
        }
        let queryDataSize = req.query.size;
        if (queryDataSize) {
            if (!(isValid(queryDataSize)) && (isValidSize(queryDataSize))) {
                return res.status(400).send("plz Enter a valid Size")
            }
            data["availableSizes"] = queryDataSize; //
        }
        let name = req.query.name;
        if (name) {
            if (!isValid(name)) {
                return res.status(400).send("plz enter a valid name")
            }
            data["title"] = {$regex: name}
        }
        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!isValid(priceGreaterThan)) {
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {
                $gt: priceGreaterThan
            }
        }
        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!isValid(priceLessThan)) {
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {
                $lt: priceLessThan
            }
        }
        if( priceLessThan && priceGreaterThan){
            if(!isValid(priceLessThan)){
                return res.status(400).send("plz enter a valid price")
            }
            if(!isValid(priceGreaterThan)){
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {$lt:priceLessThan,$gt:priceGreaterThan}
    
        }
        let filerProduct = await productModel.find(data).sort({price: req.query.priceSort})//.skip(8)//.limit(1)//.count();
        // let filerProduct = await productModel.find({title: {$regex: name}});
        if (filerProduct.length === 0) {
            return res.status(400).send({
                status: true,
                msg: "No product found"
            })
        }
        return res.status(200).send({
            status: true,
            msg: "success",
            data: filerProduct
        })
    }catch(error){
        return res.status(500).send ({status:false, message: error.message})
    }
}


// 3. get products by ID

const getproductbyId = async function(req,res){
    try{
        const productId = req.params.productId
      

      if (!isValid( productId)) {
      return  res.status(400).send({ status: false, message: "Please , provide productId in path params" })
        
      }
      if(!isValidObjectId( productId)){
        return res.status(400).send({status:false,msg:'please provide a valid productId'})
    }
    const isPresent = await productModel.findById({ _id: productId })

    if (!isPresent){
     return res.status(404).send({ status: false, message: "product not found" })
    }
    // const productData = await productModel.findById({_id: productId})

    return res.status(200).send({ status: true, message: "product details", data: isPresent })
} catch (error) {
    return res.status(500).send({ status: false, message: error.message })
}
}

// update by id

const updateProduct = async function(req,res){
    try {

        let productId = req.params.productId
        let data = req.body

       

        if(Object.keys(data)==0)
            return res.status(400).send({ status: false, message: "Enter data to update" }) 

            let findingProduct = await productModel.findById(productId)
            if(!findingProduct)
            return res.status(400).send({status:true,message:error.message})

            const updateProduct = await productModel.findByIdAndUpdate(productId,
           { $set:{title:data.title, description:data.description,price:data.price,currencyId:data.currencyId,currencyFormat:data.currencyFormat,productImage:data.productImage,style:data.style,availableSizes:data.availableSizes, installments:data.installments}},
           {new:true})

           return res.status(201).send({status:true, message:"success", data:updateProduct})
        
    } catch (error) {

        return res.status(500).send({status:false,message:error.message})
        
    }
}


const deleteProduct = async  function(req, res)  {
    try {
        const data = req.params.productId
        
      if (!isValid(data)) {
        return  res.status(400).send({ status: false, message: "Please , provide productId in path params" })
          
        }
        if (!isValidObjectId(data)) {
         return  res.status(400).send({ status: false, message: `${data} is not a valid book id ` })
            
        }
        const product = await productModel.findById({_id:data})
        if (!product) {
            return res.status(404).send({ status: false, message: "product not found" })
        }
        if (product.isDeleted == true) {
            return res.status(400).send({ status: false, message: "product is already deleted" })
        }
        const delProduct = await productModel.findByIdAndUpdate(data, { isDeleted: true, deletedAt: moment().format("YYYY-MM-DD") }, { new: true })
        return res.status(200).send({ status: true, message: "success", data: delProduct })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createProduct = createProduct
// module.exports.getProduct = getProduct
module.exports.getproductbyId = getproductbyId
module.exports.getSpecificProduct = getSpecificProduct
module.exports.deleteProduct = deleteProduct
module.exports.updateProduct = updateProduct