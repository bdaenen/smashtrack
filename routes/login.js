var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'SmashTrack' });
});

router.get('/ok', function(req, res, next) {
  res.json({
    'authorized': true
  })
});

router.get('/error', function(req, res, next) {
  res.json({
    'authorized': false
  })
});

module.exports = router;
