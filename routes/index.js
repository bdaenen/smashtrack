var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    switch (req.accepts(['*/*', 'html', 'json'])) {
        case 'html':
            res.set(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, private'
            );
            if (req.isAuthenticated()) {
                res.sendFile(path.resolve('./public/logged_in.html'));
            } else {
                res.sendFile(path.resolve('./public/login.html'));
            }
            break;
        case 'json':
        case '*/*':
        default:
            res.json({
                endpoints: [
                    '/characters',
                    '/login',
                    '/matches',
                    '/stages',
                    '/teams',
                    '/users',
                    '/admin',
                ],
            });
            break;
    }
});

module.exports = router;
