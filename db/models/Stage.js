const BaseModel = require('./BaseModel');

class Stage extends BaseModel {

    static get tableName() {
        return 'stage';
    }

    static get titleColumn() {
        return 'name';
    }

    static toApi(stage) {
        let apiObj = {
            id: stage.id,
            name: stage.name
        };

        return apiObj;
    }
}

module.exports = Stage;
