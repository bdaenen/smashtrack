let express = require('express');
let router = express.Router();
let permissions = require('../lib/permissions');
let _ = require('lodash');

// Router-specific
let Board = require('../db/models/Board');
let ApiRequest = require('../api/ApiRequest');
let ApiResponse = require('../api/ApiResponse');
let SelectResponse = require('../api/SelectResponse');
let ApiPostResponse = require('../api/ApiPostResponse');

router.get('/', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}

    req = new ApiRequest(req);
    let boards = await Board.getList(req);

    res.json(new ApiResponse(boards));
});

/**
 *
 */
router.get('/select', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    req = new ApiRequest(req);

    let boards = await Board.getList(req);
    res.json(new SelectResponse(boards));
});


router.post('/add', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    req = new ApiRequest(req);
    let uuid = require('../lib/uuid');

    try {
        // TODO: refactor to Board.upsertFromApi
        let graph = {
            name: req.data.name,
            uuid: uuid('board'),
            admins: [{
                '#dbRef': req.user.id,
                is_admin: 1
            }],
            users: []
        };

        if (req.data.stages && Array.isArray(req.data.stages)) {
            graph.stages = [];
            req.data.stages.forEach(function(stageId) {
                if (parseInt(stageId)) {
                    graph.stages.push({
                        id: +stageId
                    });
                }
            });
        }

        if (req.data.users && Array.isArray(req.data.users)) {
            req.data.users.forEach(function(userId) {
                if (parseInt(userId) && parseInt(userId) !== req.user.id) {
                    graph.users.push({
                        id: +userId
                    });
                }
            });
        }

        const newBoard = await Board
          .query()
          .upsertGraph(graph, {
              relate: true
          });

        if (newBoard) {
            res.json({success: true, data: new ApiPostResponse(await Board.getDetail(newBoard.id, req))});
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

router.post('/edit', async function(req, res) {
    if (!permissions.checkWritePermission(req, res)){return}
    req = new ApiRequest(req);

    try {
        // TODO: refactor to Board.upsertFromApi
        let graph = {
            id: req.data.id,
            name: req.data.name,
            users: []
        };

        if (req.data.stages && Array.isArray(req.data.stages)) {
            graph.stages = [];
            _.uniq(req.data.stages).forEach(function(stageId) {
                if (parseInt(stageId)) {
                    graph.stages.push({
                        id: +stageId
                    });
                }
            });
        }

        if (req.data.users && Array.isArray(req.data.users)) {
            _.uniq(req.data.users).forEach(function(userId) {
                if (parseInt(userId)) {
                    graph.users.push({
                        id: +userId
                    });
                }
            });
        }

        const updatedBoard = await Board
          .query()
          .upsertGraph(graph, {
              relate: true
          });

        if (updatedBoard) {
            res.json({success: true, data: new ApiPostResponse(await Board.getDetail(updatedBoard.id, req))});
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
