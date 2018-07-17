var express = require('express');
var router = express.Router();
let passport = require('passport');

router.get('/', function(req, res, next) {
  res.json({
    authenticated: req.isAuthenticated(),
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

module.exports = router;
