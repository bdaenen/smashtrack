const BaseModel = require('./BaseModel');

class User extends BaseModel {

    static get tableName() {
        return 'user';
    }
}

module.exports = User;