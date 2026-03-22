/**
 * Propósito: Módulo principal de conexión a Base de Datos (SQLite) de FRACTAL CORE 1.0
 * Inputs: schema.sql (Modelo Arquitectura) y seed.sql (Moldes)
 * Acciones: Inicializa la BBDD física si no existe, impone PRAGMAS (seguridad e integridad de L4/L2)
 *           y devuelve la instancia activa para consultas en server.js.
 */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'fractal_core.sqlite');
let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;

    const isNewDb = !fs.existsSync(DB_FILE);

    try {
        dbInstance = await open({
            filename: DB_FILE,
            driver: sqlite3.Database
        });

        // ACTIVA CLAVES FORÁNEAS - CRÍTICO para el "Postulado de Unicidad L4"
        await dbInstance.exec('PRAGMA foreign_keys = ON;');

        if (isNewDb) {
            console.log('\n======================================================');
            console.log('📦 [DB-SQL] Base de datos no encontrada. Inicializando ERP...');
            console.log('======================================================\n');
            
            // 1. Esquema estructural
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await dbInstance.exec(schema);
            console.log('✅ Esquema Relacional de 5 Niveles (REA) ejecutado.');

            // 2. Inyección de Semillas (Libro Blanco)
            const seedPath = path.join(__dirname, 'seed.sql');
            const seed = fs.readFileSync(seedPath, 'utf8');
            await dbInstance.exec(seed);
            console.log('✅ Moldes Canónicos, Niveles y Metadatos sembrados con éxito.');
            
            console.log('\n🚀 Motor de base de datos FRACTAL CORE 1.0 activado y listo para ABAC.\n');
        } else {
            console.log('📦 [DB-SQL] Motor SQL Conectado (fractal_core.sqlite)');
        }

        return dbInstance;
    } catch (error) {
        console.error('❌ Error crítico inicializando SQLite:', error);
        throw error;
    }
}

module.exports = { getDb };

// Si el archivo se ejecuta directamente en la terminal, lo inicializamos para ver los logs
if (require.main === module) {
    getDb().catch(console.error);
}
