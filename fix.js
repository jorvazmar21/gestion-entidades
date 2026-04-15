const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const badBlock = "                res.writeHead(200, { 'Content-Type': 'application/json' });\n" +
"                res.end(JSON.stringify({ success: true, message: 'Archivo actualizado' }));\n" +
"            } catch (err) {\n" +
"            const schemaData = [];"

const goodBlock = "                res.writeHead(200, { 'Content-Type': 'application/json' });\n" +
"                res.end(JSON.stringify({ success: true, message: 'Archivo actualizado' }));\n" +
"            } catch (err) {\n" +
"                console.error('Error subiendo media:', err);\n" +
"                res.writeHead(500, { 'Content-Type': 'application/json' });\n" +
"                res.end(JSON.stringify({ success: false, error: err.message }));\n" +
"            }\n" +
"        });\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    // F. API AUDITORIA: MODO DIOS (Lectura Cruda GET)\n" +
"    if (req.url.startsWith('/api/raw-db') && req.method === 'GET' && !req.url.includes('/update')) {\n" +
"        try {\n" +
"            const urlObj = new URL(req.url, `http://${req.headers.host}`);\n" +
"            const table = urlObj.searchParams.get('table');\n" +
"            if (!table || table.includes(';') || table.includes(' ')) throw new Error('Tabla inválida');\n" +
"            \n" +
"            const db = await sqlDbPromise;\n" +
"            const tables = await db.all('SELECT name FROM sqlite_master WHERE type=\"table\" OR type=\"view\"');\n" +
"            if (!tables.some(t => t.name === table)) throw new Error('Tabla no encontrada');\n" +
"            \n" +
"            const rows = await db.all(`SELECT * FROM ${table}`);\n" +
"            res.writeHead(200, { 'Content-Type': 'application/json' });\n" +
"            res.end(JSON.stringify({ success: true, data: rows }));\n" +
"        } catch (e) {\n" +
"            console.error(e);\n" +
"            res.writeHead(500, { 'Content-Type': 'application/json' });\n" +
"            res.end(JSON.stringify({ success: false, error: e.message }));\n" +
"        }\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    // F2. API MODO DIOS: Lectura con Condiciones (POST)\n" +
"    if (req.url === '/api/raw-db/read' && req.method === 'POST') {\n" +
"        let body = '';\n" +
"        req.on('data', chunk => body += chunk);\n" +
"        req.on('end', async () => {\n" +
"             try {\n" +
"                 const { table, conditions } = JSON.parse(body);\n" +
"                 if (!table || table.includes(';') || table.includes(' ')) throw new Error('Tabla inválida');\n" +
"                 \n" +
"                 const db = await sqlDbPromise;\n" +
"                 const tables = await db.all('SELECT name FROM sqlite_master WHERE type=\"table\" OR type=\"view\"');\n" +
"                 if (!tables.some(t => t.name === table)) throw new Error('Tabla no encontrada');\n" +
"                 \n" +
"                 let query = `SELECT * FROM ${table}`;\n" +
"                 let params = [];\n" +
"                 \n" +
"                 if (conditions && Object.keys(conditions).length > 0) {\n" +
"                     const keys = Object.keys(conditions);\n" +
"                     const whereClauses = keys.map(k => `${k} = ?`);\n" +
"                     query += ` WHERE ` + whereClauses.join(' AND ');\n" +
"                     params = keys.map(k => conditions[k]);\n" +
"                 }\n" +
"                 \n" +
"                 const rows = await db.all(query, params);\n" +
"                 res.writeHead(200, { 'Content-Type': 'application/json' });\n" +
"                 res.end(JSON.stringify({ success: true, data: rows }));\n" +
"             } catch (e) {\n" +
"                 console.error(e);\n" +
"                 res.writeHead(500, { 'Content-Type': 'application/json' });\n" +
"                 res.end(JSON.stringify({ success: false, error: e.message }));\n" +
"             }\n" +
"        });\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    // G. API AUDITORIA: ESQUEMA (Diccionario)\n" +
"    if (req.url === '/api/schema-db' && req.method === 'GET') {\n" +
"        try {\n" +
"            const db = await sqlDbPromise;\n" +
"            const tables = await db.all('SELECT name FROM sqlite_master WHERE type=\"table\" AND name NOT LIKE \"sqlite_%\"');\n" +
"            \n" +
"            const schemaData = [];"

code = code.replace(badBlock, goodBlock);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed server.js');
