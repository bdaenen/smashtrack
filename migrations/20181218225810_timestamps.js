let migrationHelper = require('../db/migrationHelper');

exports.up = async function(knex, Promise) {
    return Promise.all([
      knex.schema.table('character', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('match', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('match_data', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('player', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('player_data', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('stage', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('team', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('user', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('user_allowed_origin', function(table){migrationHelper.addTimestamps(knex, table)}),
      knex.schema.table('user_character', function(table){migrationHelper.addTimestamps(knex, table)})
    ]);
};

exports.down = async function(knex, Promise) {
    return Promise.all([
        knex.schema.table('character', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('match', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('match_data', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('player', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('player_data', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('stage', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('team', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('user', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('user_allowed_origin', function(table){migrationHelper.dropTimestamps(knex, table)}),
        knex.schema.table('user_character', function(table){migrationHelper.dropTimestamps(knex, table)})
    ]);
};
