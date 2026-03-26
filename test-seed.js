const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');
    
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    db.exec(schema, (err) => {
        if (err) console.error("SCHEMA ERROR:", err);
        else {
            const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
            // Split by statement
            const statements = seed.split(';').map(s => s.trim()).filter(s => s.length > 0);
            
            let i = 0;
            function runNext() {
                if (i >= statements.length) return console.log("SUCCESS!");
                const stmt = statements[i];
                db.exec(stmt, (err) => {
                    if (err) {
                        console.error("\nERROR ON STATEMENT:");
                        console.error(stmt);
                        console.error("ERROR MESSAGE:", err.message);
                    } else {
                        i++;
                        runNext();
                    }
                });
            }
            runNext();
        }
    });
});
