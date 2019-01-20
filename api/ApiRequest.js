(function() {
    'use strict';

    /**
     * @param req
     * @constructor
     */
    function ApiRequest(req) {
        this.page = parseInt(req.query.page) || 0;
        this.order = req.query.order || 'id';
        this.orderDir = req.query.orderDir || 'asc';
        this.pageSize = req.query.pageSize || 50;
        this.user = req.user;
        this.req = req;
        this.params = req.params;
        this.data = req.body;
    }

    /**
     * Apply default request parameters to the query (paging, ordering).
     * @param query
     * @returns {Promise<BaseModel[]>}
     */
    ApiRequest.prototype.applyRequestParamsToQuery = async function(query) {
        return await query.orderBy(this.order, this.orderDir)
          .page(this.page, this.pageSize);
    };

    module.exports = ApiRequest;
}());
