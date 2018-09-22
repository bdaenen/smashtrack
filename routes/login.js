let express = require('express');
let router = express.Router();
let passport = require('passport');

router.get('/', function(req, res, next) {
  let user = null;
  if (req.user) {
    user = {
      tag: req.user.tag,
      id: req.user.id
    };
  }
  res.json({
    authenticated: req.isAuthenticated(),
    user: user,
    structure: {
      'tag': 'string',
      'password': 'string'
    }
  });
});

router.get('/ok', function(req, res, next) {
  res.json({
    authenticated: req.isAuthenticated()
  })
});

router.get('/error', function(req, res, next) {
  res.json({
    authenticated: req.isAuthenticated()
  })
});

router.all('/logout', function (req, res, next) {
    let userName = req.user.tag;
    req.logout();
    res.json({
        success: true,
        message: `See you later, ${userName}!`
    });
});

module.exports = router;
