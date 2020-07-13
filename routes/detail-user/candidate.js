const router = require('express').Router();
const User = require('../../models/user');
// cosnt mongoose = require('mongoose');
const mongoose = require('mongoose');
const DetailCandidate = require('../../models/detailCandidate');
const DetailEmployer = require('../../models/detailEmployer');
const JobFreelance = require('../../models/jobFreelance');
const ContractFreeLance = require('../../models/contractFreelance');
const Report = require('../../models/report');
const upload = require('../middleware').upload;
const moment = require('moment');
moment.locale('vi');

router.get('/candidate-info', async (req, res) => {
    const user = req.session.user;
    if(user.role === "Ứng viên"){
        try{
            var myUser = await User.findOne({_id: user._id});
            var detail = await DetailCandidate.findOne({user: user._id})
            .populate('user');
            console.log('detail', detail);
            res.render('detail-user/showDetailCandidate.ejs', {
                title: "Thông tin chi tiết ứng viên",
                detail: detail,
                user: myUser
            });
        } catch {
            res.status(400).send('error');
        }
    } else {
        res.render('template/notFound.ejs')
    }
    

});

// register xong thi chuyen den trang nay
router.get('/create-info', (req, res) => {
    const user = req.session.user;
    if(user.role === "Ứng viên"){
        res.render('detail-user/createDetailCandidate', {title: "Thông tin ứng viên" ,user: req.session.user})
    } else{
        res.render('template/notFound.ejs')
    }
});

router.post('/create-info', async (req, res) => {
    var user = req.session.user;
    console.log('body', req.body);
    if(user.role === "Ứng viên"){
        var birthData = req.body.birthday;
        console.log(birthData);
        var birth = birthData.split("/");
        console.log(birth);
        var dateOfBirth = new Date(birth[2], birth[1]-1, birth[0]);

        const detailCandidate =  new DetailCandidate ({
            user: user._id,
            // user: req.body.user,
            birth: dateOfBirth,
            address: req.body.address,
            sex: req.body.sex,
            experience: req.body.experience,
            specialized: req.body.specialized,
            skill: req.body.skill,
            description: req.body.description,
            freelanceInfo: {
                priorityWork: req.body.priorityWork,
                salary: req.body.salary
            }
        });
        try {
            const detail = await detailCandidate.save();
            const updateUser = await User.updateOne({ _id: user._id },
            // const user = await User.updateOne({ _id: req.body.user, },
                { $set: { hasDetail: 1, detail: detail._id } },
                { new: true }
            );
            res.redirect('candidate-info');
            // res.json({detail});
        } catch (err) {
            res.status(400).send(err);
        }
    } else{
        res.render('template/notFound.ejs')
    }
});

// router.post('/update-info', upload.single('file'), async (req, res) => {
router.post('/update-info', async (req, res) => {
    var user = req.session.user;

    if(user.role === "Ứng viên"){
        var birthData = req.body.birthday;
        console.log(birthData);
        var birth = birthData.split("/");
        console.log(birth);
        var dateOfBirth = new Date(birth[2], birth[1]-1, birth[0]);

        var freelanceInfo = {
            priorityWork: req.body.priorityWork,
            salary: req.body.salary
        }
        try {
            const updateInfo = await DetailCandidate.updateOne ( {user: user._id} , {$set : {
                    user: user._id,
                    // user: req.body.user,
                    birth: dateOfBirth,
                    address: req.body.address,
                    sex: req.body.sex,
                    experience: req.body.experience,
                    specialized: req.body.specialized,
                    skill: req.body.skill,
                    description: req.body.description,
                    freelanceInfo: freelanceInfo
                }},
                {$new: true}
            );
        
            // var updateUser = await User.updateOne({_id : user._id}, {$set:{
            //         avatar: req.file.originalname
            //     }},
            //     {$new: true}
            // )


            res.redirect('candidate-info');
            // res.json({detail});
        } catch (err) {
            res.status(400).send(err);
        }
    } else {
        res.render('template/notFound.ejs')
    }
});


