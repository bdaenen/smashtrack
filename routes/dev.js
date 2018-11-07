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

  let matches = await Match.query().eager('[stage, author, players.[data, character, user, team], data]').page(0, 50);
  // TODO: refactor this to a "Api Response" object of some sorts.
  let results = {
    count: matches.results.length,
    total: matches.total
  };

  results.data = [];
  for (let i = 0; i < results.count; i++) {
    results.data.push(Match.toApi(matches.results[i]));
  }

  res.json(results);
});

/**
 * Add a user.
 */
router.post('/', async function(req, res) {
  let User = require('../db/models/User');

  let dme = await User.query().insert({
    tag: 'DME',

  })
});


module.exports = router;
