let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
//let flash = require('req-flash');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let loginRouter = require('./routes/login');
let matchesRouter = require('./routes/matches');
let charactersRouter = require('./routes/characters');
let stagesRouter = require('./routes/stages');
let teamsRouter = require('./routes/teams');


let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let session = require("express-session");

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: "munK84xMJp6pe693kTJcbKqB",
  resave: true,
  saveUninitialized: false,
  cookie : {
    maxAge: 60*60*48*1000
  }
}));
//app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.options("/*", function(req, res, next){
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8081");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header("Access-Control-Allow-Credentials", "true");

  res.sendStatus(200);
});

if (process.argv.indexOf('dev=1') === -1) {
  app.use(function(req, res, next) {
    if (req.url === '/login' || req.isAuthenticated()) {
      next();
    }
    else {
      res.redirect('/login');
    }
  });
}

app.use(function(req, res, next) {
  let allowedOrigins = ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:8081', 'http://localhost:8081', 'https://smacker.benn0.be'];
  let origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


passport.use(new LocalStrategy({
    usernameField: 'tag',
  },
  function(username, password, done) {
    let dbPool = require('./db/db');
    let bcrypt = require('bcrypt');
    dbPool.query('SELECT * FROM user WHERE tag = ?', [username], function(error, results, fields) {
      let user = results[0];
      if (!user) {
        return done(null);
      }
      bcrypt.compare(password, user.password, function(error, result) {
        if (result) {
          console.log('authenticated!');
          done(null, user);
        }
        else {
          // result.json({authenticated: false}); //what's this?
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
  require('./db/db').query('SELECT * FROM user WHERE id = ?', [id], function(error, results, fields){
    done(error, results[0]);
  });
});

// Moving this to the login router breaks stuff...?
app.post('/login', function(req, res, next){
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({authenticated: !!user});
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.json({authenticated: !!user, user: {id: user.id, tag: user.tag} || {}});
    });
  })(req, res, next);
});

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/matches', matchesRouter);
app.use('/characters', charactersRouter);
app.use('/stages', stagesRouter);
app.use('/teams', teamsRouter);

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
