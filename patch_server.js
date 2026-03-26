const fs = require('fs');

try {
    let code = fs.readFileSync('server.js', 'utf8');

    // 1. REEMPLAZAR API LOAD
    const loadRegex = /\/\/ A\. API: CARGAR DATOS[\s\S]*?(?=    \/\/ A2\. API: LOGIN SEGURO)/;
    code = code.replace(loadRegex, `    // A. API: CARGAR DATOS (L-MATRIX)
    if (req.url === '/api/load' && req.method === 'GET') {
        try {
            const db = await sqlDbPromise;
            
            const l1_categories = await db.all('SELECT * FROM def_entity_l1_category');
            const l2_families = await db.all('SELECT * FROM def_entity_l2_family');
            const l3_types = await db.all('SELECT * FROM def_entity_l3_type');
            const l4_instances = await db.all('SELECT * FROM dat_entity_l4_instance');
            const topology_graph = await db.all('SELECT * FROM rel_entity_topology_graph');
            const psets_template_raw = await db.all('SELECT * FROM def_pset_template');
            const psets_bridge = await db.all('SELECT * FROM rel_pset_to_entity_bridge');
            const psets_payloads_raw = await db.all('SELECT * FROM dat_pset_live_payloads');
            const eventos_l3 = await db.all('SELECT * FROM eventos_l3');
            const desgloses_l4 = await db.all('SELECT * FROM desgloses_l4');

            const psets_template = psets_template_raw.map(p => ({ ...p, json_shape_definition: p.json_shape_definition ? JSON.parse(p.json_shape_definition) : {} }));
            const psets_payloads = psets_payloads_raw.map(p => ({ ...p, json_payload: p.json_payload ? JSON.parse(p.json_payload) : {} }));

            let appConfig = {};
            if (fs.existsSync(CSV_FILES.app_config)) {
                try {
                   const txt = fs.readFileSync(CSV_FILES.app_config, 'utf8');
                   if (txt) appConfig = JSON.parse(txt);
                } catch(e) {}
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                appConfig: appConfig,
                sqlData: { l1_categories, l2_families, l3_types, l4_instances, topology_graph, psets_template, psets_bridge, psets_payloads, eventos_l3, desgloses_l4 }
            }));
        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
        return;
    }

`);

    // 2. REEMPLAZAR API SAVE
    const saveRegex = /\/\/ B\. API: GUARDAR DATOS \(TRANSACCIÓN COMPLETA SQLITE\)[\s\S]*?(?=    \/\/ E\. API: GUARDAR CONFIGURACION)/;
    code = code.replace(saveRegex, `    // B. API: GUARDAR DATOS (L-MATRIX CQRS - ADMIN ONLY FOR NOW)
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
             res.writeHead(503, { 'Content-Type': 'application/json' });
             res.end(JSON.stringify({ success: false, error: 'Endpoint legacy /api/save deshabilitado. En el modelo L-Matrix se usan Puts individuales CQRS.' }));
        });
        return;
    }

    // B2. API CQRS: PUT INSTANCE PAYLOAD
    if (req.url.startsWith('/api/instances/put') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
             try {
                 const payload = JSON.parse(body);
                 const { l4_instance_id, pset_id, json_payload, __v } = payload;
                 
                 await queueWriteTransaction(async () => {
                     const db = await sqlDbPromise;
                     // Implement Optimistic Concurrency Control
                     const current = await db.get('SELECT json_payload FROM dat_pset_live_payloads WHERE l4_instance_id = ? AND pset_id = ?', [l4_instance_id, pset_id]);
                     
                     if (current) {
                         const currentData = JSON.parse(current.json_payload);
                         if (currentData.__v && currentData.__v !== __v) {
                             throw new Error('HTTP 409 Conflict: El documento ha sido modificado por otro usuario. Recarga la página.');
                         }
                     }

                     // Inject new version
                     const newPayload = { ...json_payload, __v: (__v || 0) + 1 };
                     
                     await db.run(\`
                         INSERT INTO dat_pset_live_payloads (l4_instance_id, pset_id, json_payload, updated_at, updated_by)
                         VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'SYSTEM')
                         ON CONFLICT(l4_instance_id, pset_id) DO UPDATE SET 
                         json_payload = excluded.json_payload, 
                         updated_at = excluded.updated_at
                     \`, [l4_instance_id, pset_id, JSON.stringify(newPayload)]);
                 });
                 res.writeHead(200, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ success: true }));
             } catch(e) {
                 const status = e.message.includes('409') ? 409 : 500;
                 res.writeHead(status, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ success: false, error: e.message }));
             }
        });
        return;
    }

`);

    fs.writeFileSync('server.js', code);
    console.log('server.js parcheado correctamente.');
} catch (e) {
    console.error('Error parcheando server.js:', e);
}
