const BaseModel = require('./BaseModel');
const Password = require('objection-password')();

class User extends Password(BaseModel) {
    static get tableName() {
        return 'user';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Import models here to prevent require loops.
        const Stage = require('./Stage');
        const User = require('./User');
        const Player = require('./Player');
        const MatchData = require('./MatchData');
        const Match = require('./Match');

        return {
            matches: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Match,
                join: {
                    from: 'user.id',
                    // ManyToMany relation needs the `through` object
                    // to describe the join table.
                    through: {
                        // If you have a model class for the join table
                        // you need to specify it like this:
                        // modelClass: PersonMovie,
                        from: 'player.user_id',
                        to: 'player.match_id'
                    },
                    to: 'match.id'
                }
            },
        };
    }

    static toApi(user) {
        let apiObj = {
            id: user.id,
            tag: user.tag
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
}

module.exports = User;
