let express = require('express');
let router = express.Router();
let permissions = require('../lib/permissions');

// Router-specific
let Board = require('../db/models/Board');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');

router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}

    req = new ApiRequest(req);
    let boards = await Board.getList(req);

    res.json(new ApiResponse(boards));
});

router.post('/add', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    req = new ApiRequest(req);
    let uuid = require('../lib/uuid');

    try {
        const newBoard = await Board
          .query()
          .upsertGraph([{
              name: req.data.name,
              uuid: uuid('board'),
              admins: [{
                  '#dbRef': req.user.id,
                  is_admin: 1
              }],
          }], {
              relate: true
          });

        if (newBoard) {
            res.json({success: true, data: await Board.getDetail(newBoard.id)});
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

router.get('/:id(\\d+)', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);
    let board = await Board.getDetail(req.params.id, req);

    return res.json(new ApiResponse(board));
});

router.get('/add', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({structure: require('../db/structure/addMatch')});
});


module.exports = router;
