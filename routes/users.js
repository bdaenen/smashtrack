let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');

let User = require('../db/models/User');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');
let SelectResponse = require('../api/SelectResponse');

/**
 *
 */
router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);

    let users = await User.getList(req);
    res.json(new ApiResponse(users));
});

/**
 *
 */
router.get('/select', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);

    let users = await User.getList(req);
    res.json(new SelectResponse(users));
});

router.get('/me/boards', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);
    let user = await User.query().where('id', '=', req.user.id).first();
    req.order = 'board.' + req.order;

    let boards = await req.applyRequestParamsToQuery(
      user.$relatedQuery('boards')
    );

    res.json(new ApiResponse(boards));
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
        res.status(400);
        return res.json({success: false, error: 'A password is required!'});
    }
    try {
        let success = await dam.updateUser(req.user, {password: req.body.password});
        res.json({success: success});
    }
    catch (error) {
        res.status(400);
        res.json({success: false, error: error.message});
    }
});

module.exports = router;
