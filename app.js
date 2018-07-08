var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require("express-session");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({ secret: "munK84xMJp6pe693kTJcbKqB", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  if (req.url === '/login' || req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/login');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    let dbPool = require('./db');
    let bcrypt = require('bcrypt');
    dbPool.query('SELECT * FROM user WHERE tag = ?', [username], function(error, results, fields) {
      let user = results[0];
      if (!user) {
        return done(null);
      }
      bcrypt.compare(password, user.password, function(error, res) {
        if (res) {
          console.log('authenticated!');
          done(null, user);
        }
        else {
          console.log(error);
          done(error);
        }
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  require('./db').query('SELECT * FROM user WHERE id = ?', [id], function(error, results, fields){
    done(error, results[0]);
  });
});

// Moving this to the login router breaks stuff...?
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);


app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/users', usersRouter);

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


module.exports = app;
