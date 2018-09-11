let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');

/**
 *
 */
router.get('/', function(req, res) {
    if (!permissions.checkAdminPermission(req, res)){return}

    res.json({
        admin_routes: {
            '/cc': 'Refreshes data from the DB',
            '/users/add': 'Add a user',
            '/users/delete': 'Delete a user (not yet implemented)',
            '/users/update': 'Change a user (not yet implemented)'
        }
    });
});

/**
 * Clear the DAM cache.
 */
router.get('/cc', function(req, res) {
    if (!permissions.checkAdminPermission(req, res)){return}
    dam.loadData();
    res.json({success: true});
});

/**
 * Add a user.
 */
router.post('/users/add', function(req, res) {
    if(!permissions.checkAdminPermission(req, res)){return}
    let data = req.body;
    try {
        dam.createUser(data, function(err, success) {
            if (!err.length && success) {
                res.json({success: true});
            }
            else {
                res.status(400);
                res.json({success: false, errors: err});
            }
        });
    }
    catch (err) {
        res.status(400);
        res.json({success: false, error: err.message});
    }
});

/**
 * Return the structure for adding a user.
 */
router.get('/users/add', function(req, res) {
    if(!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addUser')});
});

/**
 * Delete a user.
 */
router.post('/users/delete', function(req, res) {
    if(!permissions.checkAdminPermission(req, res)){return}
    res.json({error: 'not yet implemented'});
});

module.exports = router;
