const BaseModel = require('./BaseModel');

class Board extends BaseModel {
    static get tableName() {
        return 'board';
    }

    static get titleColumn() {
        return 'name';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Import models here to prevent require loops.
        const User = require('./User');
        const Stage = require('./Stage');
        const Match = require('./Match');

        return {
            users: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_user.board_id',
                        to: 'board_user.user_id',
                    },
                    to: 'user.id',
                },
            },
            admins: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: User,
                filter: { 'board_user.is_admin': true },
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_user.board_id',
                        to: 'board_user.user_id',
                        extra: ['is_admin'],
                    },
                    to: 'user.id',
                },
            },
            matches: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Match,
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_match.board_id',
                        to: 'board_match.match_id',
                    },
                    to: 'match.id',
                },
            },
            stages: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Stage,
                join: {
                    from: 'board.id',
                    through: {
                        from: 'board_stage.board_id',
                        to: 'board_stage.stage_id',
                    },
                    to: 'stage.id',
                },
            },
        };
    }

    static get eagerListFields() {
        return '[users, admins, stages]';
    }

    static get eagerDetailFields() {
        return '[users, admins, stages]';
    }

    static toApi(board) {
        let User = require('./User');
        let Stage = require('./Stage');

        let result = {};
        result.board = {
            id: board.id,
            name: board.name,
            uuid: board.uuid,
        };

        result.users = [];
        result.admins = [];
        result.stages = [];

        let users = board.users;
        let admins = board.admins;
        let stages = board.stages;

        if (users) {
            for (let i = 0; i < users.length; i++) {
                result.users.push(User.toApi(users[i]));
            }
        }

        if (admins) {
            for (let i = 0; i < admins.length; i++) {
                result.admins.push(User.toApi(admins[i]));
            }
        }

        if (stages) {
            for (let i = 0; i < stages.length; i++) {
                result.stages.push(Stage.toApi(stages[i]));
            }
        }

        return result;
    }
}

module.exports = Board;
