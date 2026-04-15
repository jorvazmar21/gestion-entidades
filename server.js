const http = require('http');
const fs = require('fs');
const path = require('path');

// Puerto donde escuchará el servidor
const PORT = 3000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces (LAN)

// Rutas
const DATA_DIR = path.join(__dirname, 'datos_csv');
const PUBLIC_DIR = __dirname; // Servir los archivos web desde aquí mismo

// Archivos CSV Maestro
const CSV_FILES = {
    master: path.join(DATA_DIR, 'maestro.csv'),
    psets_def: path.join(DATA_DIR, 'psets_def.csv'),
    psets_val: path.join(DATA_DIR, 'psets_val.csv'),
    psets_dyn: path.join(DATA_DIR, 'psets_dyn.csv'),
    tipos_entidad: path.join(DATA_DIR, 'tipos_entidad.csv'),
    usuarios: path.join(DATA_DIR, 'usuarios.csv'),
    app_config: path.join(DATA_DIR, 'app_config.json')
};

// 1. Asegurar Infraestructura
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
    console.log(`📁 Carpeta de base de datos creada: ${DATA_DIR}`);
}
const MEDIA_DIR = path.join(DATA_DIR, 'media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR);

// Crear archivos en blanco si no existen con sus cabeceras (excepto tipos_entidad que es crítico)
if (!fs.existsSync(CSV_FILES.master)) fs.writeFileSync(CSV_FILES.master, "id;level;category;subCategory;type;code;name;location;canal;parentId;isActive;deletedAt;deletedBy;createdAt;createdBy;updatedAt;updatedBy\n", 'utf8');
if (!fs.existsSync(CSV_FILES.psets_def)) fs.writeFileSync(CSV_FILES.psets_def, "id_pset;behavior;appliesTo;properties\n", 'utf8');
if (!fs.existsSync(CSV_FILES.psets_val)) fs.writeFileSync(CSV_FILES.psets_val, "id_entity;id_pset;data\n", 'utf8');
if (!fs.existsSync(CSV_FILES.psets_dyn)) fs.writeFileSync(CSV_FILES.psets_dyn, "id_record;id_entity;id_pset;timestamp;data\n", 'utf8');
if (!fs.existsSync(CSV_FILES.usuarios)) fs.writeFileSync(CSV_FILES.usuarios, "usuario;password;rol\nadmin;admin;admin\nzeus;zeus;zeus\n", 'utf8');
if (!fs.existsSync(CSV_FILES.app_config)) fs.writeFileSync(CSV_FILES.app_config, "{}\n", 'utf8');

// --- PASARELA HACIA SQLITE (EVOLUCIÓN L1-L5) ---
const { getDb } = require('./database/db');
// Iniciamos la BD silenciosamente al arrancar
let sqlDbPromise = getDb().catch(console.error);

// --- SISTEMA DE BLOQUEO DE ESCRITURA (CONCURRENCIA) ---
let isWriting = false;
const writeQueue = [];

async function processWriteQueue() {
    if (isWriting || writeQueue.length === 0) return;
    isWriting = true;

    // Extraer la primera tarea
    const task = writeQueue.shift();

    try {
        // Ejecutar escritura a Disco / SQLite
        await task.execute();
        task.resolve({ success: true, message: 'Guardado correctamente.' });
    } catch (err) {
        console.error("❌ Error en cola de escritura:", err);
        task.reject(err);
    } finally {
        isWriting = false;
        // Procesar siguiente microtarea si la hay
        setImmediate(processWriteQueue);
    }
}

function queueWriteTransaction(executeFn) {
    return new Promise((resolve, reject) => {
        writeQueue.push({ execute: executeFn, resolve, reject });
        processWriteQueue();
    });
}
// --------------------------------------------------------

// Helpers CSV
function escapeCSV(str) {
    if (str === null || str === undefined) return '""';
    const s = String(str);
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

// 2. Crear el Servidor Dual (Web API + Static Host)
const server = http.createServer(async (req, res) => {

    // CORS básico por si acaso
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204); res.end(); return;
    }

    // --- ENRUTADOR ---

        // A. API: CARGAR DATOS (L-MATRIX)
    if (req.url === '/api/load' && req.method === 'GET') {
        try {
            const db = await sqlDbPromise;
            
            const l1_categories = await db.all('SELECT * FROM def_entity_l1_category');
            const l2_families = await db.all('SELECT * FROM def_entity_l2_family');
            const l3_types = await db.all('SELECT * FROM def_entity_l3_type');
            const l4_instances = await db.all('SELECT * FROM dat_entity_l4_instance');
            const topology_graph = await db.all('SELECT * FROM rel_entity_topology_graph');
            const psets_template_raw = await db.all('SELECT * FROM def_pset_template WHERE deleted_at IS NULL');
            const psets_bridge = await db.all('SELECT * FROM rel_pset_to_entity_bridge');
            // Aplicamos un alias en vuelo (target_value_uuid AS l4_instance_id) para acoplar la BD con el Frontend sin tocar React
            const psets_payloads_raw = await db.all(`
                SELECT id_payload_record, target_value_uuid AS l4_instance_id, value_level_enum, fk_pset, json_payload, generation_date, generation_name 
                FROM dat_pset_live_payloads WHERE deleted_at IS NULL
            `);
            const eventos_l3 = await db.all('SELECT * FROM eventos_l3');
            const desgloses_l4 = await db.all('SELECT * FROM desgloses_l4');
            
            // ABAC V2 Matrix Dictionaries
            const lifecycle_phases = await db.all('SELECT * FROM def_lifecycle_phase');
            const company_departments = await db.all('SELECT * FROM def_company_department');
            const abac_matrix_rules = await db.all('SELECT * FROM rel_abac_matrix_rules');
            const sys_csv_templates = await db.all('SELECT * FROM sys_csv_templates');

            // Huerfanos L4 extensions para Mapeos (UI Data Grid Legacy)
            const dat_emp_company = await db.all('SELECT * FROM dat_emp_company');
            const rel_emp_jointventure = await db.all('SELECT * FROM rel_emp_jointventure');

            // TODO: Extraer Rol desde Sesión Segura. Mockeado para demostración inicial.
            const userRole = req.headers['x-user-role'] || 'ADMINISTRADOR'; 

            const psets_template = psets_template_raw.map(p => ({ ...p, json_shape_definition: p.json_shape_definition ? JSON.parse(p.json_shape_definition) : {} }));
            
            // BACKEND SECURITY PRUNING (REGLA 3.A - EL BISTURÍ DE SEGURIDAD)
            const psets_payloads = psets_payloads_raw.map(p => {
                let pd = p.json_payload ? JSON.parse(p.json_payload) : {};
                const template = psets_template.find(t => t.id_pset === p.fk_pset);
                if (template && template.json_shape_definition && template.json_shape_definition.UISchema) {
                    const uiSchema = template.json_shape_definition.UISchema;
                    Object.keys(uiSchema).forEach(key => {
                        const rules = uiSchema[key];
                        // Si existe regla de visibilidad, y el Rol del operario NO está en la lista...
                        if (rules && rules['security:visible_roles'] && !rules['security:visible_roles'].includes(userRole)) {
                            delete pd[key]; // <--- DESTRUCCIÓN FÍSICA DE LA VARIABLE. Jamás viaja por red.
                        }
                    });
                }
                return { ...p, json_payload: pd };
            });

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
                sqlData: { 
                    l1_categories, l2_families, l3_types, l4_instances, 
                    topology_graph, psets_template, psets_bridge, psets_payloads, 
                    eventos_l3, desgloses_l4,
                    lifecycle_phases, company_departments, abac_matrix_rules, sys_csv_templates,
                    dat_emp_company, rel_emp_jointventure
                }
            }));
        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
        return;
    }

    // A2. API: LOGIN SEGURO
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                const rawUsers = fs.readFileSync(CSV_FILES.usuarios, 'utf8').split('\n').filter(l => l.trim() !== '');
                
                let authSuccess = false;
                let userRole = null;
                
                // Empezamos en i=1 para saltar cabeceras: usuario;password;rol
                for (let i = 1; i < rawUsers.length; i++) {
                    const cols = rawUsers[i].split(';');
                    if (cols.length >= 3 && cols[0].trim() === username && cols[1].trim() === password) {
                        authSuccess = true;
                        userRole = cols[2].trim();
                        break;
                    }
                }
                
                if (authSuccess) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, user: username, role: userRole }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Credenciales inválidas o no autorizadas.' }));
                }
            } catch (e) {
                console.error("Login Error:", e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Error del servidor al validar credenciales.' }));
            }
        });
        return;
    }

        // B. API: GUARDAR DATOS (L-MATRIX CQRS - ADMIN ONLY FOR NOW)
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
                 const { l4_instance_id, fk_pset, json_payload, __v } = payload;
                 
                 await queueWriteTransaction(async () => {
                     const db = await sqlDbPromise;
                     // Implement Optimistic Concurrency Control
                     const current = await db.get('SELECT json_payload FROM dat_pset_live_payloads WHERE target_value_uuid = ? AND fk_pset = ? AND deleted_at IS NULL', [l4_instance_id, fk_pset]);
                     
                     if (current) {
                         const currentData = JSON.parse(current.json_payload);
                         if (currentData.__v && currentData.__v !== __v) {
                             throw new Error('HTTP 409 Conflict: El documento ha sido modificado por otro usuario. Recarga la página.');
                         }
                     }

                     // Inject new version
                     const newPayload = { ...json_payload, __v: (__v || 0) + 1 };
                     
                     if (current) {
                         await db.run(`
                             UPDATE dat_pset_live_payloads 
                             SET json_payload = ?
                             WHERE target_value_uuid = ? AND fk_pset = ?
                         `, [JSON.stringify(newPayload), l4_instance_id, fk_pset]);
                     } else {
                         const crypto = require('crypto');
                         const newId = 'PAY-DYNAMIC-' + crypto.randomUUID().replace(/-/g, '').substring(0, 8);
                         await db.run(`
                             INSERT INTO dat_pset_live_payloads (id_payload_record, target_value_uuid, value_level_enum, fk_pset, json_payload, created_by)
                             VALUES (?, ?, 'L4', ?, ?, 'SYSTEM')
                         `, [newId, l4_instance_id, fk_pset, JSON.stringify(newPayload)]);
                     }
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

    // B3. API: BULK CSV INGESTION (FASE 7 WIZARD)
    // REGLA: DIR_CSV_TRANSACTION_LOCK - ATOMIC PIPELINE
    if (req.url === '/api/instances/bulk' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
             try {
                 const payload = JSON.parse(body);
                 const { entityType, instances } = payload; // instances = [{l4_id, unique_human_code, instance_name, fk_l3, ...}]
                 
                 if (!instances || !Array.isArray(instances) || instances.length === 0) {
                     throw new Error("El arreglo de entidades de importación está vacío o dañado.");
                 }

                 await queueWriteTransaction(async () => {
                     const db = await sqlDbPromise;
                     
                     // PRE-COMPUTE: Motor Algorítmico de Inferencia Paramétrica L3
                     const l3PoolRows = await db.all(`
                        SELECT t.id_l3, t.l3_code, p.json_shape_definition 
                        FROM def_entity_l3_type t
                        JOIN def_entity_l2_family f ON t.fk_l2 = f.id_l2
                        JOIN def_entity_l1_category c ON f.fk_l1 = c.id_l1
                        LEFT JOIN rel_pset_to_entity_bridge b ON 
                             (b.target_uuid = CAST(t.id_l3 AS TEXT) AND b.attachment_level_enum = 'L3') OR
                             (b.target_uuid = CAST(f.id_l2 AS TEXT) AND b.attachment_level_enum = 'L2')
                        LEFT JOIN def_pset_template p ON b.fk_pset = p.id_pset
                        WHERE c.l1_code = ?
                     `, [entityType]);

                     // Decodificar los diccionarios estáticos
                     const l3Molds = l3PoolRows.map(r => {
                         let defaults = {};
                         if (r.json_shape_definition) {
                             try {
                                 const parsed = JSON.parse(r.json_shape_definition);
                                 if (parsed.DataSchema) {
                                     Object.keys(parsed.DataSchema).forEach(k => {
                                         if (parsed.DataSchema[k].default !== undefined) {
                                             defaults[k] = parsed.DataSchema[k].default;
                                         }
                                     });
                                 }
                             } catch(e){}
                         }
                         return { id_l3: r.id_l3, l3_code: r.l3_code, defaults };
                     });

                     if (l3Molds.length === 0) throw new Error(`No se ha encontrado ningún Molde L3 activo para la categoría ${entityType}. El árbol L-Matrix está huérfano.`);

                     // INÍCIO PROTEGIDO (TODO O NADA)
                     await db.exec('BEGIN TRANSACTION');
                     try {
                         const stmtL4 = await db.prepare(`
                             INSERT INTO dat_entity_l4_instance (l4_id, unique_human_code, instance_name, fk_l3, created_by) 
                             VALUES (?, ?, ?, ?, 'BULK_WIZARD')
                         `);
                         
                         const stmtPayload = await db.prepare(`
                             INSERT INTO dat_pset_live_payloads (id_payload_record, target_value_uuid, value_level_enum, fk_pset, json_payload, created_by)
                             VALUES (?, ?, 'L4', ?, ?, 'BULK_WIZARD')
                         `);

                         for (let instance of instances) {
                             if (!instance.unique_human_code || !instance.instance_name || instance.esUte === undefined) {
                                 throw new Error(`Integridad Rechazada: Faltan columnas obligatorias (unique_human_code, instance_name, esUte) -> ${JSON.stringify(instance)}`);
                             }

                             // Formatear booleano nativo
                             const isUteBoolean = (instance.esUte === true || String(instance.esUte).trim().toLowerCase() === 'true' || String(instance.esUte).trim().toLowerCase() === 'si');
                             instance.esUte = isUteBoolean; 
                             
                             // Mapear "esUte" a la convención "soyUte" usada internamente en seed.sql (Fallback mapping para robustez)
                             const searchParamKey = 'soyUte'; 
                             const searchParamVal = isUteBoolean;

                             // INFERENCIA ALGORÍTMICA: Buscar el molde que coincida.
                             let assigned_fk_l3 = null;
                             const matchedMolds = l3Molds.filter(m => m.defaults[searchParamKey] === searchParamVal);
                             
                             if (matchedMolds.length === 1) {
                                 assigned_fk_l3 = matchedMolds[0].id_l3;
                             } else if (matchedMolds.length > 1) {
                                 throw new Error(`Ambigüedad L-Matrix (Colisión de Moldes): El parámetro ${searchParamKey}=${searchParamVal} encaja en varios Moldes L3. El sistema no puede deducir la ruta genética a copiar unívocamente.`);
                             } else {
                                 throw new Error(`Inferencia Fallida: No existe ningún Molde L3 bajo ${entityType} que posea como requerimiento ${searchParamKey}=${searchParamVal}.`);
                             }
                             
                             instance.assigned_fk_l3 = assigned_fk_l3; // Fianza Arquitectónica para Node->React sync

                             // Si la carga masiva CSV no incluyó ID Relacional, lo auto-generamos
                             if (!instance.l4_id || instance.l4_id.trim() === '') {
                                 const crypto = require('crypto');
                                 instance.l4_id = crypto.randomUUID().replace(/-/g, '');
                             }

                             // 1. Forjamos la Entidad Vacía
                             await stmtL4.run([
                                 instance.l4_id, 
                                 instance.unique_human_code, 
                                 instance.instance_name, 
                                 assigned_fk_l3
                             ]);

                             // 2. Volcamos los Props Extras en el diccionario
                             const psetId = 1; 
                             const dynamicProps = { cif: instance.cif, soyUte: isUteBoolean };
                             
                             const payloadJson = JSON.stringify({ ...dynamicProps, __v: 1 });
                             const crypto = require('crypto');
                             const newId = 'PAY-BULK-' + crypto.randomUUID().replace(/-/g, '').substring(0, 8);
                             await stmtPayload.run([newId, instance.l4_id, psetId, payloadJson]);
                         }

                         await stmtL4.finalize();
                         await stmtPayload.finalize();
                         
                         await db.exec('COMMIT'); 
                     } catch(txErr) {
                         await db.exec('ROLLBACK'); 
                         throw txErr;
                     }
                 });
                 
                 res.writeHead(200, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ success: true, count: instances.length, instances }));
             } catch(e) {
                 console.error("API Bulk Critical Error:", e);
                 res.writeHead(500, { 'Content-Type': 'application/json' });
                 res.end(JSON.stringify({ success: false, error: e.message }));
             }
        });
        return;
    }

    // K. API TEMPLATES: DOWNLOAD DYNAMIC CSV FILES (FASE 7 WIZARD)
    if (req.url.startsWith('/api/templates/download') && req.method === 'GET') {
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const schemaCode = urlObj.searchParams.get('schema_code'); // Ej 'L1_EMP'
            const db = await sqlDbPromise;
            
            const row = await db.get(`
                SELECT t.file_path, t.template_name 
                FROM sys_csv_templates t 
                JOIN def_entity_l1_category c ON t.fk_l1 = c.id_l1 
                WHERE c.l1_code = ?`, [schemaCode]);
            
            if (!row || !row.file_path) throw new Error("Plantilla no configurada para este formato L-Matrix.");
            
            const targetPath = path.join(__dirname, row.file_path);
            if (!fs.existsSync(targetPath)) throw new Error("Archivo de plantilla físico no resuelto en el servidor.");
            
            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${path.basename(row.file_path)}"`
            });
            fs.createReadStream(targetPath).pipe(res);
        } catch(e) {
            console.error("Error descargando Template Masivo:", e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
        return;
    }

    // E. API: GUARDAR CONFIGURACION
    if (req.url === '/api/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                const result = await queueWriteTransaction(() => {
                    fs.writeFileSync(CSV_FILES.app_config, JSON.stringify(payload, null, 2), 'utf8');
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error("❌ Error subiendo media:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // F. API AUDITORIA: MODO DIOS (Lectura Cruda GET)
    if (req.url.startsWith('/api/raw-db') && req.method === 'GET' && !req.url.includes('/update')) {
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const table = urlObj.searchParams.get('table');
            if (!table || table.includes(';') || table.includes(' ')) throw new Error("Tabla inválida");
            
            const db = await sqlDbPromise;
            const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table" OR type="view"');
            if (!tables.some(t => t.name === table)) throw new Error("Tabla no encontrada");
            
            const rows = await db.all(`SELECT * FROM ${table}`);
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
                 
                 let query = `SELECT * FROM ${table}`;
                 let params = [];
                 
                 if (conditions && Object.keys(conditions).length > 0) {
                     const keys = Object.keys(conditions);
                     const whereClauses = keys.map(k => `${k} = ?`);
                     query += ` WHERE ` + whereClauses.join(' AND ');
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
            const tables = await db.all('SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "sqlite_%"');
            const schemaData = [];
            for (const t of tables) {
                const info = await db.all(`PRAGMA table_info(${t.name})`);
                schemaData.push({
                    name: t.name,
                    fields: info.map(f => ({
                        name: f.name,
                        type: f.type,
                        pk: f.pk,
                        notnull: f.notnull
                    }))
                });
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: schemaData }));
        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
        return;
    }

    // H. API AUDITORIA: ACTUALIZACIÓN SEGURA (Anti-corrupción)
    if (req.url === '/api/raw-db/update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { table, pkColumn, pkValue, updateColumn, newValue } = JSON.parse(body);
                
                // Muro Firewall Anti-corrupción
                const lowerCol = updateColumn.toLowerCase();
                const forbiddenExact = ['id', 'id_entidad', 'id_molde', 'id_pset', 'id_tipo', 'id_record'];
                const forbiddenTails = ['at', 'by', 'timestamp'];
                
                const isProtectedField = forbiddenExact.includes(lowerCol) || forbiddenTails.some(tail => lowerCol.endsWith(tail));

                if (isProtectedField || updateColumn === pkColumn) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Edición denegada por Firewall (Campo protegido de Auditoría o Clave Primaria).' }));
                    return;
                }
                
                // Basic anti-injection logic
                if (!table || table.includes(';') || table.includes(' ') || !updateColumn || !pkColumn) {
                    throw new Error("Parámetros SQL inseguros");
                }
                
                // Convert object/array back to string cleanly if newValue is object
                let finalValue = newValue;
                if (typeof newValue === 'object' && newValue !== null) {
                    finalValue = JSON.stringify(newValue);
                }

                await queueWriteTransaction(async () => {
                    const db = await sqlDbPromise;
                    const stmt = await db.prepare(`UPDATE ${table} SET ${updateColumn} = ? WHERE ${pkColumn} = ?`);
                    await stmt.run([finalValue, pkValue]);
                    await stmt.finalize();
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error("Error en raw update:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // H2. API AUDITORIA: CREATE ROW (Solo Tablas Maestras)
    if (req.url === '/api/raw-db/create' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { table, pkColumn, pkValue, id_molde_hijo } = JSON.parse(body);
                const allowedTables = ['sys_moldes', 'sys_niveles', 'sys_psets_def', 'sys_abac_matrix', 'sys_psets_audit_log', 'sys_reglas_jerarquia'];
                
                if (!allowedTables.includes(table)) {
                    throw new Error("Creación denegada. Solo aplicable a Tablas Maestras estructurales.");
                }
                if (!table || !pkColumn || pkValue === undefined) throw new Error("Parámetros SQL insuficientes");

                await queueWriteTransaction(async () => {
                    const db = await sqlDbPromise;
                    let stmt;
                    if (table === 'sys_abac_matrix') {
                        stmt = await db.prepare(`INSERT INTO sys_abac_matrix (fase_obra, departamento, rol_autoridad) VALUES ('NUEVO', 'NUEVO', 'NUEVO')`);
                        await stmt.run([]);
                    } else if (table === 'sys_reglas_jerarquia') {
                        if (!pkValue || !id_molde_hijo) throw new Error("Se requiere Padre e Hijo");
                        stmt = await db.prepare(`INSERT INTO sys_reglas_jerarquia (id_molde_padre, id_molde_hijo) VALUES (?, ?)`);
                        await stmt.run([pkValue, id_molde_hijo]);
                    } else if (table === 'sys_moldes') {
                        stmt = await db.prepare(`INSERT INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, icono_sistema, reglas_config) VALUES (?, 'XXX', 'L1', 'NUEVO MOLDE', 'sys_box.svg', '{}')`);
                        await stmt.run([pkValue]);
                    } else if (table === 'sys_psets_def') {
                        stmt = await db.prepare(`INSERT INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, 'NUEVO PSET', 'ESTATICO', '{}')`);
                        await stmt.run([pkValue]);
                    } else if (table === 'sys_niveles') {
                        stmt = await db.prepare(`INSERT INTO sys_niveles (id_nivel, jerarquia, nombre) VALUES (?, 999, 'NUEVO NIVEL')`);
                        await stmt.run([pkValue]);
                    } else if (pkColumn && pkValue !== null && pkValue !== '') {
                        stmt = await db.prepare(`INSERT INTO ${table} (${pkColumn}) VALUES (?)`);
                        await stmt.run([pkValue]);
                    } else {
                        throw new Error("Se requiere una Clave Primaria para insertar.");
                    }
                    if(stmt) await stmt.finalize();
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error("Error en raw create:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // H3. API AUDITORIA: DELETE ROW (Solo Tablas Maestras)
    if (req.url === '/api/raw-db/delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { table, pkColumn, pkValue } = JSON.parse(body);
                const allowedTables = ['sys_moldes', 'sys_niveles', 'sys_psets_def', 'sys_abac_matrix', 'sys_psets_audit_log', 'sys_reglas_jerarquia'];
                
                if (!allowedTables.includes(table)) {
                    throw new Error("Borrado denegado. Solo aplicable a Tablas Maestras estructurales.");
                }
                if (!table || !pkColumn || pkValue === undefined) throw new Error("Parámetros SQL insuficientes");

                await queueWriteTransaction(async () => {
                    const db = await sqlDbPromise;
                    const stmt = await db.prepare(`DELETE FROM ${table} WHERE ${pkColumn} = ?`);
                    await stmt.run([pkValue]);
                    await stmt.finalize();
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error("Error en raw delete:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // I. API MOLDE BUILDER: CREAR/ACTUALIZAR MOLDE
    if (req.url === '/api/moldes/create' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.id_molde || !payload.nombre || !payload.id_nivel) {
                    throw new Error("Faltan campos obligatorios para crear el Molde");
                }
                
                const safeId = payload.id_molde.toUpperCase().replace(/[^A-Z0-9_]/g, '');

                await queueWriteTransaction(async () => {
                    const db = await sqlDbPromise;
                    const stmt = await db.prepare(`
                        INSERT OR REPLACE INTO sys_moldes 
                        (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `);
                    
                    await stmt.run([
                        safeId,
                        payload.id_tipo_entidad || `ENTIDAD_${safeId}`,
                        payload.id_nivel,
                        payload.nombre,
                        payload.descripcion || '',
                        JSON.stringify(payload.reglas_config || {}),
                        payload.icono_sistema || 'sys_box.svg'
                    ]);
                    await stmt.finalize();
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: `Molde ${safeId} inyectado estructuralmente.` }));
            } catch (err) {
                console.error("Error creating molde:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // J. API MOLDE BUILDER: BORRAR MOLDE
    if (req.url === '/api/moldes/delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { id_molde } = JSON.parse(body);
                if (!id_molde) throw new Error("Falta id_molde");
                
                await queueWriteTransaction(async () => {
                    const db = await sqlDbPromise;
                    const stmt = await db.prepare(`DELETE FROM sys_moldes WHERE id_molde = ?`);
                    await stmt.run([id_molde]);
                    await stmt.finalize();
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error("Error deleting molde:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // C. SERVIDOR ESTÁTICO WEB
    
    // STATIC: MEDIA (Sirviendo desde datos_csv/media)
    if (req.url.startsWith('/media/')) {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const decodePath = decodeURIComponent(parsedUrl.pathname);
        const filePath = path.join(DATA_DIR, decodePath);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.ico') contentType = 'image/x-icon';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }

    // Si la ruta no es /api/* comprobamos si están pidiendo HTML, CSS o JS
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

    // Proteger lectura de secretos o backends
    if (req.url.includes('/datos_csv/') || req.url.includes('server.js')) {
        res.writeHead(403); res.end('Prohibido acceder a esta ruta.'); return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.ico': 'image/x-icon'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404); res.end('Archivo no encontrado');
            } else {
                res.writeHead(500); res.end('Error interno del servidor: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

// 3. Encender el servidor
server.listen(PORT, HOST, () => {
    console.log('\n=============================================');
    console.log('🚀 SERVIDOR WEB Y BASE DE DATOS INICIADO');
    console.log(`💻 Acceso desde PC local:    http://localhost:${PORT}`);
    console.log(`📱 Acceso desde Móvil LAN: Usa la IP local de tu PC.`);
    console.log(`📁 Carpeta CSV conectada:  ${DATA_DIR}`);
    console.log('=============================================\n');
    console.log('Presiona Ctrl+C para detener el servidor.');
});
