-- =========================================================================
-- FRACTAL CORE V2 - L-MATRIX RELATIONAL ONTOLOGY & REA HYBRID
-- =========================================================================
-- DICTATORIAL RULES ENABLED:
-- 1. SQLite is a DUMB persistence layer. No triggers for UI logic.
-- 2. NodeJS handles ALL CQRS calculations and Security Pruning.
-- 3. Strict 4-Tier Hierarchical Graph (L1 -> L2 -> L3 -> L4).
-- =========================================================================

PRAGMA foreign_keys = ON;

-- =========================================================================
-- 0. META-PROMPTING / AI SYSTEM DIRECTIVES
-- =========================================================================

CREATE TABLE IF NOT EXISTS sys_ai_ontology_manifest (
    ai_concept_token TEXT PRIMARY KEY,
    semantic_description_for_transformer TEXT,
    expected_data_shape_example TEXT,
    relational_enforcement_rules TEXT,
    antigravity_execution_directive TEXT
);

CREATE TABLE IF NOT EXISTS sys_ai_behavioral_directives (
    directive_id TEXT PRIMARY KEY,
    activation_context TEXT NOT NULL,
    ai_attention_weight TEXT NOT NULL,
    imperative_prompt_instruction TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rel_ai_behavior_to_table_bridge (
    target_table_name TEXT NOT NULL,
    directive_id TEXT NOT NULL REFERENCES sys_ai_behavioral_directives(directive_id) ON DELETE CASCADE,
    ai_attention_enforcement_reason TEXT NOT NULL,
    PRIMARY KEY (target_table_name, directive_id)
);

-- =========================================================================
-- 1. L-MATRIX ENTITY HIERARCHY (The 4-Tier Semantic Tree)
-- =========================================================================

-- L1: CATEGORY (The Root Concept. E.g., 'EMPRESA', 'OBRA')
CREATE TABLE IF NOT EXISTS def_entity_l1_category (
    id_l1 INTEGER PRIMARY KEY AUTOINCREMENT,
    l1_code TEXT NOT NULL UNIQUE,          
    human_readable_name TEXT NOT NULL UNIQUE,
    ui_icon_identifier TEXT,
    ui_order INTEGER DEFAULT 0,            
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- L2: FAMILY (The Business Division. E.g., 'NOUTE', 'UTE')
CREATE TABLE IF NOT EXISTS def_entity_l2_family (
    id_l2 INTEGER PRIMARY KEY AUTOINCREMENT,
    l2_code TEXT NOT NULL UNIQUE,          
    fk_l1 INTEGER NOT NULL REFERENCES def_entity_l1_category(id_l1) ON DELETE RESTRICT,
    human_readable_name TEXT NOT NULL,
    ui_order INTEGER DEFAULT 0,            
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- L3: TYPE (The Concrete Mold. E.g., 'UTE-STANDAR')
CREATE TABLE IF NOT EXISTS def_entity_l3_type (
    id_l3 INTEGER PRIMARY KEY AUTOINCREMENT,
    l3_code TEXT NOT NULL UNIQUE,          
    fk_l2 INTEGER NOT NULL REFERENCES def_entity_l2_family(id_l2) ON DELETE RESTRICT,
    human_readable_name TEXT NOT NULL,
    ui_order INTEGER DEFAULT 0,            
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- L4: INSTANCE (The Live Physical Record. E.g., 'Nortunel S.A')
CREATE TABLE IF NOT EXISTS dat_entity_l4_instance (
    l4_id TEXT PRIMARY KEY,
    fk_l3 INTEGER NOT NULL REFERENCES def_entity_l3_type(id_l3) ON DELETE RESTRICT,
    unique_human_code TEXT UNIQUE NOT NULL, 
    instance_name TEXT NOT NULL,
    lifecycle_phase TEXT DEFAULT 'ACTIVE',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- =========================================================================
-- 2. GRAPH TOPOLOGY (Operational Links M:N)
-- =========================================================================

CREATE TABLE IF NOT EXISTS rel_entity_topology_graph (
    link_id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_l4_id TEXT NOT NULL REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    child_l4_id TEXT NOT NULL REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    link_context TEXT NOT NULL DEFAULT 'OPERATIONAL_OWNERSHIP',
    UNIQUE(parent_l4_id, child_l4_id, link_context)
);

-- =========================================================================
-- 3. PARAMETRIC PROPERTY SETS (CQRS DICTIONARIES)
-- =========================================================================

-- Tabla Centralizada de Grupos de UI (Evita desnormalización alfabética)
CREATE TABLE IF NOT EXISTS def_ui_groups (
    id_ui_group INTEGER PRIMARY KEY AUTOINCREMENT,
    ui_group_code TEXT UNIQUE NOT NULL,
    ui_group_name TEXT NOT NULL UNIQUE,
    ui_order INTEGER DEFAULT 0,            
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- The PSet Dictionary (DataSchema + UISchema locked in JSON)
CREATE TABLE IF NOT EXISTS def_pset_template (
    id_pset INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_code TEXT UNIQUE NOT NULL,      
    schema_alias TEXT UNIQUE NOT NULL,
    fk_ui_group INTEGER NOT NULL REFERENCES def_ui_groups(id_ui_group) ON DELETE RESTRICT,
    ui_order INTEGER DEFAULT 0,            
    json_shape_definition JSON NOT NULL,   
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- The Polymorphic Transversal Bridge (Attaching PSets to L1, L2, L3, or L4)
CREATE TABLE IF NOT EXISTS rel_pset_to_entity_bridge (
    fk_pset INTEGER NOT NULL REFERENCES def_pset_template(id_pset) ON DELETE CASCADE,
    target_uuid TEXT NOT NULL,             
    attachment_level_enum TEXT NOT NULL,   -- 'L1', 'L2', 'L3', 'L4'
    PRIMARY KEY (fk_pset, target_uuid)
);

-- =========================================================================
-- 4. LIVE PAYLOADS (The User's Real Data)
-- =========================================================================

CREATE TABLE IF NOT EXISTS dat_pset_live_payloads (
    l4_instance_id TEXT NOT NULL REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    fk_pset INTEGER NOT NULL REFERENCES def_pset_template(id_pset) ON DELETE RESTRICT,
    json_payload JSON NOT NULL,    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    PRIMARY KEY (l4_instance_id, fk_pset)
);

-- Audit Trail for Live Payloads
CREATE TABLE IF NOT EXISTS sys_psets_audit_log (
    id_audit INTEGER PRIMARY KEY AUTOINCREMENT,
    l4_instance_id TEXT NOT NULL REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    fk_pset INTEGER NOT NULL REFERENCES def_pset_template(id_pset) ON DELETE RESTRICT,
    valor_anterior JSON,
    valor_nuevo JSON NOT NULL,
    motivo_cambio TEXT,
    modificado_por TEXT NOT NULL,
    modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 5. REA EVENT / DESGLOSE SYSTEM (Preserved transactional core)
-- =========================================================================

-- Eventos Transaccionales
CREATE TABLE IF NOT EXISTS eventos_l3 (
    id_evento TEXT PRIMARY KEY,
    fk_l3 INTEGER NOT NULL REFERENCES def_entity_l3_type(id_l3), 
    origen_l4_id TEXT REFERENCES dat_entity_l4_instance(l4_id), 
    descripcion TEXT NOT NULL,
    estado TEXT DEFAULT 'BORRADOR', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

-- Desgloses de Eventos
CREATE TABLE IF NOT EXISTS desgloses_l4 (
    id_desglose TEXT PRIMARY KEY,
    id_evento TEXT NOT NULL REFERENCES eventos_l3(id_evento) ON DELETE CASCADE,
    fk_l3 INTEGER NOT NULL REFERENCES def_entity_l3_type(id_l3), 
    destino_l4_id TEXT NOT NULL REFERENCES dat_entity_l4_instance(l4_id), 
    descripcion TEXT,
    importe_neto REAL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

-- =========================================================================
-- 6. LA MATRIZ CUATRIDIMENSIONAL (Motor ABAC)
-- =========================================================================
CREATE TABLE IF NOT EXISTS sys_abac_matrix (
    id_regla INTEGER PRIMARY KEY AUTOINCREMENT,
    fase_obra TEXT NOT NULL,
    departamento TEXT NOT NULL,
    rol_autoridad TEXT NOT NULL,
    can_view INTEGER DEFAULT 0,
    can_edit INTEGER DEFAULT 0,
    can_approve INTEGER DEFAULT 0
);
