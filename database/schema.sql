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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);

-- L2: FAMILY (The Business Division. E.g., 'NOUTE', 'UTE')
CREATE TABLE IF NOT EXISTS def_entity_l2_family (
    id_l2 INTEGER PRIMARY KEY AUTOINCREMENT,
    l2_code TEXT NOT NULL UNIQUE,          
    fk_l1 INTEGER NOT NULL REFERENCES def_entity_l1_category(id_l1) ON DELETE RESTRICT,
    human_readable_name TEXT NOT NULL,
    ui_order INTEGER DEFAULT 0,            
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);

-- L3: TYPE (The Concrete Mold. E.g., 'UTE-STANDAR')
CREATE TABLE IF NOT EXISTS def_entity_l3_type (
    id_l3 INTEGER PRIMARY KEY AUTOINCREMENT,
    l3_code TEXT NOT NULL UNIQUE,          
    fk_l2 INTEGER NOT NULL REFERENCES def_entity_l2_family(id_l2) ON DELETE RESTRICT,
    human_readable_name TEXT NOT NULL,
    ui_order INTEGER DEFAULT 0,            
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);

-- L4: INSTANCE (The Live Physical Record. E.g., 'Nortunel S.A')
CREATE TABLE IF NOT EXISTS dat_entity_l4_instance (
    l4_id TEXT PRIMARY KEY,
    fk_l3 INTEGER NOT NULL REFERENCES def_entity_l3_type(id_l3) ON DELETE RESTRICT,
    unique_human_code TEXT UNIQUE NOT NULL, 
    instance_name TEXT NOT NULL UNIQUE,
    fk_phase INTEGER REFERENCES def_lifecycle_phase(id_phase) ON DELETE RESTRICT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
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
    pset_behavior_type TEXT NOT NULL DEFAULT 'STATIC', -- 'STATIC', 'DYNAMIC', 'HYPERDYNAMIC'
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

-- The Polymorphic Transversal Bridge (Attaching PSets to L1, L2, L3)
CREATE TABLE IF NOT EXISTS rel_pset_to_entity_bridge (
    id_bridge INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_pset INTEGER NOT NULL REFERENCES def_pset_template(id_pset) ON DELETE CASCADE,
    target_definition_uuid TEXT NOT NULL,       
    definition_level_enum TEXT NOT NULL,        -- 'L1', 'L2', 'L3'
    UNIQUE (fk_pset, target_definition_uuid)
);

-- =========================================================================
-- 4. LIVE PAYLOADS (The User's Real Data)
-- =========================================================================

CREATE TABLE IF NOT EXISTS dat_pset_live_payloads (
    id_payload_record TEXT PRIMARY KEY,
    
    target_value_uuid TEXT NOT NULL,            -- UUID of the physical container (L4, L3, or L2)
    value_level_enum TEXT NOT NULL,             -- 'L4', 'L3', 'L2' (Enforces the hierarchical cascade)
    
    fk_pset INTEGER NOT NULL REFERENCES def_pset_template(id_pset) ON DELETE RESTRICT,
    json_payload JSON NOT NULL,    
    
    generation_date DATETIME,                   -- For DYNAMIC reports (Physical signature date)
    validity_start_date DATETIME,               -- Multiple contexts
    validity_end_date DATETIME,                 -- Multiple contexts
    
    deleted_at DATETIME,
    deleted_by TEXT
);

-- Audit Trail for Live Payloads
CREATE TABLE IF NOT EXISTS sys_pset_audit_log (
    id_audit_record INTEGER PRIMARY KEY AUTOINCREMENT,
    
    fk_pset INTEGER NOT NULL REFERENCES def_pset_template(id_pset) ON DELETE RESTRICT,
    payload_record_id TEXT REFERENCES dat_pset_live_payloads(id_payload_record) ON DELETE CASCADE, 
    
    target_value_uuid TEXT NOT NULL, 
    value_level_enum TEXT NOT NULL,  
    
    previous_value JSON,
    new_value JSON NOT NULL,
    change_reason TEXT,
    
    modified_by TEXT NOT NULL,
    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
-- 6. LA MATRIZ CUATRIDIMENSIONAL (Motor ABAC V2 Multidimensional)
-- =========================================================================

-- Fases de Vida (Ej: Licitación, Ejecución)
CREATE TABLE IF NOT EXISTS def_lifecycle_phase (
    id_phase INTEGER PRIMARY KEY AUTOINCREMENT,
    phase_code TEXT NOT NULL UNIQUE,          
    human_readable_name TEXT NOT NULL,
    ui_order INTEGER DEFAULT 0,            
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);

-- Departamentos / Roles (Ej: RRHH, ADM)
CREATE TABLE IF NOT EXISTS def_company_department (
    id_department INTEGER PRIMARY KEY AUTOINCREMENT,
    department_code TEXT NOT NULL UNIQUE,          
    human_readable_name TEXT NOT NULL,
    ui_order INTEGER DEFAULT 0,            
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME,
    updated_by TEXT,
    deleted_at DATETIME
);

-- Reglas de Seguridad (ADN del PSet) Multi-fase y Multi-departamento
CREATE TABLE IF NOT EXISTS rel_abac_matrix_rules (
    id_rule INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_bridge INTEGER NOT NULL REFERENCES rel_pset_to_entity_bridge(id_bridge) ON DELETE CASCADE,
    fk_phase INTEGER REFERENCES def_lifecycle_phase(id_phase) ON DELETE CASCADE,
    fk_department INTEGER REFERENCES def_company_department(id_department) ON DELETE CASCADE,
    can_read INTEGER DEFAULT 1,
    can_write INTEGER DEFAULT 0,
    can_approve INTEGER DEFAULT 0
);

-- =========================================================================
-- 7. IMPORTACIÓN ASISTIDA / PLANTILLAS DOCUMENTALES (Fase 7 Wizard)
-- =========================================================================

-- Mapeo Dinámico de Plantillas CSV de Importación 
CREATE TABLE IF NOT EXISTS sys_csv_templates (
    id_template INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_l1 INTEGER NOT NULL REFERENCES def_entity_l1_category(id_l1) ON DELETE CASCADE,
    file_path TEXT NOT NULL, 
    template_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 8. ARCHITECTURE 3 / CORE DOMAINS (AI-Native Relational Engine)
-- =========================================================================

-- SYSTEM DICTIONARY (Translator for AI & FrontEnd)
CREATE TABLE IF NOT EXISTS sys_DIC_translationMap (
    id_record TEXT PRIMARY KEY,                 
    elementType TEXT NOT NULL,                  -- 'table', 'column'
    objectNameEn TEXT NOT NULL,                 
    translationEs TEXT NOT NULL,                
    CONSTRAINT unique_translation UNIQUE (elementType, objectNameEn)
);

-- UNIVERSAL AUDIT LOG (Event Sourcing)
CREATE TABLE IF NOT EXISTS sys_AUDIT_log (
    audit_id TEXT PRIMARY KEY,
    instance_id TEXT NOT NULL,         -- Apunta a l4_id o entidad mutada
    user_id TEXT NOT NULL,             -- Quien ejecuto la accion
    action_type TEXT NOT NULL,         -- 'CREATE', 'UPDATE', 'SOFT_DELETE'
    action_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    changes_payload JSON NOT NULL      -- El delta (old, new)
);

-- CORPORATE DOMAIN (EMP)
CREATE TABLE IF NOT EXISTS dat_emp_company (
    emp_id TEXT PRIMARY KEY REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    emp_fiscalCode TEXT UNIQUE NOT NULL,
    emp_fiscalName TEXT UNIQUE NOT NULL,
    emp_fiscalDirection TEXT NOT NULL,
    emp_fiscalCP TEXT NOT NULL,                 
    emp_fiscalLocal TEXT NOT NULL,              
    emp_fiscalProv TEXT NOT NULL,               
    emp_fiscalCountry TEXT NOT NULL,            
    is_Proveedor INTEGER DEFAULT 1,
    is_Subcontratista INTEGER DEFAULT 1,
    is_Contratista INTEGER DEFAULT 1,           
    is_Cliente INTEGER DEFAULT 1,
    CHECK (is_Proveedor = 1 OR is_Subcontratista = 1 OR is_Contratista = 1 OR is_Cliente = 1)
);

-- UTEs Bridge
CREATE TABLE IF NOT EXISTS rel_emp_jointVenture (
    id_rel TEXT PRIMARY KEY,
    jointVenture_emp_id TEXT NOT NULL REFERENCES dat_emp_company(emp_id) ON DELETE CASCADE,
    partner_emp_id TEXT REFERENCES dat_emp_company(emp_id) ON DELETE CASCADE,
    participationShare REAL,
    CONSTRAINT unique_partner_in_ute UNIQUE (jointVenture_emp_id, partner_emp_id)
);

-- BIDDING & TENDERS DOMAIN (LCT & PLK)
CREATE TABLE IF NOT EXISTS dat_lct_tender (
    lct_id TEXT PRIMARY KEY REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    promoter_emp_id TEXT NOT NULL REFERENCES dat_emp_company(emp_id),
    parentTender_lct_id TEXT REFERENCES dat_lct_tender(lct_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dat_plk_bid (
    plk_id TEXT PRIMARY KEY REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    target_lct_id TEXT NOT NULL REFERENCES dat_lct_tender(lct_id) ON DELETE CASCADE,
    bidder_emp_id TEXT REFERENCES dat_emp_company(emp_id),
    plk_status TEXT DEFAULT NULL,               -- Fases: NULL(PRE-ESTUDIO), 'ESTUDIA', 'PRESENTADA', 'AJENA'
    is_plkAwarded INTEGER DEFAULT 0
);

-- LEGAL PRODUCTION DOMAIN (CNT)
CREATE TABLE IF NOT EXISTS dat_cnt_contract (
    cnt_id TEXT PRIMARY KEY REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rel_cnt_awardedPlk (
    cnt_id TEXT NOT NULL REFERENCES dat_cnt_contract(cnt_id) ON DELETE CASCADE,
    awardedPlk_id TEXT NOT NULL REFERENCES dat_plk_bid(plk_id),
    PRIMARY KEY (cnt_id, awardedPlk_id)
);

-- ENGINEERING & FINANCIAL MUTATIONS DOMAIN (PRY)
CREATE TABLE IF NOT EXISTS dat_pry_project (
    pry_id TEXT PRIMARY KEY REFERENCES dat_entity_l4_instance(l4_id) ON DELETE CASCADE,
    originTender_lct_id TEXT NOT NULL REFERENCES dat_lct_tender(lct_id),
    activeContract_cnt_id TEXT REFERENCES dat_cnt_contract(cnt_id),
    semanticVersion_tag TEXT NOT NULL,
    dateVersion TEXT NOT NULL
);
