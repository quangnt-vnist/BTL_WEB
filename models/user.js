const mongoose = require('mongoose');

// Name, email, pass, role, sex
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6 // min has 6 characters
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    role: { //employer - candidate  // Nhà tuyển dụng - Ứng viên
        type: String,
        required: true
    },
    // sex: {
    //     type: String,
    //     required: true,
    //     default: 'khác'
    // },
    hasDetail: {
        type: Number,
        default: -1
    },
    detail: {
        type: mongoose.Schema.Types.ObjectId,
    },
    avatar: {
        type: String,
    }
},{
    timestamps: true
});


module.exports = mongoose.model('user', userSchema);