module.exports = {
  dbToApi: function(dbRecord, stageRecord, authorRecord, data) {
    return {
      id: dbRecord.id,
      is_team: dbRecord.is_team,
      date: dbRecord.date.toLocaleDateString('be-nl', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      stocks: dbRecord.stocks,
      time: dbRecord.match_time,
      time_remaining: dbRecord.match_time_remaining,
      stage: stageRecord,
      author_user: {id: authorRecord.id, tag: authorRecord.tag},
      data: data ? data : {}
    };
  },
  dataToDb: function(apiRecord, keepUndefined) {
    let dbRow = {
      id: apiRecord.id,
      date: apiRecord.date,
      stocks: apiRecord.stocks,
      stage_id: apiRecord.stage.id,
      match_time: apiRecord.time,
      match_time_remaining: apiRecord.time_remaining,
      is_team: apiRecord.is_team
    };

    if (!keepUndefined) {
      Object.keys(dbRow).forEach(function(k) {
        if (dbRow[k] === undefined) {
          delete dbRow[k];
        }
      });
    }

    return dbRow;
  }
};
