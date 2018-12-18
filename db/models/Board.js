const BaseModel = require('./BaseModel');

class Board extends BaseModel {
    static get tableName() {
        return 'board';
    }
}

module.exports = Board;
