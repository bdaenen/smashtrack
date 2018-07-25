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
      ' LEFT JOIN `player_data` ON `player_data`.player_id = player.id' +
      ' LEFT JOIN `match_metadata` ON `match_metadata`.`match_id` = `match`.`id`' +
      ' LEFT JOIN `metadata` ON `metadata`.`id` = `match_metadata`.`metadata_id`'
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
              date: result.match.date.toLocaleDateString('be-nl', { year: 'numeric', month: '2-digit', day: '2-digit' }),
              stocks: result.match.stocks,
              time: result.match.match_time,
              time_remaining: result.match.time_remaining,
              stage: result.stage,
              author_user: {id: result.author.id, tag: result.author.tag},
              metadata: {}
            },
            players: {},
          };

          datarow.players[result.player.id] = datarow.players[result.player.id] || {
            id: result.player.id,
            user: {id: result.user.id, tag: result.user.tag},
            character: result.character,
            team: result.team.id ? result.team : null,
            is_winner: result.player.is_winner,
            data: {}
          };

          if (result.player_data && result.player_data.id) {
            datarow.players[result.player.id].data[result.player_data.key] = result.player_data.value;
          }

          // Refactor this to take the link with metadata into account (match_metadata vs player_metadata)
          if (result.metadata && result.metadata.id) {
            datarow.match.metadata[result.metadata.key] = result.metadata.value;
          }
        });

        Object.keys(structuredData).forEach(function(key) {
          structuredData[key].players = Object.values(structuredData[key].players);
          finalArray.push(structuredData[key]);
        });

        this.matches = mapDbToDam(finalArray);

        callback && callback(this.matches);
        this.emitter.emit('refresh.matches', this.matches);
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
          let playersSaving = 0;
          let playerDataSaving = 0;
          data.players.forEach(function(player){
            if (stop) {return;}
            player.match_id = match.id;
            playersSaving++;
            // Save the player record
            savePlayer(player, function(err, player){
              playersSaving--;
              if (!playersSaving && !playerDataSaving && !callbackCalled) {callbackCalled = true;callback(err, true);return;}
              if (err.length || !player.id) {
                stop = true;
                callback(err, false);
              }
              else {
                if (player.data) {
                  Object.keys(player.data).forEach(function(key){
                    let data = {
                        key: key,
                        value: player.data[key],
                        player_id: player.id
                      };
                    if (stop || !data.key || !data.value || !data.player_id) {return;}
                    playerDataSaving++;

                    savePlayerData(data, function(err, userData){
                      playerDataSaving--;
                      // Does this need to exist a second time?
                      // if (!playersSaving && !playerDataSaving && !callbackCalled) {callbackCalled = true;callback(err, true);return;}
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
  },
  /**
   * @param data
   * @param callback
   */
  addMatchMetadata: function (data, callback) {
    let errors = [];
    if (this.matches.indexOf(data.match) === -1) {
      errors.push({msg: 'This match does not exist.'});
    }
    validateMetadata(data.metadata, function(err, success){
      if (err.length || !success) {
        errors.push(err);
        callback(errors, false);
      }
      else {
        let matchMetaDataSaving = 0;
        let stop = false;

        Object.keys(data.metadata).forEach(function(key){
          if (stop) {return;}
          let metadata = {
            key: key,
            value: data.metadata[key]
          };

          saveMetadata(metadata, function(err, metadata){
            matchMetaDataSaving++;
            if (err.length || !metadata.id) {
              stop = true;
              callback(err, false);
            }
            saveMatchMetadata({match_id: data.match.id, metadata_id: metadata.id}, function(err, matchMetaData){
              matchMetaDataSaving--;
              if (err.length || !matchMetaData.id) {
                stop = true;
                callback(err, false);
              }
              if (!matchMetaDataSaving) {
                callback(err, true);
              }
            });
          }.bind(this))
        }, this);
      }
    });
  }
});

/**
 * @type {null|DbSet}
 */
dataAccessManager.users = null;
/**
 * @type {null|DbSet}
 */
dataAccessManager.stages= null;
/**
 * @type {null|DbSet}
 */
dataAccessManager.characters= null;
/**
 * @type {null|DbSet}
 */
dataAccessManager.teams= null;
dataAccessManager._runningQueryCount= 0;
dataAccessManager.isReady= function(){
  return this._runningQueryCount === 0;
};
/**
 * @type {EventEmitter}
 */
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
function savePlayerData(data, callback) {
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

function saveMetadata(data, callback) {
  dbPool.query(
    'INSERT INTO `metadata` (`key`, `value`) VALUES (?, ?)',
    [data.key, data.value],
    function(sqlerr, results, fields) {
      sqlerr = sqlerr ? [sqlerr] : [];
      data.id = results.insertId;
      callback(sqlerr, data);
      // This ain't a thing yet
      // changedDatasets.add('metadata');
    }
  )
}

function saveMatchMetadata(data, callback) {
  dbPool.query(
    'INSERT INTO `match_metadata` (`match_id`, `metadata_id`) VALUES (?, ?)',
    [data.match_id, data.metadata_id],
    function(sqlerr, results, fields) {
      sqlerr = sqlerr ? [sqlerr] : [];
      data.id = results.insertId;
      callback(sqlerr, data);
      changedDatasets.add('matches');
    }
  )
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
  let requiredPlayerFields = [
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
    let missing = _.difference(requiredPlayerFields, Object.keys(user));
    if (missing.length) {
      missingUserData.push(missing);
    }
  });

  if (missingMatchData.length) {
    return callback({errors: [{msg: 'Missing user data', param: missingUserData}]}, false);
  }

  return callback([], true);
}

// TODO: check on length? Is always valid as it's just an object.
function validateMetadata(data, callback) {
  if (data) {
    callback([], true);
  }
  else {
    callback([{msg: 'Missing metadata', param: 'metadata'}], false)
  }
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
