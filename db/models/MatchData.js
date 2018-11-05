const BaseModel = require('./BaseModel');

class MatchData extends BaseModel {

    static get tableName() {
        return 'match_data';
    }
}

module.exports = MatchData;