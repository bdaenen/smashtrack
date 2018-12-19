(function () {
    'use strict';
    module.exports = {
        addTimestamps: function(knex, table) {
            table.datetime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            table.datetime('updated_at').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'));
        },
        dropTimestamps: function(knex, table) {
            table.dropColumns('created_at', 'updated_at');
        }
    };
}());
