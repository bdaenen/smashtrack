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
let adminRouter = require('./routes/admin');

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let session = require('express-session');

let app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');

// Sessions
app.use(session({
  secret: "munK84xMJp6pe693kTJcbKqB",
  resave: true,
  name: 'smashtracker',
  saveUninitialized: false,
  cookie : {
    maxAge: 60*60*48*1000,
    secure: true,
    httpOnly: true,
    domain: 'smashtrack.benn0.be'
  }
}));
//app.use(flash());

// Init passport
app.use(passport.initialize());
app.use(passport.session());

// Set CORS headers
app.use(function(req, res, next) {
  let allowedOrigins = ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:8081', 'http://localhost:8081', 'https://smacker.benn0.be', 'https://smackerboard.benn0.be'];
  let origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Always approve preflight CORS requests.
app.options("/*", function(req, res, next){
  res.sendStatus(200);
});

// Don't require a login on dev, otherwise always do.
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

// Passport authentication
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
          done(null, user);
        }
        else {
          done(null);
        }
      });
    });
  }
));

// Passport user persistance
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
    else {
        let dbPool = require('./db/db');
        dbPool.query('SELECT * FROM user_allowed_origin WHERE user_id = ?', [user.id], function(error, results, fields) {
          let originMatches = false;
          for (let i = 0; i < results.length; i++) {
            if (results[i].origin === req.headers.origin) {
              originMatches = true;
            }
          }
          if (!results.length || originMatches) {
              req.logIn(user, function(err) {
                  if (err) {
                      return next(err);
                  }
                  return res.json({authenticated: !!user, user: {id: user.id, tag: user.tag} || {}});
              });
          }
          else {
            console.log(user.tag, 'just logged in.');
            return res.json({success: false, error: 'User is not allowed to log in from this origin.'});
          }
        });
    }
  })(req, res, next);
});

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/matches', matchesRouter);
app.use('/characters', charactersRouter);
app.use('/stages', stagesRouter);
app.use('/teams', teamsRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.sendStatus(404);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.sendStatus(err.status || 500);
});


module.exports = app;
