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
            admins: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: User,
                filter: {'board_user.is_admin': true},
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_user.board_id',
                        to: 'board_user.user_id',
                        extra: ['is_admin']
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

    static get eagerListFields() {
        return '[users, admins]';
    }

    static get eagerDetailFields() {
        return '[users, admins]';
    }

    static toApi(board) {
        let User = require('./User');

        let result = {};
        result.board = {
            id: board.id,
            name: board.name,
            uuid: board.uuid
        };

        let users = board.users;
        let admins = board.admins;

        if (users) {
            result.users = [];
            for (let i = 0; i < users.length; i++) {
                result.users.push(User.toApi(users[i]));
            }
        }

        if (admins) {
            result.admins = [];
            for (let i = 0; i < admins.length; i++) {
                result.admins.push(User.toApi(admins[i]));
            }
        }

        return result;
    }
}

module.exports = Board;
