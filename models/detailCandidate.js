const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const detailCandidateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    sex: {
        type: String,
        required: true,
        default: 'khác'
    },
    birth: {
        type: Date,
        require: true
    },
    address: { // tỉnh thành phố thôi
        type: String,
        required: true
    },
    experience: { // senior/junior/master
        type: String,
        required: true
    },
    specialized: { // lĩnh vực chuyên môn: chỉ có 1 cái vd designUI 
        type: String,
        required: true
    },
    skill: [{// ví dụ như thiết kế đồ họa, web,...
        type: String,
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    freelanceInfo: {
        priorityWork: { // ưu tiên công việc có tgian làm bao lâu <1, 1-3, >3
            type: String,
            require: true
        },
        salary: { // vd 200k/h
            type: String,
            require: true
        }
    }
    // ,
    // // do chủ yếu là làm về freelancer nên cái thông tin full time này k cần required true
    // fulltimeInfo: {
    //     level: { // trình độ mong muốn junior-senior-master 
    //         type: String,
    //     },
    //     address: { // dịa diểm muốn làm việc
    //         type: String,
    //     },
    //     salary: { // vd: 40tr/tháng
    //         type: String,
    //     }
    // }
}, {
    timestamps: true
});

module.exports = mongoose.model('detailcandidate', detailCandidateSchema);