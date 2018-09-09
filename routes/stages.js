let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');

/**
 *
 */
router.get('/', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
    let page = Math.abs(parseInt(req.query.page, 10) || 1);
    let order = req.query.order || 'id';
    let orderDirection = req.query.orderDirection || 'asc';

    res.json(dam.stages.order(order, orderDirection).page(pageSize, page));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json(dam.stages.filter({id: parseInt(req.params.id, 10)}));
});

/**
 *
 */
router.post('/add', function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    res.json({error: 'not yet implemented'});
});

/**
 *
 */
router.get('/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({error: 'not yet implemented'});
});

/**
 * @param callback
 */

module.exports = router;
