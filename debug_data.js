const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/fractal_core.sqlite');

db.all('SELECT EMP_ID, INSTANCE_NAME, IS_ACTIVE, DELETED_AT FROM vw_entidades_master', function(err, rows) {
    if (err) console.error(err);
    else {
        let reds = rows.filter(r => r.DELETED_AT !== null);
        let greens = rows.filter(r => r.DELETED_AT === null && r.IS_ACTIVE === 1);
        let cyans = rows.filter(r => r.DELETED_AT === null && r.IS_ACTIVE === 0);
        console.log(`Total: ${rows.length}, Reds (Deleted): ${reds.length}, Greens (Active): ${greens.length}, Cyans (Inactive): ${cyans.length}`);
    }
});
