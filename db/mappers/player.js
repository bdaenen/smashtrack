module.exports = {
  dbToApi: function(dbRecord, userRecord, characterRecord, teamRecord) {
    return {
      id: dbRecord.id,
      user: {id: userRecord.id, tag: userRecord.tag},
      character: characterRecord,
      team: teamRecord && teamRecord.id ? teamRecord : null,
      is_winner: dbRecord.is_winner,
      data: {}
    };
  },
  apiToDb: function(apiRecord) {

  }
};
