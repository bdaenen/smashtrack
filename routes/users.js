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

    res.json(dam.users.order(order, orderDirection).page(pageSize, page));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json(dam.users.filter({id: parseInt(req.params.id, 10)}).page(10, 1));
});

router.post('/change_password', async function(req, res) {
    if (!req.body || !req.body.password) {
        return res.json({success: false, error: 'A password is required!'});
    }
    try {
        let success = await dam.updateUser(req.user, {password: req.body.password});
        res.json({success: success});
    }
    catch (error) {
        res.json({success: false, error: error.message});
    }
});

module.exports = router;
