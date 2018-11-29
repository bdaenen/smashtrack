let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');

/**
 *
 */
router.get('/', function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    res.json({
        '/user/:id/characters': 'Returns a list of character pick frequency for a given user. Sortable.'
    });
});

/**
 *
 */
router.get('/user/characters', async function(req, res) {
    if (!permissions.checkReadPermission(req, res)){return}
    let ApiRequest = require('../api/ApiRequest');
    
    let apiRequest = new ApiRequest(req);

    let userId = parseInt(req.query.userId, 10);
    
    if (!userId) {
        res.sendStatus(400);
        res.json({err: 400, message: 'A user ID is required'});
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
      .orderBy(apiRequest.order, apiRequest.orderDir)
      .page(apiRequest.page, apiRequest.pageSize)
    ;

    return res.json(new RawApiResponse(players));
});


module.exports = router;
