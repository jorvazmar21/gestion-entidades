const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/fractal_core.sqlite');

const queries = [
    `ALTER TABLE def_pset_groups ADD COLUMN deleted_by TEXT`,
    `ALTER TABLE def_pset_groups DROP COLUMN updated_at`,
    `ALTER TABLE def_pset_groups DROP COLUMN updated_by`
];

db.serialize(() => {
    queries.forEach(query => {
        db.run(query, (err) => {
            if (err) {
                console.error('Error executing query:', query);
                console.error(err.message);
            } else {
                console.log('Success:', query);
            }
        });
    });
});
