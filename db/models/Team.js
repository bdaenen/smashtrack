const BaseModel = require('./BaseModel');

class Team extends BaseModel {

    static get tableName() {
        return 'team';
    }

    // This object defines the relations to other models.
    /* static get relationMappings() {
         // Import models here to prevent require loops.
         const Match = require('./Match');

         return {
             matches: {
                 relation: BaseModel.HasManyRelation,
                 // The related model. This can be either a Model
                 // subclass constructor or an absolute file path
                 // to a module that exports one.
                 modelClass: Match,
                 join: {
                     from: 'stage.id',
                     to: 'match.stageId'
                 }
             },
         }
     }*/
}

module.exports = Stage;
