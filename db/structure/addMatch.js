module.exports = {
  match: {
    required: true,
    type: 'object',
    format: {
      is_team: {type: 'bool', required: true},
      date: {type: 'string', format: 'yyyy-mm-ddThh:mm:ssZ', required: true},
      stocks: {type: 'int', required: true},
      time: {type: 'string', format: 'hh:mm:ss', required: true},
      time_remaining: {type: 'string', format:'hh:mm:ss', required: true},
      stage_id: {type: 'int', required: true}
    }
  },
  users: {
    required: true,
    type: 'array',
    format: [{
      user_id: {type: 'int', required: true},
      character_id: {type: 'int', required: true},
      team_id: {type: 'int', required: true},
      is_winner: {type: 'bool', required: true},
      data: {
        type: 'array',
        format: [{
            key: {type: 'string', required: true},
            value: {type: 'string', required: true}
          }]
      }
    }]
  }
};