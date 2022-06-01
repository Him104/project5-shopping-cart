const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: {
        required: true,
        type: ObjectId,
        ref: 'users'
    },
    items:[{
        productId: {
            type:Number,
            required:true,
            type:ObjectId,
            ref:'products'
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
    totalItems: {
        type:Number,
        required:true,
        //comment:
    }
    
}, { timestamps: true });


module.exports = mongoose.model('carts', cartSchema)