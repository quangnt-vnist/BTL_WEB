const mongoose = require('mongoose');
const User = require('./user');
const DetailEmployer = require('./detailEmployer');
const Schema = mongoose.Schema;

const freelanceJobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    field: [{ // lính vực -kinh doanh, web, thiết kế đồ họa,...
        type: String,
        required: true
    }],
    description: {//yêu cầu cviec
        type: String,
        required: true
    },
    budget: { // ngân sách: theo giờ 
        type: String,
        required: true
    },
    timeOfWork: {
        type: String // việc làm theo giờ thì sẽ có tgian 3<1thang/ 1-thang/ >3thang
    },
    levelOfCandidate: { // junior-senior-master
        type: String,
        required: true
    },
    // salary: {
    //     type: String,
    //     required: true
    // },
    creator: { // id người tạo
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    inActive: {
        type: Number,
        required: true,
        default: 1 
        // 1- là đang thực hiện, khi show công việc đang thực hiện, thì sẽ có nút kết thúc tuyển dụng
        // 0- là đã kết thúc tuyển dụng
    },
    createAt: {
        type: Date,
        default: Date.now
    }
},{
    timestamps: true
});


module.exports = mongoose.model('freelancejob', freelanceJobSchema);