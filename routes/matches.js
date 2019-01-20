let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');
let ApiPostResponse = require('../api/ApiPostResponse');
let Match = require('../db/models/Match');

router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}

    req = new ApiRequest(req);

    let matches = await Match.getList(req);
    res.json(new ApiResponse(matches));
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
router.get('/:id(\\d+)', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);

    res.json(
      new ApiResponse(
          await req.applyRequestParamsToQuery(
            Match.query().eager(Match.eagerDetailFields)
              .where('match.id', req.params.id)
          )
      )
    );
});

/**
 *
 */
router.post('/add', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    req = new ApiRequest(req);

    try {
        let newMatch = await Match.upsertFromApi(req);

        if (newMatch) {
            res.json({success: true, data: new ApiPostResponse(await Match.getDetail(newMatch.id, req))});
        }
        else {
            throw new Error('Something went wrong while inserting a match.');
        }
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
