const dbPool = require('./db');
const Emitter = require('events');
const DbSet = require('./DbSet');
const _ = require('lodash');
let changedDatasets = new Set();
let dataRefreshRate = 10 * 1000;

/**
 * Object to be used to access the database.
 * @type {{users: null|DbSet, stages: null|DbSet, characters: null|DbSet, teams: null|DbSet, _runningQueryCount: number, isReady: dataAccessManager.isReady, emitter: *}}
 */
let dataAccessManager = Object.create({
  /**
   * @param callback
   */
  loadData: function(callback) {
    this.loadStages(callback);
    this.loadCharacters(callback);
    this.loadUsers(callback);
    this.loadMatches(callback);
    this.loadTeams(callback);
  },

  /**
   * @param callback
   */
  loadStages: function(callback){
    this._runningQueryCount++;
    dbPool.query('SELECT id, name FROM stage', function(error, results){
      this._runningQueryCount--;
      this.stages = mapDbToDam(results);
      callback && callback(this.stages);
      this.emitter.emit('refresh.stages', this.stages);
    }.bind(this));
  },

  /**
   * @param callback
   */
  loadCharacters: function(callback){
    this._runningQueryCount++;
    dbPool.query('SELECT id, name FROM `character`', function(error, results){
      this._runningQueryCount--;
      this.characters = mapDbToDam(results);
      callback && callback(this.characters);
      this.emitter.emit('refresh.characters', this.characters);
    }.bind(this));
  },

  /**
   * @param callback
   */
  loadTeams: function(callback){
    this._runningQueryCount++;
    dbPool.query('SELECT id, name FROM `team`', function(error, results){
      this._runningQueryCount--;
      this.teams = mapDbToDam(results);
      callback && callback(this.teams);
      this.emitter.emit('refresh.teams', this.teams);
    }.bind(this));
  },

  /**
   * @param callback
   */
  loadUsers: function(callback){
    this._runningQueryCount++;
    dbPool.query('SELECT id, tag FROM `user`', function(error, results){
      this._runningQueryCount--;
      this.users = mapDbToDam(results);
      callback && callback(this.users);
      this.emitter.emit('refresh.users', this.users);
    }.bind(this));
  },

  /**
   * @param callback
   */
  loadMatches: function(callback){
    this._runningQueryCount++;
    dbPool.query({nestTables: true, sql: 'SELECT * FROM player' +
      ' INNER JOIN `match` ON player.match_id = `match`.id' +
      ' INNER JOIN `stage` ON `match`.stage_id = stage.id' +
      ' INNER JOIN `user` as author ON `match`.author_user_id = author.id' +
      ' INNER JOIN `user` ON player.user_id = user.id' +
      ' INNER JOIN `character` ON player.character_id = character.id' +
      ' LEFT JOIN `team` ON player.team_id = team.id' +
      ' LEFT JOIN `player_data` ON `player_data`.player_id = player.id'
      },
      function(error, results){
        this._runningQueryCount--;
        let structuredData = {};
        let finalArray = [];

        results.forEach(function(result){
          let datarow = structuredData[result.match.id] = structuredData[result.match.id] || {
            match: {
              id: result.match.id,
              is_team: result.match.is_team,
              date: result.match.date,
              stocks: result.match.stocks,
              time: result.match.match_time,
              time_remaining: result.match.time_remaining,
              stage: result.stage,
              author_user: {id: result.author.id, tag: result.author.tag}
            },
            players: {},
          };

          datarow.players[result.player.id] = datarow.players[result.player.id] || {
            id: result.player.id,
            user: {id: result.user.id, tag: result.user.tag},
            character: result.character,
            team: result.team,
            is_winner: result.player.is_winner,
            data: {}
          };

          if (result.player_data && result.player_data.id) {
            datarow.players[result.player.id].data[result.player_data.key] = result.player_data.value;
          }
        });

        Object.keys(structuredData).forEach(function(key) {
          structuredData[key].players = Object.values(structuredData[key].players);
          finalArray.push(structuredData[key]);
        });

        this.matches = mapDbToDam(finalArray);
        //this.matches = this.structureMa(results);
        callback && callback(this.matches);
        //this.emitter.emit('refresh.matches', this.matches);
    }.bind(this));
  },

  /**
   * @param data
   * @param callback
   */
  createMatch: function(data, callback){
    // This is horrible.
    let callbackCalled = false;
    validateMatchData(data, function(err, success) {
      if (err.length || !success) {
        return callback(err, success);
      }
      // Save the match record
      saveMatch(data.match, function(err, match){
        if (err.length || !match.id) {
          callback(err, false);
        }
        else {
          let stop = false;
          let usersSaving = 0;
          let userDataSaving = 0;
          data.players.forEach(function(player){
            if (stop) {return;}
            player.match_id = match.id;
            usersSaving++;
            // Save the player record
            savePlayer(player, function(err, player){
              usersSaving--;
              if (!usersSaving && !userDataSaving && !callbackCalled) {callbackCalled = true;callback(err, true);return;}
              if (err.length || !player.id) {
                stop = true;
                callback(err, false);
              }
              else {
                //require('fs').writeFileSync('./debug_' + Date.now() + '_player.json', JSON.stringify(player));
                if (player.data) {
                  Object.keys(player.data).forEach(function(key){
                    let data = {
                        key: key,
                        value: player.data[key],
                        player_id: player.id
                      };
                    //require('fs').writeFileSync('./debug_' + Date.now() + '_player_data.json', JSON.stringify(data));
                    if (stop) {return;}
                    userDataSaving++;

                    saveMatchUserData(data, function(err, userData){
                      userDataSaving--;
                      //if (!usersSaving && !userDataSaving && !callbackCalled) {callbackCalled = true;callback(err, true);return;}
                      if (err.length || !userData.id) {
                        stop = true;
                        callback(err, false);
                      }
                    }.bind(this))
                  }, this);
                }
              }
            }.bind(this));
          }, this);
        }
      }.bind(this));

      callback(err, true);
    }.bind(this));
  },

  /**
   * @param data
   * @param callback
   */
  createUser: function(data, callback) {
    validateUserData(data, function(err, success) {
      if (err.length || !success) {
        callback(err, false);
      }

      let bcrypt = require('bcrypt');
      bcrypt.hash(data.password, 12, function(error, hash) {
        if (error) {
          throw error;
        }

        dbPool.query('INSERT INTO user(tag, password) VALUES (?, ?)', [data.tag, hash], function (error, results, fields) {
          if (error) throw error;
        });
        callback(err, true);
        changedDatasets.add('users');
      });
    });
  }
});

