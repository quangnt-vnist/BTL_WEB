const mongoose = require('mongoose');
const User = require('./user');

const detailEmployerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: User
    },
    company: {
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required : true
        },
        email: {
            type:String,
            require: true
        },
        website:{
            type: String,
            required:true
        },
        description: { // mổ tả về lĩnh vực của công ti, quảng cáo công ti ....
            type: String,
            required: true
        } 
    }
},{
    timestamps: true
});

module.exports = mongoose.model('detailemployer', detailEmployerSchema);