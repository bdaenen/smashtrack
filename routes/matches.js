let express = require('express');
let router = express.Router();
let dam = require('../db/dataAccessManager');

/**
 *
 */
router.get('/', function(req, res) {
  let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
  let page = Math.abs(parseInt(req.query.page, 10) || 1);

  res.json(dam.matches.order('id').page(pageSize, page));
});

router.post('/data/add', function(req, res) {
  let data = req.body;

  dam.addMatchData(data, function(err, success){
    if (!err.length && success) {
      res.json({success: true});
    }
    else {
      res.json({success: false, errors: err});
    }
  });
});

router.get('/data/add', function(req, res) {
  res.json({structure: require('../db/structure/addMatchData')});
});

router.post('/', function(req, res) {
  let data = req.body;

  let filters = data.filters;
  let pageSize = Math.abs(parseInt(data.pageSize, 10)) || 50;
  let page = Math.abs(parseInt(data.page, 10)) || 1;

  if (!filters) {
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
  res.json(dam.matches.filter({'match.id': parseInt(req.params.id, 10)}));
});

/**
 *
 */
router.post('/add', async function(req, res) {
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
      res.json({success: false, errors: error.message});
  }
});

/**
 *
 */
router.get('/add', function(req, res) {
  res.json({structure: require('../db/structure/addMatch')});
});


module.exports = router;
