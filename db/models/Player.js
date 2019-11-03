const BaseModel = require('./BaseModel');

class Player extends BaseModel {
    static get tableName() {
        return 'player';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Import models here to prevent require loops.
        const Stage = require('./Stage');
        const User = require('./User');
        const Player = require('./Player');
        const Character = require('./Character');
        const Match = require('./Match');
        const Team = require('./Team');
        const MatchData = require('./MatchData');
        const PlayerData = require('./PlayerData');

        return {
            match: {
                relation: BaseModel.HasOneRelation,
                modelClass: Match,
                join: {
                    from: 'player.match_id',
                    to: 'match.id',
                },
            },

            user: {
                relation: BaseModel.HasOneRelation,
                // The related model. This can be either a Model
                // subclass constructor or an absolute file path
                // to a module that exports one.
                modelClass: User,
                join: {
                    from: 'player.user_id',
                    to: 'user.id',
                },
            },

            character: {
                relation: BaseModel.HasOneRelation,
                modelClass: Character,
                join: {
                    from: 'player.character_id',
                    to: 'character.id',
                },
            },

            team: {
                relation: BaseModel.HasOneRelation,
                modelClass: Team,
                join: {
                    from: 'player.team_id',
                    to: 'team.id',
                },
            },
            data: {
                relation: BaseModel.HasManyRelation,
                modelClass: PlayerData,
                join: {
                    from: 'player.id',
                    to: 'player_data.player_id',
                },
            },
        };
    }

    static apiDataToGraph(apiData) {
        const PlayerData = require('./PlayerData');

        let graphPlayer = {
            user_id: parseInt(apiData.user_id, 10),
            character_id: parseInt(apiData.character_id, 10),
            is_winner: apiData.is_winner,
            team_id: null,
        };

        if (apiData.team_id) {
            graphPlayer.team_id = apiData.team_id;
        }

        if (apiData.data) {
            graphPlayer.data = PlayerData.apiDataToGraph(apiData.data);
        }

        return graphPlayer;
    }

    static toApi(player) {
        let PlayerData = require('./PlayerData');
        let User = require('./User');
        let Character = require('./Character');
        let Team = require('./Team');

        let apiObj = {
            id: player.id,
            is_winner: player.is_winner,
        };

        if (player.data) {
            apiObj.data = PlayerData.toApi(player.data);
        }

        if (player.user) {
            apiObj.user = User.toApi(player.user);
        }

        if (player.character) {
            apiObj.character = Character.toApi(player.character);
        }

        if (player.team) {
            apiObj.team = Team.toApi(player.team);
        }

        return apiObj;
    }
}

module.exports = Player;
