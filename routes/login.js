var express = require('express');
var router = express.Router();
let passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    authorized: false,
    structure: {
      'tag': 'string',
      'password': 'string'
    }
  });
});

router.get('/ok', function(req, res, next) {
  res.json({
    authorized: true
  })
});

router.get('/error', function(req, res, next) {
  res.json({
    authorized: false
  })
});

module.exports = router;
