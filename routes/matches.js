var express = require('express');
var router = express.Router();
var dam = require('../db/dataAccessManager');
var getSelectFormatter = require('../db/selectFormatter');
let addMatchFormConfig = {
  match: {
    namespace: true,
    label: 'Match',
    is_team: {
      label: 'Team Smash',
      tag: 'input',
      type: 'checkbox',
      value: '1',
      required: false
    },
    date: {
      label: 'Date',
      tag: 'input',
      type: 'date',
      value: new Date().toISOString().substr(0, 10),
      required: true
    },
    stocks: {
      label: 'Stocks',
      tag: 'input',
      type: 'number',
      value: '3',
      required: true
    },
    time: {
      label: 'Time',
      tag: 'input',
      type: 'time',
      value: '00:06:00',
      extra: {step: 2},
      required: false
    },
    time_remaining: {
      label: 'Time remaining',
      tag: 'input',
      type: 'time',
      value: '',
      extra: {step: 2},
      required: false
    },
    stage_id: {
      label: 'Stage',
      tag: 'select',
      data: [],
      value: '',
      required: false
    }
  },
  user: {
    namespace: true,
    label: 'User',
    is_winner: {
      label: 'Winner',
      tag: 'input',
      type: 'checkbox',
      value: '1',
      required: false
    },
    repeat: 4,
    user_id: {
      label:' Player',
      tag: 'select',
      data: [],
      value: '',
      required: true
    },
    character_id: {
      label: 'Character',
      tag: 'select',
      data: [],
      value: '',
      required: true
    },
    team_id: {
      label: 'Team',
      tag: 'select',
      data: [],
      value: '',
      required: false
    }
  }
};

router.get('/', function(req, res, next) {
  let pageSize = Math.abs(parseInt(req.query.pageSize) || 50);
  let page = Math.abs(parseInt(req.query.page, 10) || 1);

  res.json(dam.matches.order('id').page(pageSize, page));
});

router.get('/add', function(req, res, next) {
  require('../renderForm')(res, addMatchFormConfig, function(err, formHtml){
    res.render('matches/add', { title: 'Add a match', form: formHtml });
  });
});

router.post('/add', function(req, res, next) {
  let data = req.body;
  let match = {
    date: data.date,
    stocks: data.stocks,
    stage_id: data.stage_id,
    match_time: data.match_time,
    match_time_remaining: data.match_time_remaining,
    is_team: data.is_team
  };


  /*dbPool.query('INSERT INTO user(tag, password) VALUES (?, ?)', [data.username, hash], function (error, results, fields) {
    if (error) throw error;
  });*/
});

function initFormData() {
  let users = dam.users;
  let stages = dam.stages;
  let teams = dam.teams;
  let characters = dam.characters;

  let formatter = getSelectFormatter('name', 'id');
  let userFormatter = getSelectFormatter('tag', 'id');

  addMatchFormConfig.match.stage_id.data = formatter(stages);
  addMatchFormConfig.user.team_id.data = formatter(teams);
  addMatchFormConfig.user.character_id.data = formatter(characters);
  addMatchFormConfig.user.user_id.data = userFormatter(users);

  dam.emitter.on('refresh.stages', function(data){addMatchFormConfig.match.stage_id.data = formatter(data);});
  dam.emitter.on('refresh.teams', function(data){addMatchFormConfig.user.team_id.data = formatter(data);});
  dam.emitter.on('refresh.characters', function(data){addMatchFormConfig.user.character_id.data = formatter(data);});
  dam.emitter.on('refresh.users', function(data){addMatchFormConfig.user.user_id.data = userFormatter(data);});
}

initFormData();

/**
 * @param callback
 */

module.exports = router;
