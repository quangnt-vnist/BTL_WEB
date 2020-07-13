const router = require('express').Router();
const User = require('../../models/user');
const DetailEmployer = require('../../models/detailEmployer');
const Candidate = require('../../models/detailCandidate');
const ContractFreeLance = require('../../models/contractFreelance');
const JobFreelance = require('../../models/jobFreelance');
const upload = require('../middleware').upload;
const Report = require('../../models/report');
const moment = require('moment');
moment.locale('vi');

router.get('/employer-info', async (req, res) => {
    const user = req.session.user;

    // console.log('1');
    if(user.role === "Nhà tuyển dụng") {
        try {
            var myUser = await User.findOne({_id: user._id});
            var detail = await DetailEmployer.findOne({user: user._id})
                .populate('user');
            // console.log('detail', detail);
            res.status(200).render('detail-user/showDetailEmployer.ejs', {
                title: "Thông tin chi tiết nhà tuyển dụng",
                user: myUser,
                detail: detail
            });
        } catch{
            // res.status(400).send('Error');
            console.log('error');
        }
    } else {
        res.render('template/notFound.ejs');
    }
    

});

// register xong thi chuyen den trang nay
router.get('/create-info', (req, res) => {
    const user = req.session.user;
    if(user.role === 'Nhà tuyển dụng'){
        res.render('detail-user/createDetailEmployer', { title: "Thông tin nhà tuyển dụng", user: req.session.user })
    } else {
        res.render('template/notFound.ejs');
    }
    // else if( user.role === 'Ứng viên'){
    //     res.render('detail-user/createDetailCandidate', {title: "Thông tin ứng viên" ,user: req.session.user})
    // }
});


router.post('/create-info', async (req, res) => {
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        console.log('body', req.body);
        const detailEmployer = new DetailEmployer({
            user: user._id,
            // user: "5eb38682c3f896ebcdb6c374",
            company: {
                name: req.body.name,
                address: req.body.address,
                email: req.body.email,
                website: req.body.website,
                description: req.body.description
            }
        });
        try {
            const detail = await detailEmployer.save();
            // res.json(detail);
            const updateUser = await User.updateOne({ _id: user._id },
                { $set: { hasDetail: 1, detail: detail._id } },
                { new: true }
            )
            res.redirect('employer-info');
        } catch (err) {
            // res.status(400).send("lỗi");
            console.log('error');
        }
    } else {
        res.render('template/notFound.ejs');
    }
});

router.post('/update-info', async (req, res) => {
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var company = {
            name: req.body.name,
            address: req.body.address,
            email: req.body.email,
            website: req.body.website,
            description: req.body.description
        }
        console.log('body', req.body);
        try {
            const updateInfo = await DetailEmployer.updateOne({user : user._id},
                { $set: { company: company } },
                {$new : true}
            );
            res.redirect('employer-info');
        } catch (err) {
            // res.status(400).send("lỗi");
            console.log('error');
        } 
    } else {
        res.render('template/notFound.ejs');
    }
});


router.get('/create-job', (req, res) => {
    const user = req.session.user;
    if(user.role === 'Nhà tuyển dụng'){
        res.render('employer/create-job', { title: "Đăng tin tuyển dụng Freelancer", user: req.session.user })
    } else {
        res.render('template/notFound.ejs');
    }
});

router.post('/create-job', async (req, res) => {
    const user = req.session.user;
    
    if(user.role === 'Nhà tuyển dụng'){
        var creator = await DetailEmployer.findOne({user: user._id}).populate({path: "user"})

        var newJob = new JobFreelance ({
            name: req.body.name,
            field: req.body.fields,
            description: req.body.description,
            budget: req.body.budget,
            timeOfWork: req.body.timeOfWork,
            levelOfCandidate: req.body.level,
            creator: user._id
        })

        try{
            var saveJob = await newJob.save();
            var job = saveJob.populate({path: "creator", populate: {path: 'detail', model: DetailEmployer}});
            
            res.redirect(`/employer/detail-job/${job._id}`);
            
            // res.render('employer/detailJob.ejs', {
            //     title: saveJob.name,
            //     user: user,
            //     creator: creator,
            //     job: job,
            //     participant: [],
            //     invited: [],
            //     favorite: []
            // })

            // res.json({
            //     title: saveJob.name,
            //     user: user,
            //     job: saveJob
            // })
        }catch{
            // res.send('không tạo đc');
            console.log('err');
        }
    } else {
        res.render('template/notFound.ejs');
    }
})

