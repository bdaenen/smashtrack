var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SmashTrack', userTag: req.user.tag });
});

module.exports = router;
