(function() {
    'use strict';
    const uuid = require('uuid/v5');
    const NAMESPACE = 'e36de1a2-71af-4a14-a4c9-722d0a3e2f2e';

    module.exports = function(seed) {
        let hrtime = process.hrtime();
        hrtime = hrtime[0] * 1000000 + hrtime[1] / 1000;
        seed += '_' + hrtime + Math.random() * Math.random();
        return uuid(seed, NAMESPACE);
    }
}());
