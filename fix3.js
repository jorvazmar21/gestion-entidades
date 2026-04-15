const fs = require('fs');
const path = 'server.js';
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

const badCatchIndex = lines.findIndex(l => l.includes('} catch (err) {'));
const schemaStart = lines.findIndex((l, i) => i > badCatchIndex && l.includes('const schemaData = [];'));

if (badCatchIndex !== -1 && schemaStart !== -1 && schemaStart === badCatchIndex + 1) {
    const top = lines.slice(0, badCatchIndex + 1);
    const bottom = lines.slice(schemaStart);
    
    const fillIn = `                console.error("❌ Error subiendo media:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // F. API AUDITORIA: MODO DIOS (Lectura Cruda GET)
    if (req.url.startsWith('/api/raw-db') && req.method === 'GET' && !req.url.includes('/update')) {
        try {
            const urlObj = new URL(req.url, \`http://\${req.headers.host}\`);
            const table = urlObj.searchParams.get('table');
            if (!table || table.includes(';') || table.includes(' ')) throw new Error("Tabla inválida");
            
            const db = await sqlDbPromise;
            const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table" OR type="view"');
            if (!tables.some(t => t.name === table)) throw new Error("Tabla no encontrada");
            
            const rows = await db.all(\`SELECT * FROM \${table}\`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: rows }));
        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
        return;
    }

    // F2. API MODO DIOS: Lectura con Condiciones (POST)
    if (req.url === '/api/raw-db/read' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
             try {
                 const { table, conditions } = JSON.parse(body);
                 if (!table || table.includes(';') || table.includes(' ')) throw new Error("Tabla inválida");
                 
                 const db = await sqlDbPromise;
                 const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table" OR type="view"');
                 if (!tables.some(t => t.name === table)) throw new Error("Tabla no encontrada");
                 
                 let query = \`SELECT * FROM \${table}\`;
                 let params = [];
                 
                 if (conditions && Object.keys(conditions).length > 0) {
                     const keys = Object.keys(conditions);
                     const whereClauses = keys.map(k => \`\${k} = ?\`);
                     query += \` WHERE \` + whereClauses.join(' AND ');
                     params = keys.map(k => conditions[k]);
                 }
                 
                 const rows = await db.all(query, params);
                 res.writeHead(200, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ success: true, data: rows }));
             } catch (e) {
                 console.error(e);
                 res.writeHead(500, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ success: false, error: e.message }));
             }
        });
        return;
    }

    // G. API AUDITORIA: ESQUEMA (Diccionario)
    if (req.url === '/api/schema-db' && req.method === 'GET') {
        try {
            const db = await sqlDbPromise;
            const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "sqlite_%"');`.split('\n');

    const newLines = [...top, ...fillIn, ...bottom];
    fs.writeFileSync(path, newLines.join('\n'), 'utf8');
    console.log("Fixed server.js correctly.");
} else {
    console.log("Could not find boundaries.");
}
