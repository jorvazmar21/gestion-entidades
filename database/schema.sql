-- =========================================================================
-- FRACTAL CORE 1.0 - ESQUEMA RELACIONAL REA (L1-L5)
-- =========================================================================

-- 1. META-ARQUITECTURA (Las leyes de la física)
CREATE TABLE IF NOT EXISTS sys_niveles (
    id_nivel TEXT PRIMARY KEY,
    jerarquia INTEGER NOT NULL, -- 10, 20, 30, 40, 50 para poder ordenar
    nombre TEXT NOT NULL
);

-- 2. LOS MOLDES CANÓNICOS (El ADN de las entidades)
CREATE TABLE IF NOT EXISTS sys_moldes (
    id_molde TEXT PRIMARY KEY,
    id_tipo_entidad TEXT NOT NULL,
    id_nivel TEXT NOT NULL REFERENCES sys_niveles(id_nivel) ON DELETE RESTRICT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    reglas_config JSON, -- Array de moldes_padre admitidos, PSets Base obligatorios
    icono_sistema TEXT
);

-- 3. EL MUNDO DE LOS VIVOS (Niveles 1, 2 y 5 puros)
CREATE TABLE IF NOT EXISTS entidades (
    id_entidad TEXT PRIMARY KEY,
    id_molde TEXT NOT NULL REFERENCES sys_moldes(id_molde) ON DELETE RESTRICT,
    id_padre TEXT REFERENCES entidades(id_entidad) ON DELETE RESTRICT, -- Jerarquía (e.g. Obra pertenece a Cliente)
    
    -- PSets Fijos y Metadatos de Subsistencia (El Motor Oculto)
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    fase_actual TEXT DEFAULT 'ESTUDIO', -- Ciclo de Vida
    
    is_active INTEGER DEFAULT 1,
    deleted_at DATETIME,
    deleted_by TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT
);

-- 4. EL CATÁLOGO DE PROPIEDADES (Diccionario EAV)
CREATE TABLE IF NOT EXISTS sys_psets_def (
    id_pset TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'ESTATICO', 'DINAMICO'
    json_schema JSON NOT NULL -- Las preguntas/columnas que componen este PSet
);

-- 5. LOS VALORES ESTÁTICOS DE LAS ENTIDADES (El "UPDATE" directo)
CREATE TABLE IF NOT EXISTS pset_estatico_valores (
    id_entidad TEXT REFERENCES entidades(id_entidad) ON DELETE CASCADE,
    id_pset TEXT REFERENCES sys_psets_def(id_pset) ON DELETE RESTRICT,
    valor_json JSON NOT NULL, -- El volcado de respuestas
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    PRIMARY KEY (id_entidad, id_pset)
);

-- 6. LOS VALORES DINÁMICOS DE LAS ENTIDADES (El "INSERT ONLY" o Bitácora)
CREATE TABLE IF NOT EXISTS pset_dinamico_valores (
    id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
    id_entidad TEXT REFERENCES entidades(id_entidad) ON DELETE CASCADE,
    id_pset TEXT REFERENCES sys_psets_def(id_pset) ON DELETE RESTRICT,
    valor_json JSON NOT NULL,
    anotacion TEXT, -- Comentario del evento
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL
);

-- 7. EVENTOS Y TRANSACCIONES (Los Niveles 3 y 4 de Acción)
CREATE TABLE IF NOT EXISTS eventos_l3 (
    id_evento TEXT PRIMARY KEY,
    id_molde TEXT NOT NULL REFERENCES sys_moldes(id_molde), -- Ej: M-ORDEN-TRABAJO, M-REPARTO
    origen_l2_id TEXT REFERENCES entidades(id_entidad), -- Quién dispara / El Bolsillo base
    descripcion TEXT NOT NULL,
    estado TEXT DEFAULT 'BORRADOR', -- BORRADOR, EN CURSO, CERRADO
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

-- La "Línea de Factura" (L4) y Postulado de Imputación Única
CREATE TABLE IF NOT EXISTS desgloses_l4 (
    id_desglose TEXT PRIMARY KEY,
    id_evento TEXT NOT NULL REFERENCES eventos_l3(id_evento) ON DELETE CASCADE,
    id_molde TEXT NOT NULL REFERENCES sys_moldes(id_molde), -- Ej: M-SUBORDEN-TRABAJO
    destino_l2_id TEXT NOT NULL REFERENCES entidades(id_entidad), -- POSTULADO L4: UN SOLO DESTINO (QUIÉN PAGA)
    descripcion TEXT,
    
    -- Los L5 que caen en este saco se agrupan aquí temporalmente o transaccionan cantidad/moneda
    importe_neto REAL DEFAULT 0.00,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

-- 8. LA MATRIZ CUATRIDIMENSIONAL (Motor ABAC)
CREATE TABLE IF NOT EXISTS sys_abac_matrix (
    id_regla INTEGER PRIMARY KEY AUTOINCREMENT,
    fase_obra TEXT NOT NULL,
    departamento TEXT NOT NULL,
    rol_autoridad TEXT NOT NULL,
    can_view INTEGER DEFAULT 0,
    can_edit INTEGER DEFAULT 0,
    can_approve INTEGER DEFAULT 0
);

-- 9. LA TABLA EN LA SOMBRA (Audit Trail para PSets)
CREATE TABLE IF NOT EXISTS sys_psets_audit_log (
    id_audit INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_pset TEXT NOT NULL,
    id_referencia TEXT NOT NULL,
    id_entidad TEXT NOT NULL,
    id_pset TEXT NOT NULL,
    valor_anterior JSON,
    valor_nuevo JSON NOT NULL,
    motivo_cambio TEXT,
    modificado_por TEXT NOT NULL,
    modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. REGLAS DE JERARQUÍA (Cardinalidad de Árbol)
CREATE TABLE IF NOT EXISTS sys_reglas_jerarquia (
    id_regla INTEGER PRIMARY KEY AUTOINCREMENT,
    id_molde_padre TEXT NOT NULL,
    id_molde_hijo TEXT NOT NULL,
    hijos_min INTEGER DEFAULT 0,
    hijos_max INTEGER DEFAULT -1, -- -1 significa N (infinitos)
    UNIQUE(id_molde_padre, id_molde_hijo)
);

