let migrationHelper = require('../db/migrationHelper');

exports.up = async function(knex, Promise) {
    await knex.schema.createTable('board_stage', function(table) {
        table.increments();
        table.integer('board_id').unsigned();
        table.integer('stage_id').unsigned();

        table
            .foreign('board_id')
            .references('board.id')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        table
            .foreign('stage_id')
            .references('stage.id')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        migrationHelper.addTimestamps(knex, table);
    });
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTable('board_stage');
};
