let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');
let SelectResponse = require('../api/SelectResponse');
let Character = require('../db/models/Character');

/**
 *
 */
router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}

    req = new ApiRequest(req);

    let characters = await Character.getList(req);
    res.json(new ApiResponse(characters));
});

/**
 *
 */
router.get('/select', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);

    let characters = await Character.getList(req);
    res.json(new SelectResponse(characters));
});


/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json(dam.characters.filter({id: parseInt(req.params.id, 10)}));
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
