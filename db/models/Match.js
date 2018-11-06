const BaseModel = require('./BaseModel');

class Match extends BaseModel {

    static get tableName() {
        return 'match';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Import models here to prevent require loops.
        const Stage = require('./Stage');
        const User = require('./User');
        const Player = require('./Player');
        const MatchData = require('./MatchData');

        return {
            author: {
                relation: BaseModel.HasOneRelation,
                // The related model. This can be either a Model
                // subclass constructor or an absolute file path
                // to a module that exports one.
                modelClass: User,
                join: {
                    from: 'match.authorUserId',
                    to: 'user.id'
                }
            },

            stage: {
                relation: BaseModel.HasOneRelation,
                // The related model. This can be either a Model
                // subclass constructor or an absolute file path
                // to a module that exports one.
                modelClass: Stage,
                join: {
                    from: 'match.stageId',
                    to: 'stage.id'
                }
            },

            players: {
                relation: BaseModel.HasManyRelation,
                modelClass: Player,
                join: {
                    from: 'match.id',
                    to: 'player.match_id'
                }
            },

            data: {
                relation: BaseModel.HasManyRelation,
                modelClass: MatchData,
                join: {
                    from: 'match.id',
                    to: 'match_data.match_id'
                }
            }
        };
    }
}

module.exports = Match;
