(function() {
    'use strict';

    /**
     * @param {{results: BaseModel[], total: int}} data
     * @constructor
     */
    function ApiResponse(data) {
        this.data = [];

        for (let i = 0; i < data.results.length; i++) {
            this.data.push(data.results[i].constructor.toApi(data.results[i]));
        }

        this.count = this.data.length || 0;
        this.total = data.total || 0;
    }

    /**
     * @returns {{data: *, count: *, total: *}}
     */
    ApiResponse.prototype.toJson = function() {
        return {
            data: this.data,
            count: this.count,
            total: this.total
        }
    };

    module.exports = ApiResponse;
}());
