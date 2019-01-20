(function() {
    'use strict';

    /**
     * @param {{results: BaseModel[], total: int}} data
     * @constructor
     */
    function RawApiResponse(data) {
        this.data = data.results;
        this.count = data.results.length || 1;
        this.total = data.total || 1;
    }

    /**
     * @returns {{data: *, count: *, total: *}}
     */
    RawApiResponse.prototype.toJSON = function() {
        return {
            data: this.data,
            count: this.count,
            total: this.total
        }
    };

    module.exports = RawApiResponse;
}());
