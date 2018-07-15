let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');

/**
 *
 */
router.get('/', function(req, res) {
  let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
  let page = Math.abs(parseInt(req.query.page, 10) || 1);

  res.json(dam.teams.order('id').page(pageSize, page));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
  res.json(dam.teams.filter({id: parseInt(req.params.id, 10)}));
});

/**
 *
 */
router.post('/add', function(req, res) {
  res.json({error: 'not yet implemented'});
});

/**
 *
 */
router.get('/add', function(req, res) {
  res.json({error: 'not yet implemented'});
});

/**
 * @param callback
 */

module.exports = router;
