const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: {
        required: true,
        type: ObjectId,
        ref: 'user'
    },
    items:[{
        productId: {
            type:Number,
            required:true,
            type:ObjectId,
            ref:'product model'
        },
        quantity: {
            type:Number,
            required:true }
    }],
    totalPrice: {
        type:Number,
        required:true,
        //comment:
    },
    totalPrice: {
        type:Number,
        required:true,
        //comment:
    }
    
}, { timestamps: true });


module.exports = mongoose.model('cart', cartSchema)