let formattingFunction = function(data) {
  return JSON.stringify(data);
};

module.exports = function() {
  return function(data){
    return formattingFunction(data);
  }
};
