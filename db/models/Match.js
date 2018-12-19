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
        const Board = require('./Board');

        return {
            author: {
                relation: BaseModel.HasOneRelation,
                // The related model. This can be either a Model
                // subclass constructor or an absolute file path
                // to a module that exports one.
                modelClass: User,
                join: {
                    from: 'match.author_user_id',
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
                    from: 'match.stage_id',
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
            },

            boards: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Board,
                join: {
                    from: 'match.id',
                    through: {
                        from: 'board_match.match_id',
                        to: 'board_match.board_id'
                    },
                    to: 'board.id'
                }
            }
        };
    }

    static toApi(match) {
        let Player = require('./Player');
        let Stage = require('./Stage');
        let User = require('./User');
        let MatchData = require('./MatchData');

        let result = {};
        result.match = {
            id: match.id,
            is_team: match.is_team,
            date: match.date,
            stocks: match.stocks,
            time: match.match_time,
            time_remaining: match.match_time_remaining
        };

        if (match.stage) {
            result.match.stage = Stage.toApi(match.stage);
        }
        if (match.author) {
            result.match.author_user = User.toApi(match.author);
        }
        if (match.data) {
          result.match.data = MatchData.toApi(match.data)
        }

        if (match.players) {
            result.players = [];
            for (let i = 0; i < match.players.length; i++) {
                let player = match.players[i];
                result.players.push(Player.toApi(player));
            }
        }

        return result;
    }
}

module.exports = Match;
