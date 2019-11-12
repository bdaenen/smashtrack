let express = require('express');
let router = express.Router();
let path = require('path');
let passport = require('passport');
let User = require('../db/models/User');

router.get('/', async function(req, res, next) {
    let user = null;
    if (req.user) {
        user = await User.query()
          .first()
          .where('id', '=', req.user.id);
    }

    console.log(req.isAuthenticated());
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
                authenticated: req.isAuthenticated(),
                user: User.toApi(user),
                structure: {
                    tag: 'string',
                    password: 'string',
                },
            });
            break;
    }
});

router.get('/ok', function(req, res, next) {
    res.json({
        authenticated: req.isAuthenticated(),
    });
});

router.get('/error', function(req, res, next) {
    res.json({
        authenticated: req.isAuthenticated(),
    });
});

router.all('/logout', function(req, res, next) {
    let userName = req.user.tag;
    req.logout();
    res.json({
        success: true,
        message: `See you later, ${userName}!`,
    });
});

module.exports = router;
