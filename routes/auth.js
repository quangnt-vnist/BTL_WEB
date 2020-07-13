const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, requiresLogin } = require('./middleware');
const { registerValidate, loginValidate } = require('../validation');

// SIGN UP
router.get('/signup', (req, res)=>{
    res.render('auth/signup', {title: "Sign Up"});
})

router.post('/signup', async (req, res) => {
    // console.log('--body--', req.body);
    // Validate Sign up
    const { error } = registerValidate(req.body);
    if (error){
        console.log(`${error.details[0].message}`);
        //  return res.status(400).send(error.details[0].message);
    }

    // Checking if the user aldready exist
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) {
        console.log('Email has aldready exist!');
        // return res.status(400).send("Email has aldready exist!");
    }
    // Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // Create user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPass,
        role: req.body.role,
        // sex: req.body.sex
    });
    try {
        const savedUser = await user.save();
        // res.status(200).send(savedUser);
        // res.render('auth/login', {title: "login after signup"});
        res.redirect('login');
    } catch (err) {
        // res.status(400).send(err);
        console.log('ERROR');
    }
});

// LOGIN
router.get('/login', (req, res) =>{
    res.render('auth/login', {title: 'Login'});
});

router.post('/login', async (req, res) => {// auth,
    // console.log('body', req.body);
    // Validate Login
    const { error } = loginValidate(req.body);
    if (error){
        console.log(`${error.details[0].message}`);
        // return res.status(400).send(error.details[0].message);
    } 

    // Checking if the user aldready exist
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        console.log('Email NotFound!===================');
        // return res.status(400).send("Email NotFound!");
    }

    // Check if pass correct
    const validPass = await bcrypt.compare(req.body.password, user.password, (err, result) =>{
        if(result === true){
            req.session.user = user;
            // res.render('home', {title: "Home Login" ,user: req.session.user});
            res.redirect('/');

            // res.render('home', {title: "Home Login" ,user: user});

            // if(user.hasDetail === -1){
            //     if(user.role === 'Nhà tuyển dụng'){
            //         res.render('detail-user/createDetailEmployer', {title: "Thông tin nhà tuyển dụng" ,user: req.session.user})
            //     }
            //     else if( user.role === 'Ứng viên'){
            //         res.render('detail-user/createDetailCandidate', {title: "Thông tin ứng viên" ,user: req.session.user})
            //     }
            // }
            // else{
            //    res.render('home', {title: "Home Login" ,user: req.session.user});
            // }
            
        }else{
            // return res.status(400).json({err: 'Invalid Password'})
            console.log('Invalid Password');
        }
    });
    
});


// LOG OUT
router.get('/logout', requiresLogin, (req, res) => {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return res.json({err});
            } else {
                // return res.json({'logout': "Success"});
                res.redirect('/');
            }
        });
    }
});


module.exports = router;