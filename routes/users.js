let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');

/**
 *
 */
router.get('/', function(req, res) {
  let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
  let page = Math.abs(parseInt(req.query.page, 10) || 1);
  let order = req.query.order || 'id';
  let orderDirection = req.query.orderDirection || 'asc';

  res.json(dam.users.order(order, orderDirection).page(pageSize, page));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
  res.json(dam.users.filter({id: parseInt(req.params.id, 10)}).page(10, 1));
});

/**
 *
 */
router.post('/add', function(req, res) {
  let data = req.body;
  dam.createUser(data, function(err, success) {
    if (!err.length && success) {
      res.json({success: true});
    }
    else {
      res.json({success: false, errors: err});
    }
  });
});

router.get('/add', function(req, res) {
  res.json({structure: require('../db/structure/addUser')});
});

module.exports = router;
