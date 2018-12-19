(function() {
    'use strict';
    const uuid = require('uuid/v5');
    const NAMESPACE = 'e36de1a2-71af-4a14-a4c9-722d0a3e2f2e';

    module.exports = function(seed) {
        return uuid(seed, NAMESPACE);
    }
}());
