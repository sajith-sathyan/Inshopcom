var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require("./config/dbconnect")
var bodyParser = require('body-parser')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
var session = require("express-session")
var app = express();
var hbs = require('hbs');
require('dotenv').config()
console.log(process.env)



//const firebase = require('firebase');
// const partialsPath=path.join(__dirname,'views/partials')
const viewPath=path.join(__dirname,'views')
// view engine setup  
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set("views",viewPath)
hbs.registerPartials(__dirname + '/views/partials');





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({ secret:process.env.SESSION_SECREAT, saveUninitialized: false, resave: false }))
// app.use(fileUpload())
db.connect((err) => {
  if (err) {
    console.log("connection err" + err);
  } else {
    console.log("database connected");
  }
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  res.render("user/404page")
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