router.get('/search-cv', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            candidates = await Candidate.find({
                // TODO: điều kiện điền vào đây, để cho tìm kiếm sau này,
            })
                // .sort({'createdAt' : 'asc'}) // mới lập thì xếp cuối vì createAt lớn
                // sxep tăng dần, desc là giảm dần // hoặc dùng sort({ createdAt : 1 }) // 1 tăng dần, -1 giảm dần
                .sort({ createdAt: 1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
                .populate({ path: "user" });
            var totalCount = await Candidate.count({
                // condition
            });
            console.log(totalCount);
            var totalPages = Math.ceil(totalCount / perpage);
            
            // console.log({
            //     title: "Tìm kiếm ứng viên",
            //     user: req.session.user,
            //     candidates: candidates,
            //     currentPage: page,
            //     totalPages: totalPages
            // });

            res.status(200).render('employer/searchCV.ejs', {
                title: "Tìm kiếm ứng viên",
                user: req.session.user,
                candidates: candidates,
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount
            });
            // res.status(200).json({
            //     title: "Tìm kiếm ứng viên",
            //     user: req.session.user,
            //     candidates: candidates,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
        } catch{
            res.send('err');
        }
    }
    else {
        res.render('template/notFound.ejs');
    }
});

router.post('/search-cv', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;
    var page = parseInt(req.query.page);
    var perpage = parseInt(req.query.perpage);
    if(user.role === 'Nhà tuyển dụng'){
                
        var name = req.body.name ? req.body.name : "";
        var level = req.body.level ? req.body.level : "";
        var field = req.body.field ? req.body.field : "";

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {

            console.log('name, level, field', name, level, field);
            var keySearch = {
                // inActive: 1,
            }
            
            if(level !== ""){
                keySearch = {
                    ...keySearch,
                    experience: level,
                }
            }
            if(field !== ""){
                keySearch = {
                    ...keySearch,
                    skill: field
                }
            }    
           
            if(name !== "") {
                console.log('-------------');
                var candidates = await Candidate.find(keySearch)
                    .sort({ createdAt: 1 })
                    // .skip(perpage*(page-1)).limit(perpage)
                    .populate({ 
                        path: "user",
                        match: {name: {$regex: name, $options: 'i'}} 
                    })
                    // .elemMatch({ "user.name": { $regex: name, $options: 'i'}});

                    candidates = candidates.filter(e => e.user !== null)

            }
            else if(name === "") {
                var candidates = await Candidate.find(keySearch)
                    .sort({ createdAt: 1 }).skip(perpage*(page-1)).limit(perpage)
                    .populate({ 
                        path: "user",
                        // match: { "user.name": { $regex: name, $options: 'i'}}
                    });
            }
            var totalCount = candidates.length;
            // var totalCount = await Candidate.countDocuments(keySearch);
            var totalPages = Math.ceil(totalCount / perpage);
            
            res.status(200).render('employer/listCandidate.ejs', {
                title: "Tìm kiếm ứng viên",
                user: req.session.user,
                candidates: candidates,
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount
            });
            // res.status(200).json({
            //     title: "Tìm kiếm ứng viên",
            //     user: req.session.user,
            //     candidates: candidates,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
        } catch{
            console.log('error');
        }
    }
    else {
        res.render('template/notFound.ejs');
    }
});





