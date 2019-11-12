let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');
let SelectResponse = require('../api/SelectResponse');
let Stage = require('../db/models/Stage');

/**
 *
 */
router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)) {
        return;
    }
    req = new ApiRequest(req);

    let stages = await Stage.getList(req);
    res.json(new ApiResponse(stages));
});

/**
 *
 */
router.get('/select', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)) {
        return;
    }
    req = new ApiRequest(req);

    let stages = await Stage.getList(req);
    res.json(new SelectResponse(stages));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
    if (!permissions.checkReadPermission(req, res)) {
        return;
    }
    res.json(dam.stages.filter({ id: parseInt(req.params.id, 10) }));
});

/**
 *
 */
router.post('/add', function(req, res) {
    if (!permissions.checkWritePermission(req, res)) {
        return;
    }
    res.json({ error: 'not yet implemented' });
});

/**
 *
 */
router.get('/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)) {
        return;
    }
    res.json({ error: 'not yet implemented' });
});

/**
 * @param callback
 */

module.exports = router;
