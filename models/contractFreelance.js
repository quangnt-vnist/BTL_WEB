const mongoose = require('mongoose');
const User = require('./user');
// const JobFulltime = require('./jobFulltime');
const JobFreelance = require('./jobFreelance');

const contractFreelanceSchema = new mongoose.Schema({
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: User
    },
    jobFreelance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: JobFreelance,
        required:true
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        // required:true,
        ref: User
    },
    message : {
        type: String,
        // required: true
        default: null
    },
    confirm: {
        type: Number,
        required: true,
        default: 0 
        // 0 - chưa có gì; 
        // 1 - nhà tuyển dụng mời ứng viên;
        // 2 - ứng viên quan tâm đến cv;
        // 3 - hợp đồng đc kí
    }
},{
    timestamps: true
});

module.exports = mongoose.model('contractfreelance', contractFreelanceSchema);

/**
 * sẽ có 2 trường hợp tạo ra model này: 
 * 1- khi ứng viên quan tâm đến 1 công việc nào đó thì họ sẽ click vào nút : "quan tâm công việc";
 *    nhà tuyển dụng vào xem mà thấy ưng thì accept cho người này làm việc
 *    khi đó việc này sẽ chuyển thành cv đang thực hiện trong trang quản lý công việc
 * 2- khi có nhà tuyển dụng muốn mời ứng viên tham gia các công việc đã đăng
 *    chọn mời tam gia dự án, chuyển sang trang mời, chọn công việc muốn mời
 *    người ứng viên đồng ý thì accept 
 */