dataAccessManager.users = null;
dataAccessManager.stages= null;
dataAccessManager.characters= null;
dataAccessManager.teams= null;
dataAccessManager._runningQueryCount= 0;
dataAccessManager.isReady= function(){
  return this._runningQueryCount === 0;
};
dataAccessManager.emitter= new Emitter();

/**
 * @param data
 * @param callback
 */
function saveMatch(data, callback) {
  dbPool.query(
    'INSERT INTO `match` (`date`, stocks, stage_id, match_time, match_time_remaining, is_team, author_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      data.date || null,
      data.stocks,
      data.stage_id,
      data.time || null,
      data.time_remaining || null,
      +!!data.is_team,
      data.author_user_id
    ],
    function(sqlerr, results, fields){
      sqlerr = sqlerr ? [sqlerr] : [];
      data.id = results.insertId;
      callback(sqlerr, data);
      changedDatasets.add('matches');
    }
  );
}

/**
 * @param data
 * @param callback
 */
function savePlayer(data, callback) {
  dbPool.query(
    'INSERT INTO `player` (match_id, user_id, character_id, team_id, is_winner) VALUES (?, ?, ?, ?, ?)',
    [
      data.match_id,
      data.user_id,
      data.character_id,
      data.team_id || null,
      +!!data.is_winner
    ],
    function(data){
      return function(sqlerr, results, fields) {
        sqlerr = sqlerr ? [sqlerr] : [];
        data.id = results.insertId;
        callback(sqlerr, data);
        changedDatasets.add('matches');
      }
    }(data)
  );
}

/**
 * @param data
 * @param callback
 */
function saveMatchUserData(data, callback) {
  dbPool.query(
    'INSERT INTO `player_data` (player_id, `key`, value) VALUES (?, ?, ?)',
    [
      data.player_id,
      data.key,
      data.value
    ],
    function(sqlerr, results, fields) {
      sqlerr = sqlerr ? [sqlerr] : [];
      data.id = results.insertId;
      callback(sqlerr, data);
      changedDatasets.add('matches');
    }
  );
}

/**
 * Reload changed data
 */
function checkData() {
  if (changedDatasets.size) {
    changedDatasets.forEach(function(value){
      let funcName = 'load' + value[0].toUpperCase() + value.slice(1);
      dataAccessManager[funcName]();
    });
    changedDatasets.clear();
  }
}

/**
 * @param data
 * @param callback
 * @returns {*}
 */
function validateUserData(data, callback) {
  let errors = [];
  let requiredFields = [
    'tag',
    'password',
    'password_confirmation'
  ];

  let missingData =_.difference(requiredFields, Object.keys(data));
  if (missingData.length) {
    errors.push([{msg: 'Missing data', param: missingData}]);
  }

  Object.keys(data).forEach(function(key){
    if (key.endsWith('_confirmation')) {
      let matchingKey = key.substr(0, key.lastIndexOf('_confirmation'));
      if (data[key] !== data[matchingKey]) {
        errors.push({param: key, param2: matchingKey, msg: 'parameters should match.'});
      }
    }
  });

  if (errors.length) {
    return callback(errors, false);
  }

  return callback(errors, true);
}

/**
 * TODO: validate based on addMatch structure
 * @param data
 * @param callback
 * @returns {*}
 */
function validateMatchData(data, callback){
  let requiredFields = ['match', 'players'];
  let requiredMatchFields = [
    'stocks',
    'stage_id',
    'author_user_id'
  ];
  let requiredUserFields = [
    'user_id',
    'character_id',
    'is_winner'
  ];
  let missingData;
  let missingMatchData;
  let missingUserData;

  missingData =_.difference(requiredFields, Object.keys(data));
  if (missingData.length) {
    return callback({errors: [{msg: 'Missing data', param: missingData}]}, false)
  }
  missingMatchData = _.difference(requiredMatchFields, Object.keys(data.match));
  if (missingMatchData.length) {
    return callback({errors: [{msg: 'Missing match data', param: missingMatchData}]}, false);
  }
  missingUserData = [];
  data.players.forEach(function(user) {
    let missing = _.difference(requiredUserFields, Object.keys(user));
    if (missing.length) {
      missingUserData.push(missing);
    }
  });

  if (missingMatchData.length) {
    return callback({errors: [{msg: 'Missing user data', param: missingUserData}]}, false);
  }

  return callback([], true);
}

/**
 * @param results
 * @returns {DbSet}
 */
function mapDbToDam(results) {
  return new DbSet(results);
}

dataAccessManager.loadData();

setInterval(checkData, dataRefreshRate);

module.exports = dataAccessManager;
