(function() {
    let permissions = {
        /**
         * @param req
         * @returns {*|boolean|*}
         */
        canUserRead: function(req) {
            return this.checkPermissions(req.user, 'read');
        },
        /**
         * @param req
         * @returns {*|boolean|*}
         */
        canUserWrite: function(req) {
            return this.checkPermissions(req.user, 'write');
        },
        /**
         * @param req
         * @returns {*|boolean|*}
         */
        isUserAdmin: function(req) {
            return this.checkPermissions(req.user, 'admin');
        },
        /**
         * @param req
         * @param res
         * @returns {*|boolean|*}
         */
        checkReadPermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'read');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        /**
         * @param req
         * @param res
         * @returns {*|boolean|*}
         */
        checkWritePermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'write');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        /**
         * @param req
         * @param res
         * @returns {*|boolean|*}
         */
        checkAdminPermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'admin');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        /**
         * @param user
         * @param type
         * @returns {boolean}
         */
        checkPermissions: function(user, type) {
            if (!user) {
                return false;
            }
            if (user.hasOwnProperty('user')) {
                user = user.user;
            }
            if (type === 'read' || type === 'write') {
                return !!user['can_' + type];
            }
            if (type === 'admin') {
                return !!user.is_admin;
            }

            return false;
        },
        /**
         * @param user
         * @param domain
         * @returns {Promise<any>}
         */
        isUserValidForDomain: function(user, domain) {
            return new Promise(function(resolve, reject) {
                let { db } = require('../db/db');
                db.query(
                    'SELECT * FROM user_allowed_origin WHERE user_id = ?',
                    [user.id],
                    function(error, results, fields) {
                        let originMatches = false;
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].origin === domain) {
                                originMatches = true;
                                break;
                            }
                        }
                        if (!results.length || originMatches) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                );
            });
        },
    };

    module.exports = permissions;
})();
