var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var User = require("./models/user");
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");

require('dotenv').config();

const session = require("express-session");
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;

var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site

var app = express();

//SocketIO
var server = require('http').Server(app);
var io = require('socket.io')(server);

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
  
passport.use(
  new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  }, function (username, password, done) {
    User.findOne({ email: username }, (err, user) => {
      if (err) { 
        return done(err);
      };
      if (!user) {
        return done(null, false, { msg: "Incorrect email" });
      }
      bcrypt.compare(password, user.password, (err, result) => {
      	if(result) {
      		return done(null, user);
      	} else {
      		return done(null, false, {msg: "Incorrect password"})
      	}
      })
      
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
  });
});

app.use('/', catalogRouter);


io.on("connection", (socket) => {
  console.log("a user is connected");

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  /*
  socket.on("message", (msg) => {
    console.log("recieve message");
    io.emit("message", msg);
  })

  socket.on("sendmsg", (msg) => {
    console.log(msg);
  })
  */

  socket.on("disconnect", () => {
    console.log("User disconnected");
  })
  
})


// pass user object and socket object
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.io = io;
  next();
});

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

module.exports = {app: app, server: server};
