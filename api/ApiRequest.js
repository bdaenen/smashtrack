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
    }
    
    module.exports = ApiRequest;
}());
