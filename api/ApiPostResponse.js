(function() {
    'use strict';

    /**
     * @param {{results: BaseModel[], total: int}} data
     * @constructor
     */
    function ApiPostResponse(data) {
        this.data = [];

        for (let i = 0; i < data.results.length; i++) {
            this.data.push(data.results[i].constructor.toApi(data.results[i]));
        }
    }

    /**
     * @returns {{data: *, count: *, total: *}}
     */
    ApiPostResponse.prototype.toJSON = function() {
        return this.data;
    };

    module.exports = ApiPostResponse;
})();
