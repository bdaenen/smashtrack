const { Model, snakeCaseMappers } = require('objection');

class BaseModel extends Model {
    static get idColumn() {
        return 'id';
    }

    static get columnNameMappers() {
        return snakeCaseMappers({ upperCase: false });
    }
}

module.exports = BaseModel;