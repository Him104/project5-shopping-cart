const productModel = require("../Models/productModel")
const aws = require("../Middleware/aws")
const { isValidReqBody,isValidNum, isValid,isValidPincode, isValidObjectId, isValidEmail, isValidMobile, isValidName,isValidPassowrd,isValidPrice,isValidEnum} = require("../Middleware/validation")
const { default: mongoose, Mongoose } = require("mongoose")

const createProduct = async function (req, res){
    try {
        let data = req.body
        let files = req.files
        if(files.length == 0){ return res.status(400).send({status:false,message:"files is missing"})}
        if(!data || isValidReqBody(data)){
            return res.status(400).send({status:false, message:"DATA is missing"})
        }
        let { title,description, price,currencyId,currencyFormat, isFreeShipping, style,installments, availableSizes } = data
        //==validation for title
        if(!isValid(title)){
            return res.status(400).send({status:false,message:"Title is missing"})
        }
        const checkTitle = await productModel.findOne({title:title}) 
        if(checkTitle){
            return res.status(400).send({status:false, message:"Title already exist"})
        }
        //==validation for description
        if(!isValid(description)){
            return res.status(400).send({status:false,message:"description is missing"})
        }
        //==validation for Price
        if(!isValid(price)){
            return res.status(400).send({status:false,message:"Price is missing"})
        }
        if(!(isValidPrice(price))){ return res.status(400).send({status:false,message:"price is not a valid price. Please provide input in numbers"})}
       //==validation for currencyId
        if(!isValid(currencyId)){
            return res.status(400).send({status:false,message:"currancyId is missing"})
        }
        if(currencyId.trim() != 'INR'){ return res.status(400).send({status:false, message:"Please provide Indian Currency Id"}) }
        //==validation for currencyFormat
        if(!isValid(currencyFormat)){
            return res.status(400).send({status:false,message:"currancyFormate is missing"})
        }
        if(currencyFormat.trim() != '₹' ){ return res.status(400).send({status:false,message:"Please provide right format for currency"})}
        //==validation for isFreeshipping
        if(!isFreeShipping){
            return res.status(400).send({status:false,message:"isFreeshipping Value is missing"})
        }
        if(!(isFreeShipping.trim() !== false)) {return res.status(400).send({status:false,message:"isFreeshipping value is True or False"})}
        
        //*****validation for availableSizes */
        if (availableSizes.length === 0) {
            return res.status(400).send({ status: false, message: ` In Valid Input` })}
        if(isValid(availableSizes)){
                const availableSizesArr = availableSizes.toUpperCase().trim().split(',').map(availableSizes => availableSizes.trim());
                data.availableSizes = availableSizesArr
            }

        //==validation for installment
        if(!isValid(installments)){
            return res.status(400).send({status:false,message:"Price is missing"})
        }
        //==isDeleted
        // if(data.isDeleted){
        //    data.isDeleted = false
        // }
        // data.deletedAt = null
        //==uploding product picture
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            data.productImage = uploadedFileURL;
          } else {
            res.status(400).send({ msg: "No file found" });
          }
          
        
        //==creating and sending product details
        let newProduct = await productModel.create(data)
        res.status(200).send({status:true, message:"New product created successfully",data:newProduct})

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}

/****GET /products/:productId */

const getProductId = async function(req,res) {
    try {
        let productId = req.params.productId
        if (req.params.productId == undefined)
            return res.status(400).send({ status: false, message: "productId is required." });
        if(productId) {
            if(!mongoose.isValidObjectId(productId)) {
                return res.status(400).send({status:false, msg:"productId is not a type of objectId"})
            }
        }
        let check = await productModel.findOne({_id:productId, isDeleted:false}).select()
        if(!check) {
            return res.status(400).send({status:false, msg: "productId is not  present"})
        }
        if(check.length ==0) {
            return res.status(404).send({status:false, msg: "product is not found"})
        }

        const product = await productModel.findById(productId)
        return res.status(200).send({status:true, message:"product details", data:product})
    } catch(error) {
        res.status(500).send({status:"error", error:error.message})
    }
}

/******PUT /products/:productId ******/

