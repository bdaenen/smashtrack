module.exports = {
  match_id: {
    type: 'int',
    required: true
  },
  data: {
    required: true,
    type: 'object',
    format: {
      key1: 'value1',
      key2: 2,
      "only.one.deep": 'please :)'
    },
  }
};
