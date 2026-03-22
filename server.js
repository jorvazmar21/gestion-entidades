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

function processWriteQueue() {
    if (isWriting || writeQueue.length === 0) return;
    isWriting = true;

    // Extraer la primera tarea
    const task = writeQueue.shift();

    try {
        // Ejecutar escritura a Disco
        task.execute();
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

    // A. API: CARGAR DATOS
    if (req.url === '/api/load' && req.method === 'GET') {
        try {
            // Verificar primero si existe tipos_entidad.csv (CRÍTICO)
            if (!fs.existsSync(CSV_FILES.tipos_entidad)) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: "CRITICAL_MISSING_TYPES",
                    message: "Error de carga de datos. No existe tabla de sistema 'Tipos de Entidad', póngase en contacto con el administrador."
                }));
                return;
            }

            const rawMaster = fs.readFileSync(CSV_FILES.master, 'utf8').split('\n').filter(l => l.trim() !== '');
            const rawDefs = fs.readFileSync(CSV_FILES.psets_def, 'utf8').split('\n').filter(l => l.trim() !== '');
            const rawVals = fs.readFileSync(CSV_FILES.psets_val, 'utf8').split('\n').filter(l => l.trim() !== '');
            const rawDyns = fs.readFileSync(CSV_FILES.psets_dyn, 'utf8').split('\n').filter(l => l.trim() !== '');
            const rawTipos = fs.readFileSync(CSV_FILES.tipos_entidad, 'utf8').split('\n').filter(l => l.trim() !== '');

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
                csvData: {
                    master: rawMaster.slice(1),
                    psets_def: rawDefs.slice(1),
                    psets_val: rawVals.slice(1),
                    psets_dyn: rawDyns.slice(1),
                    tipos_entidad: rawTipos.slice(1)
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

    // B. API: GUARDAR DATOS (TRANSACCIÓN COMPLETA)
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body); // Recibe el estado entero de la RAM

                // Encolar escritura a disco
                const result = await queueWriteTransaction(() => {
                    // Generar CSV Master (17 columnas)
                    let csvMaster = "id;level;category;subCategory;type;code;name;location;canal;parentId;isActive;deletedAt;deletedBy;createdAt;createdBy;updatedAt;updatedBy\n";
                    payload.db.forEach(r => {
                        csvMaster += `${escapeCSV(r.id)};${escapeCSV(r.level || '')};${escapeCSV(r.category || '')};${escapeCSV(r.subCategory || '')};${escapeCSV(r.type)};${escapeCSV(r.code)};${escapeCSV(r.name)};${escapeCSV(r.location || '')};${escapeCSV(r.canal || '')};${escapeCSV(r.parentId || '')};${r.isActive};${escapeCSV(r.deletedAt)};${escapeCSV(r.deletedBy || '')};${escapeCSV(r.createdAt)};${escapeCSV(r.createdBy || '')};${escapeCSV(r.updatedAt)};${escapeCSV(r.updatedBy || '')}\n`;
                    });
                    fs.writeFileSync(CSV_FILES.master, csvMaster, 'utf8');

                    // Generar CSV Defs
                    let csvDefs = "id_pset;behavior;appliesTo;properties\n";
                    payload.psets_def.forEach(d => {
                        csvDefs += `${escapeCSV(d.id_pset)};${escapeCSV(d.behavior)};${escapeCSV(JSON.stringify(d.appliesTo))};${escapeCSV(JSON.stringify(d.properties))}\n`;
                    });
                    fs.writeFileSync(CSV_FILES.psets_def, csvDefs, 'utf8');

                    // Generar CSV Vals (Objeto -> Filas)
                    let csvVals = "id_entity;id_pset;data\n";
                    for (const [key, value] of Object.entries(payload.psetValuesDb)) {
                        const [id_ent, id_pst] = key.split('_');
                        if (id_ent && id_pst) {
                            csvVals += `${escapeCSV(id_ent)};${escapeCSV(id_pst)};${escapeCSV(JSON.stringify(value))}\n`;
                        }
                    }
                    fs.writeFileSync(CSV_FILES.psets_val, csvVals, 'utf8');

                    // Generar CSV Dyns
                    let csvDyns = "id_record;id_entity;id_pset;timestamp;data\n";
                    payload.psetHistoryDb.forEach(h => {
                        csvDyns += `${escapeCSV(h.id_record)};${escapeCSV(h.id_entity)};${escapeCSV(h.id_pset)};${escapeCSV(h.timestamp)};${escapeCSV(JSON.stringify(h.data))}\n`;
                    });
                    fs.writeFileSync(CSV_FILES.psets_dyn, csvDyns, 'utf8');

                    // Generar CSV Tipos
                    if (payload.tiposEntidadDb) {
                        let csvTipos = "id_tipo;nombre;categoria;subCategoria;nivel;icono;tipos_hijo_permitidos;max_count_per_parent\n";
                        payload.tiposEntidadDb.forEach(t => {
                            csvTipos += `${escapeCSV(t.id_tipo)};${escapeCSV(t.nombre)};${escapeCSV(t.categoria)};${escapeCSV(t.subCategoria)};${escapeCSV(t.nivel)};${escapeCSV(t.icono)};${escapeCSV(JSON.stringify(t.tipos_hijo_permitidos))};${escapeCSV(t.max_count_per_parent)}\n`;
                        });
                        fs.writeFileSync(CSV_FILES.tipos_entidad, csvTipos, 'utf8');
                    }

                    console.log(`✅ Base de Datos Guardada CSV. Volcadas ${payload.db.length} filas maestras.`);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));

            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
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
                console.error("Config save error:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // D. API: UPLOAD BASE64 MEDIA
    if (req.url === '/api/upload-media' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { filename, base64Data } = payload;
                if (!filename || !base64Data || filename.includes('..') || filename.includes('server.js')) {
                    throw new Error("Datos de subida inválidos o inseguros");
                }

                // Determinar la carpeta destino absoluta bajo datos_csv/
                // (el filename que viene es 'media/xxx.ext')
                const targetPath = path.join(DATA_DIR, filename);
                const dirPath = path.dirname(targetPath);
                
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }

                // Parsear el base64
                const matches = base64Data.match(/^data:(.*?);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    throw new Error("String base64 inválida");
                }
                const imageBuffer = Buffer.from(matches[2], 'base64');

                // Sobrescribir el archivo brutalmente
                fs.writeFileSync(targetPath, imageBuffer);
                
                console.log(`✅ Archivo Media actualizado: ${targetPath}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Archivo actualizado' }));
            } catch (err) {
                console.error("❌ Error subiendo media:", err);
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