router.get('/candidate-info/:id', async (req,res)=>{

    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        const info = await Candidate.findOne({user: req.params.id}).populate({path: 'user'});
        const jobs = await ContractFreeLance.find({ 
            // $and: [
            //     {candidate: req.params.id}, 
            //     {confirm: 0}
            // ]
            candidate: req.params.id, 
            confirm: 3 // 3 - là hợp đồng đã kí
            
        })
        .populate({path: 'candidate jobFreelance'});    

        const myJobs = await JobFreelance.find({ creator: req.session.user._id })
        .populate({path: 'candidate jobFreelance'});    

        console.log('job',  myJobs);
        res.render('employer/viewCandidateInfo.ejs', {
            title: info.user.name,
            data: info,
            user: req.session.user,
            job: jobs,
            myJobs: myJobs
        });
        // res.json({
        //     title: info.user.name,
        //     data: info,
        //     user: req.session.user,
        //     job: jobs
        // });
    }
    else {
        res.render('template/notFound.ejs');
    }
})



router.get('/invite-candidate/:id', async (req, res)=>{
    const user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){

        try{
            const candidate = await Candidate.findOne({user: req.params.id}).populate({path: 'user'});
            var invited = await ContractFreeLance.find({candidate: req.params.id});
            const jobs = await JobFreelance.find({
                creator: user._id,
                inActive: 1,
                // _id: {$nin : invited.jobFreelance}
            });
            // res.status(200).json({
            //     title: "Mời tham gia dự án",
            //     user: user,
            //     candidate: candidate,
            //     job: jobs
            // })
            res.render('employer/inviteCandidate.ejs', {
                title: "Mời tham gia dự án",
                user: user,
                candidate: candidate,
                job: jobs,
                message: "",
            })
        }catch{
            // res.status(400).json({err: "error"});
            console.log('Lỗi');
        }
    }else {
        res.render('template/notFound.ejs');
    }
    
})

router.post('/invite-candidate/:id', async (req, res)=>{
    var user = req.session.user;
    if(user.role === 'Nhà tuyển dụng'){
        try{
            var jobId = req.body.job;
            var candidateId = req.params.id;
            var quantam = await ContractFreeLance.findOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 2
            })
            var loimoi = await ContractFreeLance.findOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 1
            })
            var thamgia = await ContractFreeLance.findOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 3
            })
            if(quantam){
                const job = await JobFreelance.findOne({_id: jobId})
                const candidate = await Candidate.findOne({user: req.params.id}).populate({path: 'user'});
                const jobs = await JobFreelance.find({
                    creator: user._id,
                    inActive: 1
                });

                var contract = await ContractFreeLance.updateOne({_id: quantam._id},
                     {$set:{
                            confirm: 3,
                        }
                    },
                    {
                        $new: true
                    })

                res.render('employer/inviteCandidate.ejs', {
                    title: job.name,
                    user: user,
                    job: jobs,
                    contract: contract,
                    candidate: candidate,
                    message: "Nguời này đã đang quan tâm đến công việc này trước đó. Bây giờ bạn và ứng viên này có thể làm việc với nhau!"
                })
            }

            else if(loimoi){
                const job = await JobFreelance.findOne({_id: jobId})
                const candidate = await Candidate.findOne({user: req.params.id}).populate({path: 'user'});
                const jobs = await JobFreelance.find({
                    creator: user._id,
                    inActive: 1
                });

                res.render('employer/inviteCandidate.ejs', {
                    title: job.name,
                    user: user,
                    job: jobs,
                    contract: loimoi,
                    candidate: candidate,
                    message: "Bạn đã mời công việc này rồi!"
                })
            }
            else if(thamgia){
                const job = await JobFreelance.findOne({_id: jobId})
                const candidate = await Candidate.findOne({user: req.params.id}).populate({path: 'user'});
                const jobs = await JobFreelance.find({
                    creator: user._id,
                    inActive: 1
                });

                res.render('employer/inviteCandidate.ejs', {
                    title: job.name,
                    user: user,
                    job: jobs,
                    contract: thamgia,
                    candidate: candidate,
                    message: "Ứng viên này đang là thành viên trong công việc của bạn! Hãy mời một công việc khác, hoặc mời một người khác!"
                })
            }
            else {

                const job = await JobFreelance.findOne({_id: jobId})
                const candidate = await Candidate.findOne({user: req.params.id}).populate({path: 'user'});
                const jobs = await JobFreelance.find({
                    creator: user._id,
                    inActive: 1
                });

                console.log('body', req.body);

                const contract = new ContractFreeLance({
                    jobFreelance: jobId,
                    candidate: candidateId,
                    message: req.body.message,
                    employer: user._id,
                    confirm: 1
                })
                const saveContract = await contract.save();
                res.render('employer/inviteCandidate.ejs', {
                    title: job.name,
                    user: user,
                    job: jobs,
                    contract: saveContract,
                    candidate: candidate,
                    message: "Bạn đã gửi lời mời thành công! Chờ ứng viên phản hồi"
                })

                
            }

            // res.status(200).json({
            //     title: job.name,
            //     user: user,
            //     job: job,
            //     contract: saveContract,
            //     candidate: candidate
            // })
            
        }catch{
            // res.status(400).json({err: "error"});
            console.log('Lỗi');
        }
    } else {
        res.render('template/notFound.ejs');
    }
    
});




