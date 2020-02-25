
exports.up = function up(knex) {
  return knex.schema.alterTable('jobs', (t) => {
    t.string('originatingRequest').defaultTo('unknown').notNullable();
    // It would be nice to do the following so that all new job requests would
    // throw an exception if they do not include an originatingRequest, but sqlite
    // doesn't support dropping defaults, so it would be completely different code
    // for different databases.
    // return knex.raw('ALTER TABLE jobs ALTER COLUMN originatingRequest DROP DEFAULT');
  });
};

exports.down = function down(knex) {
  return knex.schema.table('jobs', (t) => {
    t.dropColumn('originatingRequest');
  });
};
