module.exports = {
    match: {
        required: true,
        type: 'object',
        format: {
            is_team: { type: 'bool', required: true },
            date: {
                type: 'string',
                format: 'yyyy-mm-ddThh:mm:ssZ',
                required: true,
            },
            stocks: { type: 'int', required: true },
            time: { type: 'string', format: 'hh:mm:ss', required: true },
            time_remaining: {
                type: 'string',
                format: 'hh:mm:ss',
                required: true,
            },
            stage_id: { type: 'int', required: true },
            author_user_id: { type: 'int', required: true },
            data: {
                type: 'object',
                required: false,
                format: {
                    '*': 'int|string|null|boolean',
                },
            },
        },
    },
    players: {
        required: true,
        type: 'array',
        format: [
            {
                user_id: { type: 'int', required: true },
                character_id: { type: 'int', required: true },
                team_id: { type: 'int', required: true },
                is_winner: { type: 'bool', required: true },
                data: {
                    type: 'array',
                    data: {
                        type: 'object',
                        required: false,
                        format: {
                            '*': 'int|string|null|boolean',
                        },
                    },
                },
            },
        ],
    },
};
