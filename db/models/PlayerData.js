const BaseModel = require('./BaseModel');

class PlayerData extends BaseModel {

  static get tableName() {
    return 'player_data';
  }

  static toApi(playerDataRecords) {
    if (!playerDataRecords instanceof Array) {
      throw Error('PlayerData should always be an array when mapping to the API.');
    }

    let result = {};
    for (let i = 0; i < playerDataRecords.length; i++) {
      let data = playerDataRecords[i];
      result[data.key] = data.value;
    }

    return result;
  }
}

module.exports = PlayerData;
