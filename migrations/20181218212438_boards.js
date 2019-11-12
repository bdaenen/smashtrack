let migrationHelper = require('../db/migrationHelper');

exports.up = async function(knex, Promise) {
    await knex.schema.createTable('board', function(table) {
        table.increments();
        table.string('name').notNullable();
        table.uuid('uuid').notNullable();

        migrationHelper.addTimestamps(knex, table);
    });

    await knex.schema.createTable('board_user', function(table) {
        table.increments();
        table.integer('board_id').unsigned();
        table.integer('user_id').unsigned();
        table.unique(['board_id', 'user_id']);
        table.boolean('is_admin').notNullable();

        table
            .foreign('board_id')
            .references('board.id')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        table
            .foreign('user_id')
            .references('user.id')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        migrationHelper.addTimestamps(knex, table);
    });

    await knex.schema.createTable('board_match', function(table) {
        table.increments();
        table.integer('board_id').unsigned();
        table.integer('match_id').unsigned();

        table
            .foreign('board_id')
            .references('board.id')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        table
            .foreign('match_id')
            .references('match.id')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        migrationHelper.addTimestamps(knex, table);
    });

    return Promise.resolve();
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTable('board_match');
    await knex.schema.dropTable('board_user');
    await knex.schema.dropTable('board');

    return Promise.resolve();
};
