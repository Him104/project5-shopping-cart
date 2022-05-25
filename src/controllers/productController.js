const productModel= require('../Models/productModel')
const aws = require("../Middleware/aws")




const products = async function (req,res){
    try{
    let data = req.body
    let files = req.files

    let {title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes,
        installments, deletedAt, isDeleted} = data

        // titleCheck
        if(!title){res.status(400).send({status: false, message: "Title is required"})}
        let checkProduct= await productModel.findOne({title:title})
        if(checkProduct)
        {return res.status(400).send({status: false, message: "Product title is already present"})}

        if(!description){return res.status(400).send({status: false, message: "description is required"})}
        if(!price){return res.status(400).send({status: false, message: "price is required"})}
        if(!(typeof (price) === "number")){return res.status(400).send({status: false, message: "price should be a number"})}
        if(!currencyId){return res.status(400).send({status: false, message: "currency Id is required"})}
        if(!currencyFormat){return res.status(400).send({status: false, message: "currency Format is required"})}
        if(!files){return res.status(400).send({status: false, message: "product Image is required"})}
        // if(!(typeof (isFreeShipping) === "number")){return res.status(400).send({status: false, message: "Free shipping should be TRUE/FALSE"})}

        if(files && files.length>0){
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.productImage = uploadedFileURL
            }else{ 
            return res.status(400).send({msg:"No file found to upload in image"})
            }

            let createdProduct = await productModel.create(data)
            return res.send({status: "Product created successfully", data:createdProduct})
}
catch(error){
   return res.send(error.message)
}}






module.exports.products=products