let express = require('express');
let router = express.Router();
let permissions = require('../lib/permissions');

// Router-specific
let Board = require('../db/models/Board');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');

router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}

    let apiRequest = new ApiRequest(req);
    let boards = await Board.query()
      .orderBy(apiRequest.order, apiRequest.orderDir)
      .page(apiRequest.page, apiRequest.pageSize)
    ;

    res.json(new ApiResponse(boards));
});

router.get('/data/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addMatchData')});
});

router.post('/add', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    let data = req.body;
    let uuid = require('../lib/uuid');

    try {
        const newBoard = await Board
          .query()
          .insert({
              name: data.name,
              uuid: uuid('board')
          });

        if (newBoard) {
            res.json({success: true, data: newBoard});
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
 *
 */
router.get('/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addMatch')});
});


module.exports = router;
