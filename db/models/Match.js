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

    static get eagerListFields() {
        return '[stage, author, players.[data, character, user, team], data]';
    }

    static get eagerDetailFields() {
        return '[stage, author, players.[data, character, user, team], data]';
    }

    // TODO: Player/Data mapping in respective models?
    // TODO: Add option to post boards
    // TODO: Add validation?
    static apiRequestToGraph(apiRequest) {
        let apiData = apiRequest.data;
        let graph = {
            author_user_id: parseInt(apiRequest.user.id, 10),
            date: apiData.match.date,
            stage_id: parseInt(apiData.match.stage_id, 10),
            stocks: parseInt(apiData.match.stocks, 10),
            match_time: apiData.match.time,
            match_time_remaining: apiData.match.time_remaining || null,
            players: []
        };

        for (let i = 0; i < apiData.players.length; i++) {
            let player = apiData.players[i];
            let graphPlayer = {
                user_id: parseInt(player.user_id, 10),
                character_id: parseInt(player.character_id, 10),
                is_winner: player.is_winner,
                team_id: null
            };

            if (player.team_id) {
                graphPlayer.team_id = player.team_id;
            }

            if (player.data) {
                graphPlayer.data = [];
                let keys = Object.keys(player.data);
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    let data = {
                        key: key,
                        value: player.data[key]
                    };
                    graphPlayer.data.push(data);
                }
            }

            graph.players.push(graphPlayer);
        }

        return graph;
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
          result.match.data = MatchData.toApi(match.data);
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
