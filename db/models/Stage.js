const BaseModel = require('./BaseModel');

class Stage extends BaseModel {

    static get tableName() {
        return 'stage';
    }
}

module.exports = Stage;
