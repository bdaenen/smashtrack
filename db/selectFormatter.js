let formattingFunction = function(data, labelField, valueField) {
  let formattedData = [];
  data && data.forEach && data.forEach(function(row){
    formattedData.push({value: row[valueField], label: row[labelField]});
  });

  return formattedData;
};

module.exports = function(labelField, valueField) {
  return function(data){
    return formattingFunction(data, labelField, valueField);
  }
};
