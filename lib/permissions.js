(function() {
    let permissions = {
        canUserRead: function(req, res) {
            return this.checkPermissions(req.user, 'read');
        },
        canUserWrite(req, res) {
            return this.checkPermissions(req.user, 'write');
        },
        isUserAdmin(req, res) {
            return this.checkPermissions(req.user, 'admin');
        },
        checkReadPermission: function(req, res) {
            let can = this.checkPermissions(req.user, 'read');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        checkWritePermission(req, res) {
            let can = this.checkPermissions(req.user, 'write');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        checkAdminPermission(req, res) {
            let can = this.checkPermissions(req.user, 'admin');
            if (!can) {
                res.sendStatus(403);
            }

            return can;
        },
        checkPermissions(user, type) {
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
        }
    };

    module.exports = permissions;
}());
