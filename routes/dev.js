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

  let match = await Match.query().first().where('id', '=', '140').eager('[stage, author, players]');

  res.json(match);
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
