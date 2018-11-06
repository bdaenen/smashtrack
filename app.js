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
let devRouter = require('./routes/dev');

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let session = require('express-session');
let MySQLStore = require('express-mysql-session')(session);

let app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');

let { Model, db} = require('./db/db');

let sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000,
    // 30 days
    expiration: 60*60*24*30*1000,
    createDatabaseTable: true,
    endConnectionOnClose: false,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, db);

// Sessions
app.use(session({
    secret: "munK84xMJp6pe693kTJcbKqB",
    resave: false,
    store: sessionStore,
    name: 'smashtracker',
    saveUninitialized: false,
    cookie : {
        maxAge: 60*60*48*1000,
        secure: parseInt(process.env.IS_HTTPS),
        httpOnly: true,
        domain: process.env.DOMAIN
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

// Don't require a login on dev, otherwise always do + domain check.
if (process.argv.indexOf('dev=1') === -1) {
  app.use(async function(req, res, next) {
    let permissions = require('./lib/permissions');
    if (req.url === '/login' || (req.isAuthenticated() && await permissions.isUserValidForDomain(req.user, req.headers.origin))) {
      next();
    }
    else {
      if (req.isAuthenticated()) {
        req.logout();
      }
      res.redirect('/login');
    }
  });
}

// Passport authentication
passport.use(new LocalStrategy({
    usernameField: 'tag',
  },
  async function(username, password, done) {
    let User = require('./db/models/User');
    let user = await User.query().first().where('tag', '=', username);
    if (await user.verifyPassword(password)) {
      return done(null, user);
    }
    else {
      done(null);
    }
  }
));

// Passport user persistance
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  db.query('SELECT * FROM user WHERE id = ?', [id], function(error, results, fields){
    done(error, results[0]);
  });
});

// Moving this to the login router breaks stuff...?
app.post('/login', function(req, res, next){
  if (req.isAuthenticated()) {
    return res.json({success: false, message: 'You are already logged in. You need to log out before logging in again.'});
  }
  passport.authenticate('local', async function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({authenticated: !!user});
    }
    else {
      let permissions = require('./lib/permissions');
      let allowUserLogin = await permissions.isUserValidForDomain(user, req.headers.origin);
      if (allowUserLogin) {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
          return res.json({authenticated: !!user, user: {id: user.id, tag: user.tag} || {}});
        });
      }
      else {
        return res.json({success: false, error: 'User is not allowed to log in from this origin.'});
      }
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
app.use('/dev', devRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.sendStatus(404);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error(err);
  // render the error page
  res.sendStatus(err.status || 500);
});


module.exports = app;
