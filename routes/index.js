var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
      endpoints: [
          '/characters',
          '/login',
          '/matches',
          '/stages',
          '/teams',
          '/users'
      ]
  });
});

module.exports = router;
