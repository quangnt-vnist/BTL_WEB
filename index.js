var createError = require('http-errors');
const express = require('express');
const app = express();
var path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongo')(session);
var logger = require('morgan');

// Import routes
const authRoute = require('./routes/auth');
const home = require('./routes/home');
const employer = require('./routes/detail-user/employer');
const candidate = require('./routes/detail-user/candidate');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error.');
    console.error(err);
    process.exit();
});

mongoose.connection.once('open', () => {
    console.log(`Connected to MongoDB`);
});
var db = mongoose.connection;
// Set views
console.log(__dirname);
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

// path
app.use("/vendor",express.static("/vendor"));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/stylesheets",express.static(__dirname + "/stylesheets"));
app.use("/javascripts",express.static(__dirname + "/javascripts"));
app.use("/images",express.static(__dirname + "/images"));
app.use("/vendor",express.static(__dirname + "/vendor"));
// app.use("/upload",express.static(__dirname + "/upload"));
app.use("/upload",express.static("upload"));

// Session
app.use(session({
    secret: 'freePass',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// Middleware

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// // for parsing application/json
// app.use(bodyParser.json()); 
// // for parsing application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true })); 

// Route middleware
app.use('/', home);
app.use('/auth', authRoute);
app.use('/employer', employer);
app.use('/candidate', candidate);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
  // error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};

// render the error page
res.status(err.status || 500);
res.render('error');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server is running on: http://localhost:' + port));