/**
 * show tất cả việc đang tuyển dụng
 */

 router.get('/active-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var job = await JobFreelance.find({
                inActive: 1,
                creator: req.session.user._id,
                // TODO: điều kiện điền vào đây, để cho tìm kiếm sau này,
            })
                // .sort({'createdAt' : 'asc'}) // mới lập thì xếp cuối vì createAt lớn
                // sxep tăng dần, desc là giảm dần // hoặc dùng sort({ createdAt : 1 }) // 1 tăng dần, -1 giảm dần
                .sort({ createdAt: -1 })
                .skip(perpage*(page-1))
                .limit(perpage)
                .populate({ path: "creator" });
            var totalCount = await JobFreelance.count({
                // condition
                inActive: 1,
                creator: req.session.user._id,
            });
            var totalPages = Math.ceil(totalCount / perpage);
            
            for(let i in job){
                
                job[i] = {
                    field: job[i].field,
                    inActive: job[i].inActive,
                    _id: job[i]._id,
                    name: job[i].name,
                    description: job[i].description,
                    budget: job[i].budget,
                    timeOfWork: job[i].timeOfWork,
                    levelOfCandidate: job[i].levelOfCandidate,
                    creator: job[i].creator,
                    createAt: moment(job[i].createAt).fromNow(),
                    createdAt: moment(job[i].createdAt).fromNow(),
                    updatedAt: job[i].updatedAt
                }
            }
            // console.log('job', job[0]);
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
            res.status(200).render('employer/showActiveJob.ejs', {
                title: "Công việc đang tuyển dụng",
                user: req.session.user,
                job: job,
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount
            });
        } catch{
            res.send('err');
        }
    } else {
        res.render('template/notFound.ejs');
    }
});


 router.post('/active-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);
        var name = req.body.name ? req.body.name : "";
        var level = req.body.level ? req.body.level : "";
        var field = req.body.field ? req.body.field : "";
        console.log('name-leve-field', name, level, field);
        // console.log('query', req.query);
        try {

            var keySearch = {
                inActive: 1,
                creator: req.session.user._id,
            }

            if(name !== ""){
                keySearch = {
                    ...keySearch,
                    name: { $regex: name, $options: 'i'}
                }
            }
            if(level !== ""){
                keySearch = {
                    ...keySearch,
                    levelOfCandidate: level,
                }
            }
            if(field !== ""){
                keySearch = {
                    ...keySearch,
                    field: field
                }
            }

            var job = await JobFreelance.find(keySearch)
                .sort({ createdAt: -1 }).skip(perpage*(page-1)).limit(perpage)
                .populate({ path: "creator" });
            var totalCount = await JobFreelance.countDocuments(keySearch);
            var totalPages = Math.ceil(totalCount / perpage);

            for(let i in job){
                
                job[i] = {
                    field: job[i].field,
                    inActive: job[i].inActive,
                    _id: job[i]._id,
                    name: job[i].name,
                    description: job[i].description,
                    budget: job[i].budget,
                    timeOfWork: job[i].timeOfWork,
                    levelOfCandidate: job[i].levelOfCandidate,
                    creator: job[i].creator,
                    createAt: moment(job[i].createAt).fromNow(),
                    createdAt: moment(job[i].createdAt).fromNow(),
                    updatedAt: job[i].updatedAt
                }
            }
            // console.log('job', job[0]);
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
            res.status(200).render('employer/listJob.ejs', {
                title: "Công việc đang tuyển dụng",
                user: req.session.user,
                job: job,
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount
            });
        } catch{
            res.send('err');
        }
    } else {
        res.render('template/notFound.ejs');
    }
});

