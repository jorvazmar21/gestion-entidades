const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'fractal_core.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  
  const updates = [
    { id: 'M-CLIENTE', icon: 'mod_CLI' },
    { id: 'M-PROVEEDOR', icon: 'mod_PRV' },
    { id: 'M-PARQUE', icon: 'mod_PAR' },
    { id: 'M-SEDE', icon: 'mod_SED' },
    { id: 'M-OBRA', icon: 'mod_OBR' }
  ];

  db.serialize(() => {
    const stmt = db.prepare("UPDATE sys_moldes SET icono_sistema = ? WHERE id_molde = ?");
    updates.forEach(u => {
      stmt.run(u.icon, u.id);
    });
    stmt.finalize();
    console.log("Iconos de sys_moldes actualizados a sus archivos locales (mod_XXX.svg)");
  });
  
  db.close();
});
