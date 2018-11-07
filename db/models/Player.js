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
                    to: 'match.id'
                }
            },

            user: {
                relation: BaseModel.HasOneRelation,
                // The related model. This can be either a Model
                // subclass constructor or an absolute file path
                // to a module that exports one.
                modelClass: User,
                join: {
                    from: 'player.user_id',
                    to: 'user.id'
                }
            },

            character: {
                relation: BaseModel.HasOneRelation,
                modelClass: Character,
                join: {
                    from: 'player.character_id',
                    to: 'character.id'
                }
            },

            team: {
                relation: BaseModel.HasOneRelation,
                modelClass: Team,
                join: {
                    from: 'player.team_id',
                    to: 'team.id'
                }
            },
            data: {
                relation: BaseModel.HasManyRelation,
                modelClass: PlayerData,
                join: {
                    from: 'player.id',
                    to: 'player_data.player_id'
                }
            }
        };
    }

    static toApi(player)
    {
        let PlayerData = require('./PlayerData');
        let User = require('./User');
        let Character = require('./Character');
        let Team = require('./Team');
        return {
            id: player.id,
            user: User.toApi(player.user),
            character: Character.toApi(player.character),
            team: Team.toApi(player.team),
            is_winner: player.is_winner,
            data: PlayerData.toApi(player.data)
        };
    }
}

module.exports = Player;