/**
 * show tất cả việc DỪNG tuyển dụng
 */

 router.get('/not-active-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;
    if(user.role === 'Nhà tuyển dụng'){

        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var job = await JobFreelance.find({
                inActive: 0,
                creator: req.session.user._id,
                // TODO: điều kiện điền vào đây, để cho tìm kiếm sau này,
            })
                // .sort({'createdAt' : 'asc'}) // mới lập thì xếp cuối vì createAt lớn
                // sxep tăng dần, desc là giảm dần // hoặc dùng sort({ createdAt : 1 }) // 1 tăng dần, -1 giảm dần
                .sort({ createdAt: 1 })
                .skip(perpage*(page-1))
                .limit(perpage)
                .populate({ path: "creator" });
            var totalCount = await JobFreelance.count({
                // condition
                inActive: 0,
                creator: req.session.user._id,
            });
            var totalPages = Math.ceil(totalCount / perpage);
            
            for(let i in job){
                
                job[i] = {
                    field: job[i].field,
                    inActive: job[i].inActive,
                    _id: job[i]._id,
                    name: job[i].name,
                    description: job[i].description,
                    budget: job[i].budget,
                    timeOfWork: job[i].timeOfWork,
                    levelOfCandidate: job[i].levelOfCandidate,
                    creator: job[i].creator,
                    createAt: moment(job[i].createAt).fromNow(),
                    createdAt: moment(job[i].createdAt).fromNow(),
                    updatedAt: job[i].updatedAt
                }
            }

            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
            res.status(200).render('employer/showNotActiveJob.ejs', {
                title: "Công việc đang tuyển dụng",
                user: req.session.user,
                job: job,
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount
            });
        } catch{
            console.log('err');
        }
    } else {
        res.render('template/notFound.ejs');
    }
});

 router.post('/not-active-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;
    if(user.role === 'Nhà tuyển dụng'){

        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);
        var name = req.body.name ? req.body.name : "";
        var level = req.body.level ? req.body.level : "";
        var field = req.body.field ? req.body.field : "";
        console.log('name-leve-field', name, level, field);
        // console.log('query', req.query);
        try {

            var keySearch = {
                inActive: 0,
                creator: req.session.user._id,
            }

            if(name !== ""){
                keySearch = {
                    ...keySearch,
                    name: { $regex: name, $options: 'i'}
                }
            }
            if(level !== ""){
                keySearch = {
                    ...keySearch,
                    levelOfCandidate: level,
                }
            }
            if(field !== ""){
                keySearch = {
                    ...keySearch,
                    field: field
                }
            }

            var job = await JobFreelance.find(keySearch)
                .sort({ createdAt: -1 }).skip(perpage*(page-1)).limit(perpage)
                .populate({ path: "creator" });
            var totalCount = await JobFreelance.countDocuments(keySearch);
            var totalPages = Math.ceil(totalCount / perpage);

            for(let i in job){
                
                job[i] = {
                    field: job[i].field,
                    inActive: job[i].inActive,
                    _id: job[i]._id,
                    name: job[i].name,
                    description: job[i].description,
                    budget: job[i].budget,
                    timeOfWork: job[i].timeOfWork,
                    levelOfCandidate: job[i].levelOfCandidate,
                    creator: job[i].creator,
                    createAt: moment(job[i].createAt).fromNow(),
                    createdAt: moment(job[i].createdAt).fromNow(),
                    updatedAt: job[i].updatedAt
                }
            }

            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
            res.status(200).render('employer/listJob.ejs', {
                title: "Công việc đang tuyển dụng",
                user: req.session.user,
                job: job,
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount
            });
        } catch{
            console.log('err');
        }
    } else {
        res.render('template/notFound.ejs');
    }
});

