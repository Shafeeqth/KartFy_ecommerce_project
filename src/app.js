const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();
const nocache = require('nocache');
// const passport = require('passport');
// const facebookStrategy = require('passport-facebook').Strategy;

const app = express();

const adminRouter = require('./routes/adminRouter');
const usersRouter = require('./routes/userRouter');
const googleRouter = require('./routes/googleAuthRouter');
const paymentRouter = require('./routes/paymentRouter.js');

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views/'));
app.use(express.static(path.join(__dirname, '../public')));

// app.use(passport.initialize());
// app.use(passport.session());
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(nocache());
app.use(flash());


//google auth configurations
const passport = require('passport');
require('./helpers/passport-setup.js');
app.use(passport.initialize());
app.use(passport.session());



app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', usersRouter);
app.use('/google', googleRouter);







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

  res.render('404');
});



module.exports = app;
