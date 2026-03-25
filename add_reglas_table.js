const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'fractal_core.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error abriendo DB:', err.message);
        process.exit(1);
    }
});

const ddl = `
CREATE TABLE IF NOT EXISTS sys_reglas_jerarquia (
    id_regla INTEGER PRIMARY KEY AUTOINCREMENT,
    id_molde_padre TEXT NOT NULL,
    id_molde_hijo TEXT NOT NULL,
    hijos_min INTEGER DEFAULT 0,
    hijos_max INTEGER DEFAULT -1, -- -1 significa N (infinitos)
    UNIQUE(id_molde_padre, id_molde_hijo)
);
`;

db.serialize(() => {
    db.run(ddl, (err) => {
        if (err) {
            console.error('Error ejecutando DDL:', err.message);
        } else {
            console.log('Tabla sys_reglas_jerarquia creada con éxito en la base de datos en caliente.');
        }
    });
});

db.close();