/**
 * show thông tn chi tiết công việc
 */
router.get('/detail-job/:id', async (req, res) => {
    var jobId = req.params.id;
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var job = await JobFreelance.findOne({_id: jobId}).populate({path: "creator", populate: {path: 'detail', model: DetailEmployer}});
        var creatorId = job.creator._id;
        var jobCreatedAt = moment(job.createdAt).fromNow();
        // console.log(creatorId);
        var creator = await DetailEmployer.findOne({user: creatorId}).populate({path: "user"})
        var participant = await ContractFreeLance.find({ // những thằng đang làm cv này
            jobFreelance: req.params.id,
            confirm: 3 // 3 - hợp đồng đã kí
        }).populate({path: "candidate", populate: {path:'detail', model: Candidate } })
        var invited = await ContractFreeLance.find({ // những ứng viên được mời
            jobFreelance: req.params.id,
            confirm: 1,
            // message: {$ne: null}
            // message: "Quang đz đã mời bạn tham gia cv này"
        }).populate({path: "candidate", populate: {path:'detail', model: Candidate } })

        var favorite = await ContractFreeLance.find({ // những ứng viên mong muốn đkí làm
            jobFreelance: req.params.id,
            confirm: 2,
            // message: null
        }).populate({path: "candidate", populate: {path:'detail', model: Candidate } })

        var comments = await Report.find({job: jobId}).populate({path: "creator job"});
        // console.log('moment------------', moment('2020-05-07T03:54:42.240Z').fromNow() );
        // console.log('moment------------', comments );
        
        for(let i in comments){
            var commentedAt = moment(comments[i].createdAt).fromNow();
            comments[i] = {
                _id: comments[i]._id,
                comment: comments[i].comment,
                job: comments[i].job,
                creator: comments[i].creator,
                file: comments[i].file,            
                createdAt: commentedAt,
                updatedAt: comments[i].updatedAt
            }
        }
        res.render("employer/detailJob.ejs", {
            title: job.name,
            creator: creator,
            user: user,
            job: job,
            participant: participant,
            invited: invited,
            favorite: favorite,
            comment: comments,
            jobCreatedAt: jobCreatedAt
        })

        // res.json({
        //     title: job.name,
        //     creator: creator,
        //     user: user,
        //     job: job,
        //     participant: participant,
        //     invited: invited,
        //     favorite: favorite,
        //     comment: comments,
        //     jobCreatedAt: jobCreatedAt
        // })
    } else {
        res.render('template/notFound.ejs');
    }
})

router.get('/discard-invite/:jobid/:candidateid', async(req,res)=>{
    var jobId = req.params.jobid;
    var candidateId = req.params.candidateid;
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var confirm = await ContractFreeLance.deleteOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 1, // 1 - nhà tuyển dụng đang mời ứng viên
                // message: {$ne: null}
            },
            // {
            //     $set : {
            //         message: null
            //     }
            // },
            // {$new: true}
        )
        res.redirect(`/employer/detail-job/${jobId}`);
    } else {
        res.render('template/notFound.ejs');
    }
})

router.get('/confirm-job/:jobid/:candidateid', async(req,res)=>{
    var jobId = req.params.jobid;
    var candidateId = req.params.candidateid;
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var confirm = await ContractFreeLance.updateOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 2, // 2 - ứng viên xin vào
                // message: null
            },
            {
                $set : {
                    confirm: 3, 
                    message: "Chúng tôi đã xem xét và chấp nhận lời mời đề nghị của bạn. Hãy liên hệ với chúng tôi theo email của công ty chúng tôi. Nếu trong vòng 1 tuần, bạn không liên hệ với chúng tôi, thì chúng tôi sẽ hủy hợp đồng với bạn. Cảm ơn bạn!"
                }
            },
            {$new: true}
        )
        res.redirect(`/employer/detail-job/${jobId}`);
    } else {
        res.render('template/notFound.ejs');
    }
})

