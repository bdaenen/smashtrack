(function() {
    'use strict';

    /**
     * @param req
     * @constructor
     */
    function ApiRequest(req) {

        this.page = (req.query && parseInt(req.query.page)) || 0;
        this.order = (req.query && req.query.order) || 'id';
        this.orderDir = (req.query && req.query.orderDir) || 'asc';
        this.pageSize = (req.query && req.query.pageSize) || 50;
        this.user = req.user;
        this.req = req;
        this.params = req.params;
        this.data = req.body;
        this.q = (req.query && req.query.q) || '';
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
