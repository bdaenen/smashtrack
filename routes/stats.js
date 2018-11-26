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
    let order = req.query.order || 'id';
    let orderDirection = req.query.orderDirection || 'asc';

    res.json(dam.users.order(order, orderDirection).page(pageSize, page));
});

/**
 *
 */
router.get('/user/:id(\\d+)/characters', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    let order = req.query.orderBy || 'character.id';
    let orderDir = req.query.orderDir || 'asc';
    let page = req.query.page || 0;

    let userId = parseInt(req.params.id, 10);
    if (!userId) {
        res.sendStatus(400);
        return;
    }

    let RawApiResponse = require('../api/RawApiResponse');
    let Character = require('../db/models/Character');

    let {raw} = require('objection');
    let players = await Character.query()
      .select([
        'character.id',
        'character.name',
        raw('(COUNT(??) - 1) as ??', ['character.id', 'count'])
      ])
      .leftJoin('player', 'player.character_id', '=', 'character.id')
      .groupBy('character.id')
      .where('user_id', '=', userId)
      .orWhereNull('user_id')
      .orderBy(order, orderDir)
      .page(page, 2000)
    ;

    return res.json(new RawApiResponse(players));
});


module.exports = router;
