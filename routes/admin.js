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
router.post('/users/add', async function(req, res) {
    if(!permissions.checkAdminPermission(req, res)){return}
    let data = req.body;
    try {
        let user = await dam.createUser(data);
        if (user) {
            res.json({success: true});
        }
        else {
            res.status(400);
            res.json({success: false});
        }
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

/**
 * Update a user.
 */
router.post('/users/update', async function(req, res) {
    if(!permissions.checkAdminPermission(req, res)){return}
    let data = req.body;
    if (!data || !data.user_id || !data.data) {
        res.status(400);
        return res.json({success: false, error: 'No data was provided, or it was badly structured.'});
    }
    try {
        let user = dam.users.filter({id: data.user_id});
        if (!user.length) {
            res.status(400);
            return res.json({success: false, error: 'No user found with the given ID.'});
        }

        let success = await dam.updateUser(user.first(), data.data);
        res.json({success: success});
    }
    catch (error) {
        res.status(400);
        res.json({success: false, error: error.message});
    }
});

module.exports = router;
