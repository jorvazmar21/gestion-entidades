-- =========================================================================
-- FRACTAL CORE - AI OPTIMIZED RELATIONAL ONTOLOGY
-- Naming convention explicitly targeted for Large Language Model (LLM) parsing.
-- =========================================================================

-- 0.A THE META-DOCUMENTATION (The AI's native prompt injected into the DB)
-- "Ontology Docs" tells the AI: "Read me first to understand the architectural rules of this universe".
CREATE TABLE IF NOT EXISTS def_ai_system_ontology_docs (
    ai_concept_token TEXT PRIMARY KEY,                 -- High-weight token identifying the architectural pattern.
    semantic_description_for_transformer TEXT,         -- Deep explanation of the ontology abstraction level.
    expected_data_shape_example TEXT,                  -- Exact JSON/string syntax the AI should expect/generate.
    relational_enforcement_rules TEXT,                 -- Hard constraints on Foreign Keys and Topology Graph.
    antigravity_execution_directive TEXT               -- Immutable imperative instructions for the LLM.
);

-- PRE-SEEDED AI INSTRUCTION EXAMPLES (The Prompt Injection):
INSERT OR IGNORE INTO def_ai_system_ontology_docs VALUES
('SYSTEM_BEHAVIOR', 
 'Root architectural templates containing hardcoded UI and business mechanics. Non-mutable by end users.', 
 '{"behavior_id": "B-HIERARCHICAL", "ui_render_level": "L1"}', 
 'Never references physical instances. Referenced strictly by BUSINESS_BLUEPRINTS.', 
 'NEVER GENERATE OR MODIFY THIS ROW UNLESS EXPLICITLY REQUESTED TO REFACTOR CORE APP MECHANICS.'),

('BUSINESS_BLUEPRINT', 
 'The conceptual domain prototype (Ontological "Family"). Defines what a semantic concept like "Company" is.', 
 '{"blueprint_id": "COMP", "human_readable_name": "Empresa"}', 
 'Must map to 1 SYSTEM_BEHAVIOR. Bound to M PROPERTY_SCHEMAS.', 
 'TREAT THIS AS A FACTORY TEMPLATE. IT IS NOT A REAL-WORLD ENTITY.'),

('PHYSICAL_INSTANCE', 
 'The materialized, live record representing an empirical object in the physical world.', 
 '{"instance_id": "INST-559", "unique_human_code": "OBR-ABC", "human_name": "Nortunel S.A."}', 
 'Must strictly belong to 1 BUSINESS_BLUEPRINT via FK. Can appear infinitely in TOPOLOGY_GRAPH.', 
 'WHEN USER ASKS TO "CREATE X", ALWAYS INSERT IN THIS TABLE. IT IS THE ONLY TABLE WHERE LIVE USER DATA EXISTS.');

-- 0.B THE BEHAVIORAL DIRECTIVES (The AI's native behavioral prompt)
-- Explicitly forces Antigravity/Transformer agents to adopt the User's "Golden Rules".
-- The AI must embed these rules into its context window prior to mutating any table.
CREATE TABLE IF NOT EXISTS def_ai_behavioral_directives (
    directive_id TEXT PRIMARY KEY,               -- Identifier for the behavioral rule (e.g. 'RULE_01')
    activation_context TEXT NOT NULL,            -- Describes when this rule triggers
    ai_attention_weight TEXT NOT NULL,           -- 'CRITICAL_OVERRIDE', 'STANDARD_COMPLIANCE'
    imperative_prompt_instruction TEXT NOT NULL  -- The exact prompt logic to force upon the Agent
);

-- PRE-SEEDED AI INSTRUCTION EXAMPLES (User Golden Rules):
INSERT OR IGNORE INTO def_ai_behavioral_directives VALUES
('RULE_01', 'EVERY MESSAGE RECEIVED', 'CRITICAL_OVERRIDE', 'ONLY INFORM AND ADVISE. ACT AS A CONSULTANT. NEVER INITIATE MUTATIONS UNLESS THE USER EXPLICITLY COMMANDS ACTION.'),
('RULE_02', 'ANY AMBIGUOUS INDIRECT INSTRUCTION', 'CRITICAL_OVERRIDE', 'HALT. ASK FOR EXPLICIT PERMISSION. IF THE USER REPLIES "YES", PARSE THE REST OF THE MESSAGE FOR CONTEXT AND THEN ACT.'),
('RULE_03', 'CODE GENERATION', 'STANDARD_COMPLIANCE', 'BEHAVE AS A SENIOR SOFTWARE ARCHITECT. OUTPUT ONLY CLEAN, MODULAR CODE. INCLUDE IN-LINE COMPONENT DOCUMENTATION (PURPOSE, I/O, DEPENDENCIES).'),
('RULE_04', 'USER MAKES A SUBOPTIMAL REQUEST', 'CRITICAL_OVERRIDE', 'BE BLUNT AND SINCERE. PRIORITIZE ARCHITECTURAL INTEGRITY OVER POLITENESS. USE CONSTRUCTIVE CRITICISM. EXPLICITLY STATE "I DO NOT RECOMMEND THIS BECAUSE...".'),
('RULE_05', 'APPLICATION DESIGN', 'STANDARD_COMPLIANCE', 'TREAT THE TARGET SYSTEM AS A MISSION-CRITICAL PRODUCTION ENVIRONMENT. ENSURE ABSOLUTE ROBUSTNESS.'),
('RULE_06', 'BEFORE EXECUTING COMMANDS OR STRUCTURAL MUTATIONS', 'STANDARD_COMPLIANCE', 'EVALUATE CASCADING RISKS AND NOTIFY THE USER OF POTENTIAL DAMAGE FIRST.'),
('RULE_08', 'INTERACTING WITH PROPRIETARY DATA', 'CRITICAL_OVERRIDE', 'NEVER HABDCODE OR INJECT POTENTIALLY DANGEROUS CONTENT (API KEYS, PASSWORDS, PERSONAL DATA). BLOCK THE ACTION, NOTIFY THE USER, AND REQUEST EXPLICIT PERMISSION.'),
('RULE_09', 'ENCOUNTERING PROBLEMS', 'CRITICAL_OVERRIDE', 'REFLECT DEEPLY. NEVER PROPOSE SHORTCUTS OR HACKS ("QUICK FIXES"). ONLY PROPOSE ROBUST, ROOT-CAUSE SOLUTIONS.');

-- 0.C THE BEHAVIORAL BINDING MATRIX (Associative AI Rule Enforcer)
-- Maps the physical SQLite tables to the specific Ethical/Architectural Rules the AI must follow.
CREATE TABLE IF NOT EXISTS rel_ai_table_enforcement_bridge (
    target_table_name TEXT NOT NULL,             -- E.g. 'dat_physical_instances'
    directive_id TEXT NOT NULL REFERENCES def_ai_behavioral_directives(directive_id) ON DELETE CASCADE,
    ai_attention_enforcement_reason TEXT NOT NULL, -- Explicit prompt reasoning teaching the AI why this rule applies to this table.
    PRIMARY KEY (target_table_name, directive_id)
);

-- SEEDING EXACT BEHAVIORAL TRIGGERS AND REASONS
INSERT OR IGNORE INTO rel_ai_table_enforcement_bridge VALUES
('dat_physical_instances', 'RULE_01', 'Live instance manipulation detected. Enter explicit consent mode before executing any CRUD operations.'),
('dat_physical_instances', 'RULE_08', 'Live instance mutation. Ensure absolutely no PII, proprietary secrets, or access tokens are handled or requested.'),
('def_system_behaviors', 'RULE_05', 'Core behavioral logic mutation detected. Enforce mission-critical production robustness. No prototype code allowed.'),
('def_system_behaviors', 'RULE_09', 'Core behavioral architecture mutation. Absolutely no quick fixes or hacks permitted here. Root cause architectural fixes only.'),
('rel_topology_graph', 'RULE_06', 'Graph topology mutation detected. Evaluate cascading orphan risks and notify user before deleting or altering hierarchy.');

-- 1. BASE SYSTEM BEHAVIORS (Technical UI and Structural render rules)
-- AIs instantly recognize "System Behavior" as hardcoded application mechanics.
CREATE TABLE IF NOT EXISTS def_system_behaviors (
    behavior_id TEXT PRIMARY KEY,        -- Example: 'B-HIERARCHICAL-NODE', 'B-FLAT-DOCUMENT'
    ui_render_level TEXT NOT NULL,       -- Example: 'L1', 'L2' (Determines React layout split)
    ai_semantic_description TEXT         -- Context for AIs analyzing this table's purpose.
);

-- 2. BUSINESS BLUEPRINTS (The Template for a concept like "Company" or "Project")
-- "Blueprint" is the strongest Transformer token for "A template to be cloned".
CREATE TABLE IF NOT EXISTS def_business_blueprints (
    blueprint_id TEXT PRIMARY KEY,       -- Example: 'COMPANY', 'CONSTRUCTION_SITE', 'WAREHOUSE'
    behavior_id TEXT NOT NULL REFERENCES def_system_behaviors(behavior_id),
    human_readable_name TEXT NOT NULL,   -- Example: 'Empresa', 'Obra'
    ui_icon_identifier TEXT              -- Explicitly visual data, completely separated from logic.
);

-- 3. THE PROPERTY SCHEMAS (The dictionaries)
-- Former sys_psets_def. "Schema" guarantees the AI knows it's the shape of data, not the data itself.
CREATE TABLE IF NOT EXISTS def_property_schemas (
    schema_id TEXT PRIMARY KEY,          -- Example: 'SCHEMA_FINANCIAL_DATA', 'SCHEMA_GPS_COORDS'
    schema_type TEXT NOT NULL,           -- 'STATIC_1_TO_1', 'DYNAMIC_1_TO_N'
    json_shape_definition JSON NOT NULL  -- The dictionary of attributes (type, editable_flag, default).
);

-- 4. THE GENETIC BINDING (Assigning schemas to blueprints)
-- Pure associative M:N table. "Binding" explicitly tells the AI this is structural composition.
CREATE TABLE IF NOT EXISTS rel_blueprint_x_property_schema (
    schema_id TEXT REFERENCES def_property_schemas(schema_id) ON DELETE CASCADE,
    blueprint_id TEXT REFERENCES def_business_blueprints(blueprint_id) ON DELETE CASCADE,
    PRIMARY KEY (schema_id, blueprint_id)
);

-- 5. THE PHYSICAL INSTANCES (The live records)
-- "Instance" tells the AI: "This is a real-world materialized object storing user data".
CREATE TABLE IF NOT EXISTS dat_physical_instances (
    instance_id TEXT PRIMARY KEY,        -- Example: 'INST-COMP-1044' (Nortunel S.A)
    blueprint_id TEXT NOT NULL REFERENCES def_business_blueprints(blueprint_id) ON DELETE RESTRICT,
    
    unique_human_code TEXT UNIQUE NOT NULL, 
    instance_name TEXT NOT NULL,         
    lifecycle_phase TEXT DEFAULT 'ACTIVE', -- AI reads "lifecycle" and expects status tracking.
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. THE TOPOLOGICAL GRAPH (The operational tree)
-- "Topology Graph" instantly informs the AI that this table governs Parent-Child physics, 
-- entirely decoupled from the semantic Blueprints.
CREATE TABLE IF NOT EXISTS rel_topology_graph (
    link_id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_instance_id TEXT NOT NULL REFERENCES dat_physical_instances(instance_id) ON DELETE CASCADE,
    child_instance_id TEXT NOT NULL REFERENCES dat_physical_instances(instance_id) ON DELETE CASCADE,
    link_context TEXT DEFAULT 'OPERATIONAL_OWNERSHIP', -- Distinguishes different tree dimensions.
    UNIQUE(parent_instance_id, child_instance_id, link_context)
);

-- 7. THE MATERIALIZED VALUES (Where the JSON payload lands)
-- Splitting into Static and Dynamic exactly as discussed.
CREATE TABLE IF NOT EXISTS dat_static_schema_values (
    instance_id TEXT REFERENCES dat_physical_instances(instance_id) ON DELETE CASCADE,
    schema_id TEXT REFERENCES def_property_schemas(schema_id) ON DELETE RESTRICT,
    json_payload JSON NOT NULL,          -- The actual user inputs overriding the Blueprint defaults.
    PRIMARY KEY (instance_id, schema_id)
);

-- =======================================================================================
-- FRACTAL CORE V2.0 - ARCHITECTURE 3 DDL (SQLITE NATIVE)
-- AI-Oriented Relational Schema (Zero-JSON, CamelCase, Explicit Foreign Keys)
-- =======================================================================================

PRAGMA foreign_keys = ON; -- [IA NOTE]: Strict enforcement of relational integrity.

-- ---------------------------------------------------------------------------------------
-- 1. SYSTEM DICTIONARY (Translator for AI & FrontEnd)
-- ---------------------------------------------------------------------------------------
CREATE TABLE sys_DIC_translationMap (
    id_record TEXT PRIMARY KEY,                 
    elementType TEXT NOT NULL,                  -- [IA NOTE]: Expected values: 'table', 'column'
    objectNameEn TEXT NOT NULL,                 -- [IA NOTE]: Physical DB name (e.g. 'dat_lct_tender')
    translationEs TEXT NOT NULL,                -- [IA NOTE]: Frontend/Business label in Spanish
    CONSTRAINT unique_translation UNIQUE (elementType, objectNameEn)
);

-- ---------------------------------------------------------------------------------------
-- 2. CORPORATE DOMAIN (EMP)
-- ---------------------------------------------------------------------------------------
CREATE TABLE dat_emp_company (
    emp_id TEXT PRIMARY KEY,                    -- UUID
    emp_fiscalCode TEXT UNIQUE NOT NULL,        -- [IA NOTE]: El C.I.F. de la empresa. Debe ser unico.
    emp_fiscalName TEXT UNIQUE NOT NULL,        -- [IA NOTE]: Razon social de la empresa. Debe ser unico.
    emp_fiscalDirection TEXT NOT NULL,          -- Domicilio Fiscal
    emp_fiscalCP TEXT NOT NULL,                 
    emp_fiscalLocal TEXT NOT NULL,              
    emp_fiscalProv TEXT NOT NULL,               
    emp_fiscalCountry TEXT NOT NULL,            
    is_Proveedor INTEGER DEFAULT 1,             -- [IA NOTE]: Flag. 1=True, 0=False. Catalogador no excluyente.
    is_Subcontratista INTEGER DEFAULT 1,        -- [IA NOTE]: P.e. La Aplicacion admite catalogar una Empresa de un solo tipo o de varios simultaneamente.
    is_Contratista INTEGER DEFAULT 1,           
    is_Cliente INTEGER DEFAULT 1                
);

-- [IA NOTE]: Posibilita detallar las Empresas socias de un consorcio de empresas (p.ej. una UTE).
CREATE TABLE rel_emp_jointVenture (
    id_rel TEXT PRIMARY KEY,                    -- UUID Interno de la relacion
    jointVenture_emp_id TEXT NOT NULL,          -- [IA NOTE]: Apunta a dat_emp_company. Resuelve la recursividad de UTEs.
    partner_emp_id TEXT,                        -- [IA NOTE]: Puede ser NULL. Significa que la empresa es UTE pero ningun socio se ha registrado aun.
    participationShare REAL,                    -- [IA NOTE]: Ejemplo: 50.00. Si la suma es 100 implica registro completo.
    FOREIGN KEY (jointVenture_emp_id) REFERENCES dat_emp_company(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (partner_emp_id) REFERENCES dat_emp_company(emp_id) ON DELETE CASCADE,
    CONSTRAINT unique_partner_in_ute UNIQUE (jointVenture_emp_id, partner_emp_id)
);

-- ---------------------------------------------------------------------------------------
-- 3. BIDDING & TENDERS DOMAIN (LCT & PLK)
-- ---------------------------------------------------------------------------------------
-- [IA NOTE]: Registro de las Licitaciones que promueve un CLIENTE. Macro-Lotes o Lotes simples.
CREATE TABLE dat_lct_tender (
    lct_id TEXT PRIMARY KEY,                    -- UUID
    promoter_emp_id TEXT NOT NULL,              -- [IA NOTE]: Entidad Promotora. Logicamente, la empresa apuntada asume is_Cliente=1.
    parentTender_lct_id TEXT,                   -- [IA NOTE]: Auto-referenciado. Si es NULL, es Mega-Expediente Marco. Si no, es Lote dependiente.
    FOREIGN KEY (promoter_emp_id) REFERENCES dat_emp_company(emp_id),
    FOREIGN KEY (parentTender_lct_id) REFERENCES dat_lct_tender(lct_id) ON DELETE CASCADE
);

-- [IA NOTE]: Entidad historica de ofertas hacia una determinada Licitacion.
CREATE TABLE dat_plk_bid (
    plk_id TEXT PRIMARY KEY,                    -- UUID
    target_lct_id TEXT NOT NULL,                -- [IA NOTE]: ID de la Licitacion a la que se dirige la oferta.
    bidder_emp_id TEXT,                         -- [IA NOTE]: Si es NULL, no se presento oferta por un competidor conocido. Refiere a empresa unica o UTE.
    plk_status TEXT DEFAULT NULL,               -- [IA NOTE]: Fases: NULL(PRE-ESTUDIO), 'ESTUDIA', 'PRESENTADA', 'AJENA'.
    is_plkAwarded INTEGER DEFAULT 0,            -- [IA NOTE]: Solo una plica resultara adjudicataria de la Licitacion (1=True).
    FOREIGN KEY (target_lct_id) REFERENCES dat_lct_tender(lct_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_emp_id) REFERENCES dat_emp_company(emp_id)
);

-- ---------------------------------------------------------------------------------------
-- 4. LEGAL PRODUCTION DOMAIN (CNT)
-- ---------------------------------------------------------------------------------------
-- [IA NOTE]: Posibilita la creacion de CONTRATOS. Entidad Juridica final; esqueleto para peso tecnico de PRY.
CREATE TABLE dat_cnt_contract (
    cnt_id TEXT PRIMARY KEY                     -- UUID
);

-- [IA NOTE]: Posibilita concretar los Lotes (las plicas ganadoras) que se engloban dentro de un CONTRATO. 
-- El contrato hereda de aqui su "Titular Ofertante". Los contratos podran abarcar un Lote o multiples Lotes.
CREATE TABLE rel_cnt_awardedPlk (
    cnt_id TEXT NOT NULL,                       -- [IA NOTE]: Resuelve la posible asignacion de varios Lotes adjudicados conjuntamente.
    awardedPlk_id TEXT NOT NULL,                -- [IA NOTE]: Apunta a dat_plk_bid. Logicamente debe cumplir is_plkAwarded=True.
    PRIMARY KEY (cnt_id, awardedPlk_id),
    FOREIGN KEY (cnt_id) REFERENCES dat_cnt_contract(cnt_id) ON DELETE CASCADE,
    FOREIGN KEY (awardedPlk_id) REFERENCES dat_plk_bid(plk_id)
);

-- ---------------------------------------------------------------------------------------
-- 5. ENGINEERING & FINANCIAL MUTATIONS DOMAIN (PRY)
-- ---------------------------------------------------------------------------------------
-- [IA NOTE]: Registro evolutivo del Proyecto Constructivo. Define tecnica y economicamente el objeto.
CREATE TABLE dat_pry_project (
    pry_id TEXT PRIMARY KEY,                    -- UUID
    originTender_lct_id TEXT NOT NULL,          -- [IA NOTE]: Todo Proyecto nace mapeado 1:1 a un Lote de Licitacion.
    activeContract_cnt_id TEXT,                 -- [IA NOTE]: Si no existe (NULL), es Proyecto Licitado. Si existe, es evolucion en fase Produccion.
    semanticVersion_tag TEXT NOT NULL,          -- [IA NOTE]: Identificador (p.ej. Licitacion, Adjudicacion, Modificado N1).
    dateVersion TEXT NOT NULL,                  -- [IA NOTE]: ISO8601 Date. Su vigencia dura hasta el dia anterior a la fecha de la siguiente version.
    FOREIGN KEY (originTender_lct_id) REFERENCES dat_lct_tender(lct_id),
    FOREIGN KEY (activeContract_cnt_id) REFERENCES dat_cnt_contract(cnt_id)
);
