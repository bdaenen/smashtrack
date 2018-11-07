const BaseModel = require('./BaseModel');
const Password = require('objection-password')();

class User extends Password(BaseModel) {
    static get tableName() {
        return 'user';
    }

    static toApi(user) {
        return {
            id: user.id,
            tag: user.tag
        }
    }
}

module.exports = User;
