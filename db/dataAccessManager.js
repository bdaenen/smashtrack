const dbPool = require('./db');
const Emitter = require('events');
const DbSet = require('./DbSet');

let dataAccessManager = {
  users: null,
  stages: null,
  characters: null,
  teams: null,
  _runningQueryCount: 0,
  isReady: function(){
    return this._runningQueryCount === 0;
  },
  emitter: new Emitter()
};

dataAccessManager.loadData = function(callback) {
  this.loadStages(callback);
  this.loadCharacters(callback);
  this.loadUsers(callback);
  this.loadMatches(callback);
  this.loadTeams(callback);
};

/**
 * @param callback
 */
dataAccessManager.loadStages = function(callback) {
  dataAccessManager._runningQueryCount++;
  dbPool.query('SELECT id, name FROM stage', function(error, results){
    dataAccessManager._runningQueryCount--;
    dataAccessManager.stages = mapDbToDam(results);
    callback && callback(dataAccessManager.stages);
    dataAccessManager.emitter.emit('refresh.stages', dataAccessManager.stages);
  });
};

/**
 * @param callback
 */
dataAccessManager.loadCharacters = function(callback) {
  dataAccessManager._runningQueryCount++;
  dbPool.query('SELECT id, name FROM `character`', function(error, results){
    dataAccessManager._runningQueryCount--;
    dataAccessManager.characters = mapDbToDam(results);
    callback && callback(dataAccessManager.characters);
    dataAccessManager.emitter.emit('refresh.characters', dataAccessManager.characters);
  });
};

/**
 * @param callback
 */
dataAccessManager.loadTeams = function(callback) {
  dataAccessManager._runningQueryCount++;
  dbPool.query('SELECT id, name FROM `team`', function(error, results){
    dataAccessManager._runningQueryCount--;
    dataAccessManager.teams = mapDbToDam(results);
    callback && callback(dataAccessManager.teams);
    dataAccessManager.emitter.emit('refresh.teams', dataAccessManager.teams);
  });
};

/**
 * @param callback
 */
dataAccessManager.loadUsers = function(callback) {
  dataAccessManager._runningQueryCount++;
  dbPool.query('SELECT id, tag FROM `user`', function(error, results){
    dataAccessManager._runningQueryCount--;
    dataAccessManager.users = mapDbToDam(results);
    callback && callback(dataAccessManager.users);
    dataAccessManager.emitter.emit('refresh.users', dataAccessManager.users);
  });
};

/**
 * @param callback
 */
dataAccessManager.loadMatches = function(callback) {
  dataAccessManager._runningQueryCount++;
  dbPool.query('SELECT id, tag FROM `match`', function(error, results){
    dataAccessManager._runningQueryCount--;
    dataAccessManager.matches = mapDbToDam(results);
    callback && callback(dataAccessManager.matches);
    dataAccessManager.emitter.emit('refresh.matches', dataAccessManager.matches);
  });
};

/**
 * @param results
 * @returns {DbSet}
 */
function mapDbToDam(results) {
  return new DbSet(results);
}

dataAccessManager.loadData();

module.exports = dataAccessManager;
