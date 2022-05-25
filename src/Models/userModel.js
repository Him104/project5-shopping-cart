const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
     fname: {
        type: String,
        required: true,
        trim:true,
    },
    lname: {
        type: String,
        required: true,
         trim:true,
    },
    email: {
        require: true,
        type: String,
        unique: true,
        trim:true,
    },
    profileImage: {
        type:String,
        required:true,
        trim:true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim:true,
    },//valid Indian number
    password: {
        type:String,
        required:true, 
        minLen: 8, 
        maxLen: 15,
        trim:true,
    }, // encrypted password
    // address: {
    //     Shipping:{
    //     street: { type: String, required: true },
    //     city: { type: String, required:true },
    //     pincode: { type: Number , required:true}
    //     },
    //     billing:{
    //     street: { type: String, required:true },
    //     city: { type: String ,required:true},
    //     pincode: { type: Number, required:true }
    //     }
    // },

}, { timestamps: true });


module.exports = mongoose.model('Users', userSchema)