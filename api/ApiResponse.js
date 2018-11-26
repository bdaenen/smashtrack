(function() {
  'use strict';

  function ApiResponse(data, total) {
    console.log(data);
    this.data = data;
    this.count = data.length;
    this.total = total;
  }

  ApiResponse.prototype.toJson = function() {
    return {
      data: this.data,
      count: this.count,
      total: this.total
    }
  };

  module.exports = ApiResponse;
}());
