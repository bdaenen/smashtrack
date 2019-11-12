const BaseModel = require('./BaseModel');
const Password = require('objection-password')();

class User extends Password(BaseModel) {
    static get tableName() {
        return 'user';
    }

    static get titleColumn() {
        return 'tag';
    }

    static get relationMappings() {
        const Match = require('./Match');
        const Board = require('./Board');

        return {
            matches: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Match,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'player.user_id',
                        to: 'player.match_id',
                    },
                    to: 'match.id',
                },
            },
            boards: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Board,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'board_user.user_id',
                        to: 'board_user.board_id',
                    },
                    to: 'board.id',
                },
            },
        };
    }

    static toApi(user) {
        let apiObj = {
            id: user.id,
            tag: user.tag,
            is_admin: user.is_admin,
            is_api_user: user.is_api_user
        };

        if (user.matches) {
            let Match = require('./Match');
            apiObj.matches = [];
            for (let i = 0; i < user.matches.length; i++) {
                apiObj.matches.push(Match.toApi(user.matches[i]));
            }
        }

        return apiObj;
    }

    static toSelect(record) {
        let apiObj = {
            id: record[this.idColumn],
        };

        if (this.titleColumn) {
            apiObj.text = record[this.titleColumn];
        }

        apiObj.is_api_user = record.is_api_user;

        return apiObj;
    }
}

module.exports = User;
