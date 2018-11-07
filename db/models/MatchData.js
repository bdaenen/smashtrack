const BaseModel = require('./BaseModel');

class MatchData extends BaseModel {

    static get tableName() {
        return 'match_data';
    }

    static toApi(matchDataRecords) {
        if (!matchDataRecords instanceof Array) {
            throw Error('MatchData should always be an array when mapping to the API.');
        }

        let result = {};
        for (let i = 0; i < matchDataRecords.length; i++) {
            let data = matchDataRecords[i];
            result[data.key] = data.value;
        }

        return result;
    }
}

module.exports = MatchData;
