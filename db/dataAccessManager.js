const { db } = require('./db');
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
    loadStages: function(callback) {
        this._runningQueryCount++;
        db.query(
            'SELECT id, name FROM stage',
            function(error, results) {
                this._runningQueryCount--;
                this.stages = mapDbToDam(results);
                callback && callback(this.stages);
                this.emitter.emit('refresh.stages', this.stages);
            }.bind(this)
        );
    },

    /**
     * @param callback
     */
    loadCharacters: function(callback) {
        this._runningQueryCount++;
        db.query(
            'SELECT id, name FROM `character`',
            function(error, results) {
                this._runningQueryCount--;
                this.characters = mapDbToDam(results);
                callback && callback(this.characters);
                this.emitter.emit('refresh.characters', this.characters);
            }.bind(this)
        );
    },

    /**
     * @param callback
     */
    loadTeams: function(callback) {
        this._runningQueryCount++;
        db.query(
            'SELECT id, name FROM `team`',
            function(error, results) {
                this._runningQueryCount--;
                this.teams = mapDbToDam(results);
                callback && callback(this.teams);
                this.emitter.emit('refresh.teams', this.teams);
            }.bind(this)
        );
    },

    /**
     * @param callback
     */
    loadUsers: function(callback) {
        this._runningQueryCount++;
        db.query(
            'SELECT id, tag, can_read, can_write, is_admin FROM `user`',
            function(error, results) {
                this._runningQueryCount--;
                this.users = mapDbToDam(results);
                callback && callback(this.users);
                this.emitter.emit('refresh.users', this.users);
            }.bind(this)
        );
    },

    /**
     * @param callback
     */
    loadMatches: function(callback) {
        this._runningQueryCount++;
        db.query(
            {
                nestTables: true,
                sql:
                    'SELECT * FROM player' +
                    ' INNER JOIN `match` ON player.match_id = `match`.id' +
                    ' INNER JOIN `stage` ON `match`.stage_id = stage.id' +
                    ' INNER JOIN `user` as author ON `match`.author_user_id = author.id' +
                    ' INNER JOIN `user` ON player.user_id = user.id' +
                    ' INNER JOIN `character` ON player.character_id = character.id' +
                    ' LEFT JOIN `team` ON player.team_id = team.id' +
                    ' LEFT JOIN `player_data` ON `player_data`.player_id = player.id' +
                    ' LEFT JOIN `match_data` ON `match_data`.`match_id` = `match`.`id`;',
            },
            function(error, results) {
                this._runningQueryCount--;
                let structuredData = {};
                let finalArray = [];

                results.forEach(function(result) {
                    let datarow = (structuredData[
                        result.match.id
                    ] = structuredData[result.match.id] || {
                        match: {
                            id: result.match.id,
                            is_team: result.match.is_team,
                            date: result.match.date.toLocaleDateString(
                                'be-nl',
                                {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                }
                            ),
                            stocks: result.match.stocks,
                            time: result.match.match_time,
                            time_remaining: result.match.time_remaining,
                            stage: result.stage,
                            author_user: {
                                id: result.author.id,
                                tag: result.author.tag,
                            },
                            data: {},
                        },
                        players: {},
                    });

                    datarow.players[result.player.id] = datarow.players[
                        result.player.id
                    ] || {
                        id: result.player.id,
                        user: { id: result.user.id, tag: result.user.tag },
                        character: result.character,
                        team: result.team.id ? result.team : null,
                        is_winner: result.player.is_winner,
                        data: {},
                    };

                    if (result.player_data && result.player_data.id) {
                        datarow.players[result.player.id].data[
                            result.player_data.key
                        ] = result.player_data.value;
                    }

                    if (result.match_data && result.match_data.id) {
                        datarow.match.data[result.match_data.key] =
                            result.match_data.value;
                    }
                });

                Object.keys(structuredData).forEach(function(key) {
                    structuredData[key].players = Object.values(
                        structuredData[key].players
                    );
                    finalArray.push(structuredData[key]);
                });

                this.matches = mapDbToDam(finalArray);

                callback && callback(this.matches);
                this.emitter.emit('refresh.matches', this.matches);
            }.bind(this)
        );
    },

    /**
     * @param data
     */
    createUser: function(data) {
        return new Promise((resolve, reject) => {
            // TODO: move validation to model
            validateUserData(data, async function(err, success) {
                if (err.length || !success) {
                    throw err;
                }

                let User = require('./models/User');
                let user = await User.query().insert({
                    tag: data.tag,
                    password: data.password,
                });

                changedDatasets.add('users');

                resolve(user);
            });
        });
    },

    updateUser: async function(user, data) {
        return new Promise(
            async function(resolve, reject) {
                let dataKeys;
                let updateString = '';
                let updateValues = [];
                // Only keep the fields existing on the user objects.
                data = _.pickBy(data, function(value, key) {
                    return user.hasOwnProperty(key);
                });
                dataKeys = Object.keys(data);
                if (data.password) {
                    data.password = await this.hashPassword(data.password);
                }

                for (let i = 0; i < dataKeys.length; i++) {
                    if (i !== 0) {
                        updateString += ',';
                    }
                    updateString += dataKeys[i] + '= ?';
                    updateValues.push(data[dataKeys[i]]);
                }
                db.query(
                    'UPDATE user SET ' + updateString + ' WHERE id = ?',
                    updateValues.concat([user.id]),
                    function(error, results, fields) {
                        if (error) throw error;
                        changedDatasets.add('users');
                        resolve(true);
                    }
                );
            }.bind(this)
        );
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
    addMatchData: async function(data) {
        if (!this.matches.filter({ 'match.id': data.match_id }).length) {
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
                value: val,
            };

            await saveMatchData(matchData);
        }

        return true;
    },
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
dataAccessManager.isReady = function() {
    return this._runningQueryCount === 0;
};
/**
 * @type {EventEmitter}
 */
dataAccessManager.emitter = new Emitter();

/**
 * @param data
 * @returns {Promise}
 */
function saveMatchData(data) {
    return new Promise(function(resolve, reject) {
        db.query(
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
        );
    });
}

/**
 * Reload changed data
 */
function checkData() {
    if (changedDatasets.size) {
        changedDatasets.forEach(function(value) {
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
    let requiredFields = ['tag', 'password', 'password_confirmation'];

    let missingData = _.difference(requiredFields, Object.keys(data));
    if (missingData.length) {
        throw new Error('Missing data: ' + missingData);
    }

    Object.keys(data).forEach(function(key) {
        if (key.endsWith('_confirmation')) {
            let matchingKey = key.substr(0, key.lastIndexOf('_confirmation'));
            if (data[key] !== data[matchingKey]) {
                throw new Error(
                    'Parameters should match: ' + [key, matchingKey]
                );
            }
        }
    });

    if (errors.length) {
        return callback(errors, false);
    }

    return callback(errors, true);
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
