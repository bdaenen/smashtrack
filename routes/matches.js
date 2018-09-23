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
    let order = req.query.sort || 'id';
    let orderDir = req.query.direction || 'asc';

    res.json(dam.matches.order(order, orderDir).page(pageSize, page));
});

router.post('/data/add', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    let data = req.body;

    try {
        let success = await dam.addMatchData(data);
        res.json({success: success});
    }
    catch(err) {
        res.status(400);
        res.json({success: false, error: err.message});
    }
});

router.get('/data/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addMatchData')});
});

router.post('/', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    let data = req.body;

    let filters = data.filters;
    let pageSize = Math.abs(parseInt(data.pageSize, 10)) || 50;
    let page = Math.abs(parseInt(data.page, 10)) || 1;

    if (!filters) {
        res.status(400);
        res.json({success: false, errors: {msg: 'Missing data', param: 'filters'}})
    }

    /**
     * @type DbSet
     */
    let matches = dam.matches;
    filters.forEach(function(filter){
        matches = matches.filter(filter, filter.comparison);
    });

    res.json(matches.page(pageSize, page));
});

/**
 *
 */
router.get('/:id(\\d+)', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json(dam.matches.filter({'match.id': parseInt(req.params.id, 10)}));
});

/**
 *
 */
router.post('/add', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    let data = req.body;
    if (data.match) {
        // We're in prod mode and thus have a user.
        if (process.argv.indexOf('dev=1') !== -1) {
            data.match.author_user_id = req.user.id;
        }
        // We're in dev mode and might not have a user.
        else {
            data.match.author_user_id = (req.user && req.user.id) || 0;
        }
    }

    try {
        let success = await dam.createMatch(data);
        res.json({success: success});
    }
    catch (error) {
        res.status(400);
        res.json({success: false, error: error.message});
    }
});

/**
 *
 */
router.post('/edit', async function(req, res){
    if (!permissions.checkWritePermission(req, res)){return}

    let data = req.body;
    let matchId = req.body.match_id;
    if (!data || !data.data || !matchId) {
        res.status(400);
        return res.json({success: false, error: 'No data was provided, or it was badly structured.'});
    }

    if (data.data.author_user_id) {
        res.status(400);
        res.json({success: false, error: 'An existing match cannot have its author changed.'});
    }

    let match = dam.matches.filter({id: matchId}).first();
    if (!match) {
        res.status(400);
        res.json({success: false, error: 'The given match does not exist.'});
    }

    let success = await dam.updateMatch(match, data.data);
});

/**
 *
 */
router.get('/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addMatch')});
});


module.exports = router;
