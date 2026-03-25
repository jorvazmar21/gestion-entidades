const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'fractal_core.sqlite');
const seedPath = path.join(__dirname, 'database', 'seed.sql');
const seed = fs.readFileSync(seedPath, 'utf8');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error(err.message);
  
  db.serialize(() => {
    // Apagamos FKs para poder vaciar limpiamente las tablas
    db.run("PRAGMA foreign_keys = OFF;");
    
    // Limpiamos los rastros antiguos (M-XXX)
    db.run("DELETE FROM eventos_l3;");
    db.run("DELETE FROM desgloses_l4;");
    db.run("DELETE FROM pset_estatico_valores;");
    db.run("DELETE FROM entidades;");
    db.run("DELETE FROM sys_moldes;");
    db.run("DELETE FROM sys_niveles;");
    
    // Inyectamos el nuevo SQL de semillas ya puro y rectificado (CLI, OBR, etc)
    db.exec(seed, (err) => {
      if (err) {
        console.error("Error ejecutando re-semilla:", err.message);
      } else {
        console.log("✅ Tablas de sistema reseteadas con los IDs de Tipo (CLI, OBR, etc).");
      }
    });
  });
  
  db.close();
});
