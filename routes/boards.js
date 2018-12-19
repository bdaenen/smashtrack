let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');

// Router-specific
let Boards = require('../db/models/Board');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');

router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}

    let apiRequest = new ApiRequest(req);
    let boards = await Boards.query()
      .orderBy(apiRequest.order, apiRequest.orderDir)
      .page(apiRequest.page, apiRequest.pageSize)
    ;

    res.json(new ApiResponse(boards));
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
router.get('/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addMatch')});
});


module.exports = router;