router.get('/delete-contract/:jobid/:candidateid', async(req,res)=>{
    var jobId = req.params.jobid;
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var candidateId = req.params.candidateid;
        var delContract = await ContractFreeLance.deleteOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 3 // 3 - là hợp đồng đã kí
        })
        res.redirect(`/employer/detail-job/${jobId}`);
        // res.redirect(`/detail-job/${jobId}`);
    } else {
        res.render('template/notFound.ejs');
    }
})


router.get('/change-active/:id', async (req, res)=>{
    var jobId = req.params.id;
    var user = req.session.user;

    if(user.role === 'Nhà tuyển dụng'){
        var myJob = await JobFreelance.findById(jobId);
        var inActive = myJob.inActive;

        var updatedJob = await JobFreelance.updateOne({_id: jobId},
            {$set : {inActive: !inActive}},
            {$new: true}   
        );

        res.redirect(`/employer/detail-job/${jobId}`);
    } else {
        res.render('template/notFound.ejs');
    }
})


router.post('/upfile', upload.any(), async (req, res) => {
    console.log('===========gui file=============');
    var fileName = req.files[0].originalname;
    var fileType = req.files[0].mimetype;
    var splitter = fileType.split("/");
    var type = splitter[0];
    listFile.push({
        type: type,
        fileType: fileType,
        name: fileName
    });
    console.log('listFile', listFile);
})

router.post('/comment/:idjob', upload.any(), async (req, res) => {
    var user = req.session.user;
    var job = req.params.idjob;
    var listFile = [];
    var fileArr = [];
    var list = req.files;

   
    
    for(let i in list){
        var fileName = list[i].originalname;
        var fileType = list[i].mimetype;
        var path = `/${list[i].path}`;
        var splitter = fileType.split("/");
        var type = splitter[0];

        listFile.push({
            type: type,
            fileType: fileType,
            name: fileName,
            path: path
        });
        console.log('listFile', listFile);
    }
    
    
    if(user.role === "Nhà tuyển dụng"){
        var comment = req.body.comment;
        var creator = user._id;
        // var creator = "5eb38682c3f896ebcdb6c374";
        fileArr = listFile;
        console.log('listFile', listFile);
        var newCmt = new Report({
            comment: comment,
            job: job,
            creator: creator,
            file: fileArr,
        });
        var savedCmt = await newCmt.save();
        
        var newComment = await Report.findById(savedCmt._id).populate({path: "creator job"});
            
        var commentedAt = moment(newComment.createdAt).fromNow();
        newComment = {
            _id: newComment._id,
            comment: newComment.comment,
            job: newComment.job,
            creator: newComment.creator,
            file: newComment.file,            
            createdAt: commentedAt,
            updatedAt: newComment.updatedAt
        }
    
        listFile = [],
        res.json( {
            comment: newComment,
            user: user
        })
        
        // res.render('employer/report-job', {
        //     comment: savedCmt,
        //     user: user
        // })
        // res.json( {
        //     comment: savedCmt,
        //     user: user
        // })
        // res.redirect(`/employer/detail-job/${job}`);
    } else{
        res.render('template/notFound.ejs')
    }
})

router.get('/delete-comment/:id', async (req, res)=> {
    var user = req.session.user;
    var idcmt = req.params.id;

    var rp = await Report.findById(idcmt);
    var job = rp.job;
    if(user.role === "Nhà tuyển dụng"){
        console.log(idcmt);
        try {
            await Report.deleteOne({
                _id: idcmt
            })
            res.send('Xóa Thành Công!')
        } catch (error) {
            console.log('Không xóa được');
        }
    } else{
        res.render('template/notFound.ejs')
    }
})


module.exports = router;