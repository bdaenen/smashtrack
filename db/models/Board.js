const BaseModel = require('./BaseModel');

class Board extends BaseModel {
    static get tableName() {
        return 'board';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Import models here to prevent require loops.
        const User = require('./User');
        const Match = require('./Match');

        return {
            users: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_user.board_id',
                        to: 'board_user.user_id'
                    },
                    to: 'user.id'
                }
            },
            matches: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Match,
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_match.board_id',
                        to: 'board_match.match_id'
                    },
                    to: 'match.id'
                }
            }
        };
    }
}

module.exports = Board;
