const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/fractal_core.sqlite');

const queries = [
    `ALTER TABLE def_ui_groups RENAME COLUMN id_ui_group TO id_pset_group`,
    `ALTER TABLE def_ui_groups RENAME COLUMN ui_group_code TO pset_group_code`,
    `ALTER TABLE def_ui_groups RENAME COLUMN ui_group_name TO pset_group_name`,
    `ALTER TABLE def_ui_groups RENAME TO def_pset_groups`,
    `ALTER TABLE def_pset_template RENAME COLUMN fk_ui_group TO fk_pset_group`
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
