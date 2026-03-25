const db = require('./database/db.js');

(async () => {
    try {
        const conn = await db.getDb();
        
        // 1. Crear Nivel L0 (si no existe)
        await conn.run('INSERT OR IGNORE INTO sys_niveles (id_nivel, jerarquia, nombre) VALUES (?, ?, ?)', ['L0', 0, 'Entidad Transversal']);
        
        // 2. Crear Molde M_EMP (Empresa)
        const empir_config = {
            padres_permitidos: [],
            psets_obligatorios: ['PSET_FISCAL_EMP', 'PSET_ROLES_EMP', 'PSET_COMPOSICION_UTE_EMP']
        };
        await conn.run(
            'INSERT OR REPLACE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['M_EMP', 'EMP', 'L0', 'Empresas y Entidades', 'Catálogo Maestro de Empresas (Roles B2B)', JSON.stringify(empir_config), 'sys_box.svg']
        );
        
        // 3. Crear Molde M_OBR (Obra)
        const obr_config = {
            padres_permitidos: [],
            psets_obligatorios: ['PSET_AGENTES_OBR', 'PSET_GENERAL_OBR', 'PSET_JEFE_OBRA_OBR']
        };
        await conn.run(
            'INSERT OR REPLACE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['M_OBR', 'OBR', 'L1', 'Obras y Proyectos', 'Entidad de Producción Base', JSON.stringify(obr_config), 'sys_box.svg']
        );

        // 4. Crear PSets Estáticos para EMP
        const schema_fiscal = { properties: { nif: { type: 'string' }, razon_social: { type: 'string' }, domicilio_completo: { type: 'string' }, pagina_web: { type: 'string' } } };
        await conn.run('INSERT OR REPLACE INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, ?, ?, ?)', ['PSET_FISCAL_EMP', 'Datos Fiscales de Empresa', 'ESTATICO', JSON.stringify(schema_fiscal)]);

        const schema_roles = { properties: { es_propia: { type: 'boolean' }, es_ute: { type: 'boolean' }, es_cliente: { type: 'boolean' }, es_proveedor: { type: 'boolean' }, es_subcontrata: { type: 'boolean' } } };
        await conn.run('INSERT OR REPLACE INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, ?, ?, ?)', ['PSET_ROLES_EMP', 'Clasificación de Empresa', 'ESTATICO', JSON.stringify(schema_roles)]);

        const schema_ute = { properties: { empresas_miembro: { type: 'array', items: { type: 'object', properties: { id_empresa: { type: 'string' }, porcentaje: { type: 'number' } } } } } };
        await conn.run('INSERT OR REPLACE INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, ?, ?, ?)', ['PSET_COMPOSICION_UTE_EMP', 'Composición de Socios UTE', 'ESTATICO', JSON.stringify(schema_ute)]);

        // 5. Crear PSets para OBR
        const schema_agentes = { properties: { id_cliente: { type: 'string', description: 'Apunta a EMP' }, id_ejecutor: { type: 'string', description: 'Apunta a EMP' } } };
        await conn.run('INSERT OR REPLACE INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, ?, ?, ?)', ['PSET_AGENTES_OBR', 'Agentes Inmutables de Obra', 'ESTATICO', JSON.stringify(schema_agentes)]);

        const schema_general_obr = { properties: { presupuesto_base: { type: 'number' }, fecha_inicio: { type: 'string', format: 'date' }, estado_obra: { type: 'string' } } };
        await conn.run('INSERT OR REPLACE INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, ?, ?, ?)', ['PSET_GENERAL_OBR', 'Datos Base de Obra', 'ESTATICO', JSON.stringify(schema_general_obr)]);

        const schema_jefe_obr = { properties: { id_empleado: { type: 'string' }, fecha_nombramiento: { type: 'string', format: 'date' } } };
        await conn.run('INSERT OR REPLACE INTO sys_psets_def (id_pset, nombre, tipo, json_schema) VALUES (?, ?, ?, ?)', ['PSET_JEFE_OBRA_OBR', 'Registro Histórico Jefatura', 'DINAMICO', JSON.stringify(schema_jefe_obr)]);

        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        process.exit(0);
    }
})();
