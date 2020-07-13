const router = require('express').Router();
const User = require('../models/user');
// const multer = require('multer');
const upload = require('./middleware').upload;
router.get('/', async (req, res) => {
    var sessionUser = req.session.user;
    var user;
    if(sessionUser){
        user = await User.findById(sessionUser._id);
        console.log('user', user);
    }    

    res.render('home', {title: 'Trang chủ', user: user});
});

router.get('/test', (req, res) => {
    res.render('test', {title: 'Home page', user: req.session.user});
    // res.redirect('/')
});

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/upload')
//         // cb(null, './')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// })

// var fileFilter = (req, file, cb) => {
//     if(file.minetype === 'image/jpg' || file.minetype === 'image/png' ){
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// }
  
// var upload = multer({
//     storage: storage,
//     // limits: {
//     //     fieldSize: 1024 * 1024 * 10
//     // },
//     // fileFilter: fileFilter
// });

// router.post('/upfile', upload.single('file'), (req, res)=>{
router.post('/upfile', upload.any(), (req, res)=>{
    console.log('data-file', req.files);
    // console.log('data-body', req.body);
    var fileName = req.files[0].originalname;
    var fileType = req.files[0].mimetype;
    var splitter = fileType.split("/");
    var type = splitter[0];
    console.log('file', fileName, fileType, splitter, typeof(type));
    res.redirect('/test')
} )
// router.post('/upfile', upload.single('file'), (req, res)=>{
router.post('/upcmt', (req, res)=>{
    // console.log('data-file', req.files);
    console.log('data-body', req.body);
    res.redirect('/test')
} )

module.exports = router;