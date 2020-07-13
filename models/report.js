const mongoose = require('mongoose');
const User = require('./user');
const Job = require('./jobFreelance');

const userSchema = new mongoose.Schema({
    comment: {
        type: String,
    },
    file:[{
        type: {
            type: String
        },
        name:{
            type: String
        },
        fileType:{
            type: String
        },
        path: {
            type: String
        }
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Job,
    }
},{
    timestamps: true
});


module.exports = mongoose.model('report', userSchema);