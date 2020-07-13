const jwt = require('jsonwebtoken');
const multer = require('multer');

exports.auth = (req, res, next) => {
    const token = req.header('auth-token');
    if(!token) return res.status(400).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}

exports.requiresLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.json({err: 'You must be logged in to view this page.'});
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, './public/upload')
        cb(null, './upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname); // Date.now() + 
    }
})

var fileFilter = (req, file, cb) => {
    if(file.minetype === 'image/jpg' || file.minetype === 'image/png' ){
        cb(null, true);
    } else {
        cb(null, false);
    }
}
  
exports.upload = multer({
    storage: storage,
    // limits: {
    //     fieldSize: 1024 * 1024 * 10
    // },
    // fileFilter: fileFilter
});