const updateProduct = async function(req,res) {
    try{
        let productId = req.params.productId;
        let data = req.body
        let files = req.files
        const updatedData = {}
        let {title,description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, isDeleted } = data // destructuring}
        
        let idCheck = mongoose.isValidObjectId(productId)
        if(!idCheck)
        return res.status(400).send({status:false, msg:"user is not a type of objectId "})

        let status = await productModel.findOne({_id:productId})
        if(!status)
        return res.status(400).send({status:false, msg:"this product is not present"})
        if(status.isDeleted ===true)
        return res.status(400).send({status:false, msg: "this product is already deleted"})

        let title1 = await productModel.findOne({title:title})
        if(!title1)
        return res.status(400).send({status:false, msg:"this title is already persent"})
        if(title) {
        if(typeof title!=="string" || title.trim().length === 0)
        return res.status(400).send({status:false, msg:"plz enter valid title"});
        title = title.trim()
        }
    
        if(description) {
        if(typeof description !== "string" || description.trim().length ===0)
        return res.status(400).send({status:false, msg:"plz enter valid description"});
        description = description.trim()
        }

        if(price) {
            if(!(!NaN(Number(price))))
            return res.status(400).send({status:false, msg:"plz enter valid price and should be in Number"});
            if(price<0) {
                return res.status(400).send({status:false, msg:"price should be in valid number only"});
         }
        }

        if(currencyId) {
            if(typeof currencyId !== "string" || currencyId.trim().length === 0)
            return res.status(400).send({status:false, msg:"currencyId should be in string"});
        }
        if(currencyId.toUpperCase() !="INR") 
        return res.status(400).send({status:false, msg:"currencyId only INR accepted" });
        currencyId = currencyId.toUpperCase()

        if (currencyFormat) {
        if (currencyFormat != "₹") {
            return res.status(400).send({ status: false, msg: "Only Indian Currency ₹ accepted" })
        }
        }

        if (isFreeShipping) {
        let Shipping = JSON.parse(isFreeShipping)
        if (typeof Shipping !== 'boolean') {
            return res.status(400).send({ status: false, msg: "isFreeShipping should be in Boolen valus" })
        }

        const update = await productModel.findOneAndUpdate({_id:productId?.trim()}, 
        {$set:{isFreeShipping: Shipping}},{new:true});
         data.isFreeShipping = Shipping

        if(style) {
        if(typeof style !=="string" || style.trim().length === 0)
        return res.status(400).send({status:false, msg:"plz enter the style"});
        data.style = data.style.trim()
        }

        if(installments) {
        if(!(!NaN(Number(installments))))
        return res.status(400).send({status:false, msg:"plz enter valiinstallements and should be in Number"});
        if(installments<0) {
            return res.status(400).send({status:false, msg:"installments should be in valid number only"});
     }
     data.installments = data.installments
    }

    if(isDeleted) {
        let dele = JSON.parse(isDeleted)
        console.log(typeof dele)
        if(typeof dele !== "boolean")
        return res.status(400).send({ status: false, msg: "isDeleted is boolean so,it can be either true or false" })
    }
    if(del == true) {
        data.deleteAt = Date.now() }
        const update1 = await productModel.findOneAndUpdate({_id:productId?.trim()}, { $set:{isDeleted:dele}
        },{new:true})
        data.isDeleted }
        data.isDeleted = dele
    
    if(availableSizes) {
     let siz = availableSizes.split(",")
     // console.log(siz)
      if (!Array.isArray(siz)) return res.status(400).send({ status: false, msg: "availableSizes should be array of strings" })
          if (siz.some(sub => typeof sub === "string" && sub.trim().length === 0)) {
           // return res.status(400).send({ status: false, message: " availableSizes should not be empty or with white spaces" })
        }

        let Size = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']
        const subtrim = siz.map(element => {
            return element.trim()

        })
        console.log(subtrim)
        for (const element of subtrim) {
         console.log(element)
            if (Size.includes(element) === false) return res.status(400).send({ status: false, msg: 'availableSizes should be  ["S", "XS", "M", "X", "L", "XXL", "XL"]' })

        }

        const update = await productModel.findOneAndUpdate({ _id: productId?.trim() }, {
        $set: { availableSizes: subtrim }}, { new: true })
      //  data.availableSizes = subtrim

    }
    if (files) {
        // console.log(files)
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            data.productImage = uploadedFileURL
            let Image = data.productImage

            const update2 = await productModel.findOneAndUpdate({ _id:productId?.trim() }, {
             $set: { productImage: Image }}, { new: true })
        } }

    //console.log(files)

    const updateproduct = await productModel.findOneAndUpdate({ _id:productId?.trim() }, {
    $set: { title: title, description: description, price: price, currencyId : currencyId, currencyFormat: currencyFormat,  style:style, installments:installments }
    }, { new: true })//.select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

    const product = await productModel.findById(productId)
    return res.status(200).send({ status: true, msg: "updated User", data: product });
}
    catch(error) {
    res.status(500).send({status:"error",error:error.message})
}
}

/******DELETE /products/:productId******/

const deleteProductId = async function(req,res) {
    try {
        let data = req.params.productId
        let idCheck = mongoose.isValidObjectId(data)
        if(!idCheck) 
        return res.status(400).send({status:false, msg:"productId is not a type of objectId"})
         let status = await productModel.findById(data)
         if(!status) 
         return res.status(400).send({status:false, msg: "this product is not present "})

         if(status.isDeleted ===true) {
             return res.status(404).send({status:false, msg:"this product is already deleted"})
         }

         let deleteProduct = await productModel.findByIdAndUpdate(data, {$set: {isDeleted:true}},{new: true})
         return res.status(200).send({status:true, msg:"this product is deleted successfully", Data: deleteProduct})
    }
     catch(error) {
    res.status(500).send({status:"error", error: error.message})
}
}

module.exports.createProduct = createProduct
module.exports.getProductId = getProductId
module.exports.updateProduct = updateProduct
module.exports.deleteProductId =deleteProductId