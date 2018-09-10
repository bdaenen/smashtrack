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
    dbPool.query('SELECT id, tag, can_read, can_write, is_admin FROM `user`', function(error, results){
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
      ' LEFT JOIN `match_data` ON `match_data`.`match_id` = `match`.`id`;'
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
              data: {}
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

          if (result.match_data && result.match_data.id) {
            datarow.match.data[result.match_data.key] = result.match_data.value;
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
     */
    createMatch: async function(data){
        // Throws an error if it does not validate.
        let validates = await validateMatchData(data);

        if (!validates) {
          return false;
        }

        let match = await saveMatch(data.match);
        data.players.forEach(async function(dataPlayer){
            dataPlayer.match_id = match.id;
            let player = await savePlayer(dataPlayer);

            if (player.data) {
                if (player.data.constructor !== Object) {
                    throw new Error('Badly structured data.');
                }

                Object.keys(player.data).forEach(async function(key){
                    let data = {
                        key: key,
                        value: dataPlayer.data[key],
                        player_id: player.id
                    };
                    if (!data.key || !data.value || !data.player_id) {throw new Error('Invalid data provided for player ' + player.id);}
                    if (typeof data.value === 'object') {
                        throw new Error('Nested objects are not (yet) implemented.');
                    }

                    await savePlayerData(data);
                }, this);
            }
        }, this);

        return true;
    },

  /**
   * @param data
   * @param callback
   */
  createUser: function(data, callback) {
    validateUserData(data, async function(err, success) {
      if (err.length || !success) {
        callback(err, false);
      }

      data.password = await this.hashPassword(data.password);
      dbPool.query('INSERT INTO user(tag, password) VALUES (?, ?)', [data.tag, data.password], function (error, results, fields) {
        if (error) throw error;
        callback(err, true);
        changedDatasets.add('users');
      });
    }.bind(this));
  },

  updateUser: async function(user, data) {
    return new Promise(async function (resolve, reject) {
      let dataKeys;
      let updateString = '';
      let updateValues = [];
      // Only keep the fields existing on the user objects.
      data = _.pickBy(data, function(value, key) {
          return user.hasOwnProperty(key);
      });
      dataKeys = Object.keys(data);
      if (data.password) {
          data.password = await this.hashPassword(data.password)
      }

      for (let i = 0; i < dataKeys.length; i++) {
          if (i !== 0) {
            updateString += ',';
          }
          updateString += dataKeys[i] + '= ?';
          updateValues.push(data[dataKeys[i]]);
      }
      dbPool.query('UPDATE user SET ' + updateString + ' WHERE id = ?', updateValues.concat([user.id]), function (error, results, fields) {
          if (error) throw error;
          changedDatasets.add('users');
          resolve(true);
      });
    }.bind(this));
  },

  /**
  * @param password
  * @returns {Promise<any>}
  */
  hashPassword: async function(password) {
    return new Promise(function(resolve, reject) {
      let bcrypt = require('bcrypt');
      bcrypt.hash(password, 12, function(error, hash) {
          if (error) {
              throw error;
          }

          resolve(hash);
      });
    });
  },

  /**
   * @param data
   */
  addMatchData: async function (data) {
    if (!this.matches.filter({'match.id': data.match_id}).length) {
      throw new Error('This match does not exist.');
    }

    if (data.data.constructor !== Object) {
        throw new Error('Badly structured data.');
    }

    let keys = Object.keys(data.data);
    for (let i = 0, l = keys.length; i < l; i++) {
      let key = keys[i];
      let val = data.data[key];

      if (typeof val === 'object') {
          throw new Error('Nested objects are not (yet) implemented.');
      }

      let matchData = {
        match_id: data.match_id,
        key: key,
        value: val
      };

      await saveMatchData(matchData);
    }

    return true;
  }
});

/**
 * @type {null|DbSet}
 */
dataAccessManager.users = null;
/**
 * @type {null|DbSet}
 */
dataAccessManager.stages = null;
/**
 * @type {null|DbSet}
 */
dataAccessManager.characters = null;
/**
 * @type {null|DbSet}
 */
dataAccessManager.teams = null;
dataAccessManager._runningQueryCount = 0;
dataAccessManager.isReady = function(){
  return this._runningQueryCount === 0;
};
/**
 * @type {EventEmitter}
 */
dataAccessManager.emitter= new Emitter();

/**
 * @param data
 */
function saveMatch(data) {
  return new Promise(function(resolve, reject){
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
        if (sqlerr) {
          throw sqlerr;
        }

        data.id = results.insertId;
        changedDatasets.add('matches');
        resolve(data);
      }
    );
  });
}

/**
 * @param data
 */
function savePlayer(data) {
  return new Promise(function(resolve, reject){
      dbPool.query(
        'INSERT INTO `player` (match_id, user_id, character_id, team_id, is_winner) VALUES (?, ?, ?, ?, ?)',
        [
            data.match_id,
            data.user_id,
            data.character_id,
            data.team_id || null,
            +!!data.is_winner
        ],
        function(sqlerr, results, fields) {
            if (sqlerr) {
              throw sqlerr;
            }

            data.id = results.insertId;
            changedDatasets.add('matches');
            return resolve(data);
        }
      );
  });
}

/**
 * @param data
 * @returns {Promise}
 */
function savePlayerData(data) {
  return new Promise(function(resolve, reject) {
    dbPool.query(
      'INSERT INTO `player_data` (player_id, `key`, `value`) VALUES (?, ?, ?)',
      [
        data.player_id,
        data.key,
        data.value
      ],
      function(sqlerr, results, fields) {
        if (sqlerr) {
          throw sqlerr;
        }
        data.id = results.insertId;
        changedDatasets.add('matches');
        return resolve(data);
      }
    );
  });
}

/**
 * @param data
 * @returns {Promise}
 */
function saveMatchData(data) {
    return new Promise(function(resolve, reject){
        dbPool.query(
          'INSERT INTO `match_data` (`match_id`, `key`, `value`) VALUES (?, ?, ?)',
          [data.match_id, data.key, data.value],
          function(sqlerr, results, fields) {
              if (sqlerr) {
                  throw sqlerr;
              }
              data.id = results.insertId;
              changedDatasets.add('matches');
              resolve(data);
          }
        )
    });
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
    throw new Error('Missing data: ' + missingData);
  }

  Object.keys(data).forEach(function(key) {
    if (key.endsWith('_confirmation')) {
      let matchingKey = key.substr(0, key.lastIndexOf('_confirmation'));
      if (data[key] !== data[matchingKey]) {
        throw new Error('Parameters should match: ' + [key, matchingKey]);
      }
    }
  });

  if (errors.length) {
    return callback(errors, false);
  }

  return callback(errors, true);
}

/**
 * @param data
 * @returns {boolean}
 */
function validateMatchData(data){
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
          throw new Error('Missing data: ' + missingData);
      }

      missingMatchData = _.difference(requiredMatchFields, Object.keys(data.match));
      if (missingMatchData.length) {
          throw new Error('Missing match data: ' + missingMatchData);
      }
      missingUserData = [];
      data.players.forEach(function(user) {
          let missing = _.difference(requiredPlayerFields, Object.keys(user));
          if (missing.length) {
              missingUserData.push(missing);
          }
      });

      if (missingMatchData.length) {
          throw new Error('missing user data: ' + missingUserData);
      }

      return true;
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
