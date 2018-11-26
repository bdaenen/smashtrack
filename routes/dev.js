let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');
let permissions = require('../lib/permissions');

/**
 *
 */
router.get('/', async function(req, res) {
  let User = require('../db/models/User');

  let bda = await User.query().where('tag', '=', 'BENNO');
  res.json(bda);
});

router.get('/match', async function(req, res) {
  let Match = require('../db/models/Match');

  let match = await Match.query().first().where('id', '=', '140').eager('[stage, author, players.[data, character, user, team], data]');

  res.json(Match.toApi(match));
});

router.get('/matches', async function(req, res) {
  let Match = require('../db/models/Match');
  let ApiResponse = require('../api/ApiResponse');

  let matches = await Match.query().eager('[stage, author, players.[data, character, user, team], data]').page(0, 50);
  // TODO: refactor this to a "Api Response" object of some sorts.

  let data = [];

  for (let i = 0; i < matches.results.count; i++) {
    data.push(Match.toApi(matches.results[i]));
  }

  res.json(new ApiResponse(matches.results, matches.total));
});

/**
 * Add a user.
 */
router.post('/', async function(req, res) {
  let User = require('../db/models/User');

  let dme = await User.query().insert({
    tag: 'DME',
    password: 'wololo'
  });

  res.json(User.toApi(dme));
});


module.exports = router;
