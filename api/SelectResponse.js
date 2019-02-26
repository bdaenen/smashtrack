(function() {
    'use strict';

    /**
     * @param {{results: BaseModel[], total: int}} data
     * @constructor
     */
    function SelectResponse(data) {
        this.data = [];

        for (let i = 0; i < data.results.length; i++) {
            this.data.push(data.results[i].constructor.toSelect(data.results[i]));
        }

        this.count = this.data.length || 0;
        this.total = data.total || 0;
    }

    /**
     * @returns {{data: *, count: *, total: *}}
     */
    SelectResponse.prototype.toJSON = function() {
        return {
            results: this.data,
            count: this.count,
            total: this.total
        }
    };

    module.exports = SelectResponse;
}());
