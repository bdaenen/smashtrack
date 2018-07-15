let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');

/**
 *
 */
router.get('/', function(req, res) {
  let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
  let page = Math.abs(parseInt(req.query.page, 10) || 1);

  res.json(dam.matches.order('id').page(pageSize, page));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
  res.json(dam.matches.filter({id: parseInt(req.params.id, 10)}));
});

/**
 *
 */
router.post('/add', function(req, res) {
  let data = req.body;

  dam.createMatch(data, function(err, success) {
    if (!err.length && success) {
      res.json({success: true});
    }
    else {
      res.json({success: false, errors: err});
    }
  });
});

/**
 *
 */
router.get('/add', function(req, res) {
  res.json({structure: require('../db/structure/addMatch')});
});

/**
 * @param callback
 */

module.exports = router;