router.get('/show-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === "Ứng viên"){
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);
        console.log('page, perpage', page, perpage);
        var name = req.query.name ? req.query.name : "";
        var level = req.query.level ? req.query.level : "";
        var field = req.query.field ? req.query.field : "";
        // console.log('name-leve-field', name, level, field);
        // console.log('query', req.query);
        try {

            var keySearch = {
                inActive: 1,
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
                .sort({ createdAt: 1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
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
            res.status(200).render('candidate/show-job.ejs', {
                title: "Tìm kiếm công việc",
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
        res.render('template/notFound.ejs')
    }
});

router.post('/show-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === "Ứng viên"){
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
                .sort({ createdAt: -1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
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
            res.status(200).render('candidate/listdata.ejs', {
                title: "Tìm kiếm công việc",
                user: req.session.user,
                job: job,
                currentPage: page,
                totalPages: totalPages,
                nameBody: name,
                levelBody: level,
                fieldBody: field,
                totalCount: totalCount
            });
        } catch{
            console.log('err');
        }
    } else {
        res.render('template/notFound.ejs')
    }
});


router.get('/job-info/:id', async (req, res) => {
    var jobId = req.params.id;
    var user = req.session.user;
    var status="";
    var message="";
    
    if(user.role === "Ứng viên"){

        var contract = await ContractFreeLance.findOne({
            // candidate: "5eb38616c3f896ebcdb6c372",
            candidate: user._id,
            jobFreelance: jobId
        });
        // console.log('contract ===', contract);
        if( !contract) status = ""; // contract === null
        else if(contract && contract.confirm === 3) status = "participate";
        else if(contract && contract.confirm === 2) status = "favorite";
        else if(contract && contract.confirm === 1) status = "invited"; 
        

        message = contract && contract.message;
        console.log('message', contract,  message);
        var job = await JobFreelance.findOne({_id: jobId}).populate({path: "creator"});
        var creatorId = job.creator._id;
        var jobCreatedAt = moment(job.createdAt).fromNow();
        // console.log(creatorId);
        var creator = await DetailEmployer.findOne({user: creatorId}).populate({path: "user"})

        var comments = await Report.find(
            {
                job: jobId
            }).populate({path: "creator job"});
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
        
        res.render("candidate/job-info.ejs", {
            title: job.name,
            creator: creator,
            user: user,
            job: job,
            status: status,
            message: message,
            comment: comments,
            jobCreatedAt: jobCreatedAt
        })
        // res.json({
        //     title: job.name,
        //     creator: creator,
        //     user: user,
        //     job: job,
        //     status: status,
        //     message: message,
        //     comment: comments,
        //     jobCreatedAt: jobCreatedAt
        // })
    } else {
        res.render('template/notFound.ejs')
    }
})

router.get('/show-favorite-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === "Ứng viên"){

        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var allInfoOfJob = await ContractFreeLance.find({
                // jobFreelance: jobId,
                // candidate: "5eb38616c3f896ebcdb6c372",
                candidate: user._id,
                confirm: 2,
                // message: null
                
                // TODO: điều kiện điền vào đây, để cho tìm kiếm sau này,
            })
                // .sort({'createdAt' : 'asc'}) // mới lập thì xếp cuối vì createAt lớn
                // sxep tăng dần, desc là giảm dần // hoặc dùng sort({ createdAt : 1 }) // 1 tăng dần, -1 giảm dần
                .sort({ createdAt: -1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
                .populate({ path: "jobFreelance", populate: {path: "creator", populate: {path:'detail', model: DetailEmployer }} });
            var totalCount = await ContractFreeLance.count({
                // jobFreelance: jobId,
                candidate: user._id,
                // candidate: "5eb38616c3f896ebcdb6c372",
                confirm: 2,
                // message: null
                
            });
            var totalPages = Math.ceil(totalCount / perpage);
            
            var job = allInfoOfJob;
            for(let i in job){
                
                job[i] = {
                    field: job[i].jobFreelance.field,
                    inActive: job[i].jobFreelance.inActive,
                    _id: job[i].jobFreelance._id,
                    name: job[i].jobFreelance.name,
                    description: job[i].jobFreelance.description,
                    budget: job[i].jobFreelance.budget,
                    timeOfWork: job[i].jobFreelance.timeOfWork,
                    levelOfCandidate: job[i].jobFreelance.levelOfCandidate,
                    creator: job[i].jobFreelance.creator,
                    createAt: moment(job[i].jobFreelance.createAt).fromNow(),
                    createdAt: moment(job[i].jobFreelance.createdAt).fromNow(),
                    updatedAt: job[i].jobFreelance.updatedAt
                }
            }
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
            res.status(200).render('candidate/favorite-job.ejs', {
                title: "Công việc đang quan tâm",
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
        res.render('template/notFound.ejs')
    }
});

router.get('/show-participate-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;
    
    if(user.role === "Ứng viên"){
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var allInfoOfJob = await ContractFreeLance.find({
                candidate: user._id,
                // candidate: "5eb38616c3f896ebcdb6c372",
                confirm: 3,            
            })
                .sort({ createdAt: -1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
                .populate({ path: "jobFreelance", populate: {path: "creator", populate: {path:'detail', model: DetailEmployer }} });
            
            var totalCount = await ContractFreeLance.count({
                candidate: user._id,
                // candidate: "5eb38616c3f896ebcdb6c372",
                confirm: 3,            
            })
            var totalPages = Math.ceil(totalCount / perpage);

            var job = allInfoOfJob;
            for(let i in job){
                
                job[i] = {
                    field: job[i].jobFreelance.field,
                    inActive: job[i].jobFreelance.inActive,
                    _id: job[i].jobFreelance._id,
                    name: job[i].jobFreelance.name,
                    description: job[i].jobFreelance.description,
                    budget: job[i].jobFreelance.budget,
                    timeOfWork: job[i].jobFreelance.timeOfWork,
                    levelOfCandidate: job[i].jobFreelance.levelOfCandidate,
                    creator: job[i].jobFreelance.creator,
                    createAt: moment(job[i].jobFreelance.createAt).fromNow(),
                    createdAt: moment(job[i].jobFreelance.createdAt).fromNow(),
                    updatedAt: job[i].jobFreelance.updatedAt
                }
            }
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages
            // });
            res.status(200).render('candidate/participate-job.ejs', {
                title: "Công việc đang tham gia",
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
        res.render('template/notFound.ejs')
    }
});

router.get('/show-invited-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === "Ứng viên"){
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);
        
        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var allInfoOfJob = await ContractFreeLance.find({
                // jobFreelance: jobId,
                candidate: user._id,
                confirm: 1,
                // message: {$ne: null}
                
            }).sort({ createdAt: -1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
                .populate({ path: "jobFreelance", populate: {path: "creator", populate: {path:'detail', model: DetailEmployer }} });
            var totalCount = await ContractFreeLance.count({
                // jobFreelance: jobId,
                candidate: user._id,
                confirm: 1,
                // message: {$ne: null}
                
            });
            var totalPages = Math.ceil(totalCount / perpage);

            var job = allInfoOfJob;
            for(let i in job){
                
                job[i] = {
                    field: job[i].jobFreelance.field,
                    inActive: job[i].jobFreelance.inActive,
                    _id: job[i].jobFreelance._id,
                    name: job[i].jobFreelance.name,
                    description: job[i].jobFreelance.description,
                    budget: job[i].jobFreelance.budget,
                    timeOfWork: job[i].jobFreelance.timeOfWork,
                    levelOfCandidate: job[i].jobFreelance.levelOfCandidate,
                    creator: job[i].jobFreelance.creator,
                    createAt: moment(job[i].jobFreelance.createAt).fromNow(),
                    createdAt: moment(job[i].jobFreelance.createdAt).fromNow(),
                    updatedAt: job[i].jobFreelance.updatedAt
                }
            }
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages,
                // totalCount: totalCount
            // });
            
            res.status(200).render('candidate/invited-job.ejs', {
                title: "Công việc đang được mời tham gia",
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
        res.render('template/notFound.ejs')
    }
});


router.post('/show-favorite-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === "Ứng viên"){
        console.log('body', req.body);
        var name = req.body.name?req.body.name:"";
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var allInfoOfJob = await ContractFreeLance.find({
                // jobFreelance: "5ed4f674aada0c3f088298f8",
                // candidate: "5ed5007daada0c3f088298fc",
                candidate: user._id,
                confirm: 2,
            })
            .sort({ createdAt: -1 })
            // .skip(perpage*(page-1))
            // .limit(perpage)
            .populate({ 
                path: "jobFreelance",
                match: {name: {$regex: name, $options: 'i'}},
                populate: {path: "creator", populate: {path:'detail', model: DetailEmployer }} 
            });

            allInfoOfJob = allInfoOfJob.filter( e => e.jobFreelance !== null)
            
            var totalCount = allInfoOfJob.length;
            // = await ContractFreeLance.count({
            //     // jobFreelance: jobId,
            //     candidate: user._id,
            //     // candidate: "5eb38616c3f896ebcdb6c372",
            //     confirm: 2,
            //     // message: null
            // });

            var totalPages = Math.ceil(totalCount / perpage);
            
            var job = allInfoOfJob;
            for(let i in job){
                
                job[i] = {
                    field: job[i].jobFreelance.field,
                    inActive: job[i].jobFreelance.inActive,
                    _id: job[i].jobFreelance._id,
                    name: job[i].jobFreelance.name,
                    description: job[i].jobFreelance.description,
                    budget: job[i].jobFreelance.budget,
                    timeOfWork: job[i].jobFreelance.timeOfWork,
                    levelOfCandidate: job[i].jobFreelance.levelOfCandidate,
                    creator: job[i].jobFreelance.creator,
                    createAt: moment(job[i].jobFreelance.createAt).fromNow(),
                    createdAt: moment(job[i].jobFreelance.createdAt).fromNow(),
                    updatedAt: job[i].jobFreelance.updatedAt
                }
            }
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages,
                // totalCount: totalCount
            // });
            res.status(200).render('candidate/listdata.ejs', {
            // res.status(200).render('candidate/favorite-job.ejs', {
                title: "Công việc đang quan tâm",
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
        res.render('template/notFound.ejs')
    }
});

router.post('/show-participate-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;
    
    if(user.role === "Ứng viên"){
        console.log('body', req.body);
        var name = req.body.name
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);

        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var allInfoOfJob = await ContractFreeLance.find({
                candidate: user._id,
                // candidate: "5eb38616c3f896ebcdb6c372",
                confirm: 3,            
            })
                .sort({ createdAt: -1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
                .populate({ 
                    path: "jobFreelance",
                    match: {name: {$regex: name, $options: 'i'}},
                    populate: {path: "creator", populate: {path:'detail', model: DetailEmployer }} 
                });
    
                allInfoOfJob = allInfoOfJob.filter( e => e.jobFreelance !== null)
                
                var totalCount = allInfoOfJob.length;
            // var totalCount = await ContractFreeLance.count({
            //     candidate: user._id,
            //     // candidate: "5eb38616c3f896ebcdb6c372",
            //     confirm: 3,            
            // })
            var totalPages = Math.ceil(totalCount / perpage);

            var job = allInfoOfJob;
            for(let i in job){
                
                job[i] = {
                    field: job[i].jobFreelance.field,
                    inActive: job[i].jobFreelance.inActive,
                    _id: job[i].jobFreelance._id,
                    name: job[i].jobFreelance.name,
                    description: job[i].jobFreelance.description,
                    budget: job[i].jobFreelance.budget,
                    timeOfWork: job[i].jobFreelance.timeOfWork,
                    levelOfCandidate: job[i].jobFreelance.levelOfCandidate,
                    creator: job[i].jobFreelance.creator,
                    createAt: moment(job[i].jobFreelance.createAt).fromNow(),
                    createdAt: moment(job[i].jobFreelance.createdAt).fromNow(),
                    updatedAt: job[i].jobFreelance.updatedAt
                }
            }
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages,
                // totalCount: totalCount
            // });
            res.status(200).render('candidate/listdata.ejs', {
            // res.status(200).render('candidate/participate-job.ejs', {
                title: "Công việc đang tham gia",
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
        res.render('template/notFound.ejs')
    }
});

router.post('/show-invited-job', async (req, res) => {
    // var page = parseInt(req.query.page); // ex: url: /product?page=2&perpage=2
    var user = req.session.user;

    if(user.role === "Ứng viên"){
        console.log('body', req.body);
        var name = req.body.name?req.body.name:"";
        var page = parseInt(req.query.page);
        var perpage = parseInt(req.query.perpage);
        
        var startIndex = (page - 1) * perpage;
        var endIndex = page * perpage;
        try {
            var allInfoOfJob = await ContractFreeLance.find({
                // jobFreelance: jobId,
                candidate: user._id,
                confirm: 1,
                // message: {$ne: null}
                
            }).sort({ createdAt: -1 })
                // .skip(perpage*(page-1))
                // .limit(perpage)
                .populate({ 
                    path: "jobFreelance",
                    match: {name: {$regex: name, $options: 'i'}},
                    populate: {path: "creator", populate: {path:'detail', model: DetailEmployer }} 
                });
    
            allInfoOfJob = allInfoOfJob.filter( e => e.jobFreelance !== null)
                
            var totalCount = allInfoOfJob.length;            
            // var totalCount = await ContractFreeLance.count({
            //     // jobFreelance: jobId,
            //     candidate: user._id,
            //     confirm: 1,
            //     // message: {$ne: null}
                
            // });
            var totalPages = Math.ceil(totalCount / perpage);

            var job = allInfoOfJob;
            for(let i in job){
                
                job[i] = {
                    field: job[i].jobFreelance.field,
                    inActive: job[i].jobFreelance.inActive,
                    _id: job[i].jobFreelance._id,
                    name: job[i].jobFreelance.name,
                    description: job[i].jobFreelance.description,
                    budget: job[i].jobFreelance.budget,
                    timeOfWork: job[i].jobFreelance.timeOfWork,
                    levelOfCandidate: job[i].jobFreelance.levelOfCandidate,
                    creator: job[i].jobFreelance.creator,
                    createAt: moment(job[i].jobFreelance.createAt).fromNow(),
                    createdAt: moment(job[i].jobFreelance.createdAt).fromNow(),
                    updatedAt: job[i].jobFreelance.updatedAt
                }
            }
            // res.status(200).json({
            //     title: "Tìm kiếm công việc",
            //     user: req.session.user,
            //     job: job,
            //     currentPage: page,
            //     totalPages: totalPages,
                // totalCount: totalCount
            // });
            
            res.status(200).render('candidate/listdata.ejs', {
            // res.status(200).render('candidate/invited-job.ejs', {
                title: "Công việc đang được mời tham gia",
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
        res.render('template/notFound.ejs')
    }
});





/**
 * các hàm xử lí lời mời
 */


// router.get('/favorite-job/:id', async(req, res)=>{

// })

router.get('/get-favorite-job/:id', async(req, res)=>{
    var user = req.session.user;
    // var user = req.body.user;
    var jobId = req.params.id;
    console.log('==========================================');

    if(user.role === "Ứng viên"){
        const job = await JobFreelance.findOne({_id: jobId})
        const candidate = await DetailCandidate.findOne({user: user._id}).populate({path: 'user'});

        const contract = new ContractFreeLance({
            jobFreelance: jobId,
            // candidate: user
            candidate: user._id,
            confirm: 2
        })


        const saveContract = await contract.save();

        // res.status(200).json({
        //     title: job.name,
        //     user: user,
        //     job: job,
        //     contract: saveContract,
        //     candidate: candidate
        // })
        res.redirect(`/candidate/job-info/${jobId}`);
    } else {
        res.render('template/notFound.ejs')
    }
})

/**
 * xử lý trong modal các thao tác mời , từ chối, quan tâm đến cviec
 * hiển thị công việc thì sẽ có cái nút để chú ý là đã quan tâm - hay đang thực hiện
 */
router.get('/confirm-invite/:jobid/:candidateid', async(req,res)=>{
    var user = req.session.user;

    if(user.role === "Ứng viên"){

        var jobId = req.params.jobid;
        var candidateId = req.params.candidateid;

        var confirm = await ContractFreeLance.updateOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 1,
                // message: {$ne: null}
            },
            {
                $set : {
                    confirm: 3
                }
            },
            {$new: true}
        )
        res.redirect(`/candidate/job-info/${jobId}`);
    } else {
        res.render('template/notFound.ejs')
    }
})

router.get('/discard-favorite/:jobid/:candidateid', async(req,res)=>{
    var jobId = req.params.jobid;
    var candidateId = req.params.candidateid;
    var user = req.session.user;

    if(user.role === "Ứng viên"){
        var confirm = await ContractFreeLance.deleteOne({
                jobFreelance: jobId,
                candidate: candidateId,
                confirm: 2,
                // message: null
            },
            // {
            //     $set : {
            //         confirm: 1
            //     }
            // },
            // {$new: true}
        )
        res.redirect(`/candidate/job-info/${jobId}`);
    } else {
        res.render('template/notFound.ejs')
    }
})

// router.get('/confirm-job/:jobid/:candidateid', async(req,res)=>{
//     var jobId = req.params.jobid;
//     var candidateId = req.params.candidateid;

//     var confirm = await ContractFreeLance.updateOne({
//             jobFreelance: jobId,
//             candidate: candidateId,
//             confirm: 0,
//             message: null
//         },
//         {
//             $set : {
//                 confirm: 1, 
//                 message: "Chúng tôi đã xem xét và chấp nhận lời mời đề nghị của bạn. Hãy liên hệ với chúng tôi theo email của công ty chúng tôi. Nếu trong vòng 1 tuần, bạn không liên hệ với chúng tôi, thì chúng tôi sẽ hủy hợp đồng với bạn. Cảm ơn bạn!"
//             }
//         },
//         {$new: true}
//     )
//     res.redirect(`/employer/detail-job/${jobId}`);
// })

router.post('/upfile', upload.any(), async (req, res) => {
    var fileName = req.files[0].originalname;
    var fileType = req.files[0].mimetype;
    var splitter = fileType.split("/");
    var type = splitter[0];
    listFile.push({
        type: type,
        name: fileName
    });
    console.log('listFile', listFile);
})

router.post('/comment/:idjob', upload.any(), async (req, res) => {
    var user = req.session.user;
    console.log(typeof(req.params.idjob));
    console.log(req.params.idjob);
    var job = req.params.idjob;
    var fileArr = [];
    var listFile = [];
    
    console.log('listFile', listFile);
    // if(user.role === "Ứng viên"){
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
            // console.log('listFile', listFile);
        }
        // var comment = req.body.comment;
        var comment = req.body.comment;
        var creator = user._id;
        // var creator = "5eb38682c3f896ebcdb6c374";
        fileArr = listFile;
        console.log('listFile', listFile);
        var newCmt = new Report({
            comment: comment,
            // job: mongoose.Types.ObjectId(job),
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
        // res.render('candidate/report-job', {
        //     comment: savedCmt,
        //     user: user
        // })
        // res.redirect(`/candidate/job-info/${job}`);
    // } else{
    //     res.render('template/notFound.ejs')
    // }

    // console.log('req', req.files);
    // res.json({
    //     comment: req.body.comment,
    //     file: req.files
    // })
})

router.get('/delete-comment/:id', async (req, res)=> {
    var user = req.session.user;
    var idcmt = req.params.id;

    var rp = await Report.findById(idcmt);
    var job = rp.job;
    if(user.role === "Ứng viên"){
        // await Report.deleteOne({
        //     _id: idcmt
        // })
        // // res.redirect('trang bao cao')
        // res.redirect(`/candidate/job-info/${job}`);
        // console.log(idcmt);
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