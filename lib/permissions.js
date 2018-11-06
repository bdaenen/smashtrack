(function() {
    let permissions = {
        canUserRead: function(req, res) {
            return this.checkPermissions(req.user, 'read');
        },
        canUserWrite: function(req, res) {
            return this.checkPermissions(req.user, 'write');
        },
        isUserAdmin: function(req, res) {
            return this.checkPermissions(req.user, 'admin');
        },
        checkReadPermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'read');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        checkWritePermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'write');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        checkAdminPermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'admin');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
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
        isUserValidForDomain: function(user, domain) {
          return new Promise(function(resolve, reject) {
            let { db } = require('../db/db');
            db.query('SELECT * FROM user_allowed_origin WHERE user_id = ?', [user.id], function(error, results, fields) {
              let originMatches = false;
              for (let i = 0; i < results.length; i++) {
                if (results[i].origin === domain) {
                  originMatches = true;
                  break;
                }
              }
              if (!results.length || originMatches) {
                resolve(true);
              }
              else {
                resolve(false);
              }
            });
          });
        }
    };

    module.exports = permissions;
}());
