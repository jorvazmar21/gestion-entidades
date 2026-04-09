-- =========================================================================
-- FRACTAL CORE V2 - L-MATRIX SEED DATA (DATA SEEDING)
-- =========================================================================
-- DICTATORIAL RULES ENABLED:
-- All entities must follow strict L1 -> L2 -> L3 paths. 
-- No orphaned nodes allowed.
-- =========================================================================

-- =========================================================================
-- 0. META-PROMPTING / AI SYSTEM DIRECTIVES SEEDING
-- =========================================================================
INSERT OR IGNORE INTO sys_ai_ontology_manifest (ai_concept_token, semantic_description_for_transformer, expected_data_shape_example, relational_enforcement_rules, antigravity_execution_directive) VALUES
('L-MATRIX-HIERARCHY', 'Strict 4-tier generic directed tree using integer surrogate keys for DDL stability.', 'id_l1=200 -> id_l2=201 -> id_l3=2001 -> l4_id=uuid()', 'L4 MUST have fk_l3. L3 MUST have fk_l2. L2 MUST have fk_l1. Never rely on l1_code for JOINs.', 'If querying instances, you MUST traverse via fk_lX foreign integer keys, not string codes.'),
('CQRS-PSET-ATTACHMENT', 'Polymorphic JSON Schema attachment system.', '{pset_id: "ID_BASE", target_uuid: "L1_OBR", level: "L1"}', 'A PSet mapped to an L1 category applies to ALL descendant L4 instances.', 'Never mutate schema.sql to add entity columns. Always create a PSet and attach it via rel_pset_to_entity_bridge.'),
('NODEJS-SECURITY-PRUNING', 'REST API response JSON trimming based on UISchema roles.', '{"esUte": {"type": "boolean", "ui:visible_roles": ["ADMIN"]}}', 'Only Node.js executes this. SQLite stores full JSON.', 'Never trust the frontend to hide data. Assume the browser is compromised.'),
('UI-ABSTRACTION-RULE', 'Frontend must merge fragmented data visually resolving def_ui_groups.', 'fk_ui_group: 1', 'Never map SQLite tables 1:1 to React components.', 'Always group Property Sets dynamically using def_ui_groups so the admin sees a monolithic form, hiding the CQRS fragmentation.');

INSERT OR IGNORE INTO sys_ai_behavioral_directives (directive_id, activation_context, ai_attention_weight, imperative_prompt_instruction) VALUES
('DIR_NO_SQL_TRIGGERS', 'When modifying DB schema or adding logic.', 'CRITICAL', 'DO NOT create triggers for math or cascading logic. Defer to Node.js.'),
('DIR_JSON_OPTIMISTIC', 'When updating dat_pset_live_payloads.', 'HIGH', 'Always require __v parameter in payload. Reject if mismatched to prevent lost updates.'),
('DIR_CSV_TRANSACTION_LOCK', 'When uploading or modifying CSV mass loaders.', 'DICTATORIAL', 'NEVER create frontend iteration loops for inserts. Future AIs must hit /api/instances/bulk and rely on SQLite ATOMIC TRANSACTIONS. All or Nothing.');

INSERT OR IGNORE INTO rel_ai_behavior_to_table_bridge (target_table_name, directive_id, ai_attention_enforcement_reason) VALUES
('dat_pset_live_payloads', 'DIR_JSON_OPTIMISTIC', 'Protects against concurrent editing collisions in generic JSON blobs.');

-- =========================================================================
-- 1. L-MATRIX ENTITY HIERARCHY SEEDING
-- =========================================================================

-- L1: CATEGORIES
INSERT OR IGNORE INTO def_entity_l1_category (id_l1, l1_code, human_readable_name, ui_icon_identifier, ui_order, created_by) VALUES
(1, 'L1_EMP', 'Agentes', 'mod_EMP.svg', 10, 'SEED_SYSTEM');

-- L2: FAMILIES
INSERT OR IGNORE INTO def_entity_l2_family (id_l2, l2_code, fk_l1, human_readable_name, ui_order, created_by) VALUES
(1, 'L2_EMP', 1, 'Agentes', 10, 'SEED_SYSTEM');

-- L3: TYPES (The Concrete Molds)
INSERT OR IGNORE INTO def_entity_l3_type (id_l3, l3_code, fk_l2, human_readable_name, ui_order, created_by) VALUES
(1, 'EMP', 1, 'Agentes', 10, 'SEED_SYSTEM');

-- =========================================================================
-- 2. PARAMETRIC PROPERTY SETS (CQRS DICTIONARIES) SEEDING
-- =========================================================================

-- UI GROUPS (The centralized visual containers for React Property Sidebar)
INSERT OR IGNORE INTO def_ui_groups (id_ui_group, ui_group_code, ui_group_name, ui_order, created_by) VALUES
(1, 'G01_GENERAL', 'Datos Generales', 10, 'SEED_SYSTEM'),
(2, 'G02_NATURE', 'Naturaleza de Entidad', 20, 'SEED_SYSTEM'),
(3, 'G03_PHYSICAL', 'Composición Física', 30, 'SEED_SYSTEM');

-- PSet: Datos Generales (Aplica a todo Obras y Empresas)
INSERT OR IGNORE INTO def_pset_template (id_pset, schema_code, schema_alias, fk_ui_group, ui_order, json_shape_definition, created_by) VALUES
(1, 'IDENTITY_BASE', 'Identidad Básica', 1, 10, 
'{"DataSchema": {"cif": {"type": "string"}}, "UISchema": {"cif": {"security:visible_roles": ["CREADOR", "ADMINISTRADOR", "USUARIO"]}}}', 'SEED_SYSTEM');

-- PSet ESTÁTICO DE CREADOR: Soy UTE = TRUE
INSERT OR IGNORE INTO def_pset_template (id_pset, schema_code, schema_alias, fk_ui_group, ui_order, json_shape_definition, created_by) VALUES
(3, 'STATIC_IS_UTE', 'Atributo Ontológico UTE', 2, 20, 
'{"DataSchema": {"soyUte": {"type": "boolean", "default": true}}, "UISchema": {"soyUte": {"ui:readonly": true}}}', 'SEED_SYSTEM');

-- PSet ESTÁTICO DE CREADOR: Soy UTE = FALSE
INSERT OR IGNORE INTO def_pset_template (id_pset, schema_code, schema_alias, fk_ui_group, ui_order, json_shape_definition, created_by) VALUES
(4, 'STATIC_NOT_UTE', 'Atributo Ontológico NO UTE', 2, 20, 
'{"DataSchema": {"soyUte": {"type": "boolean", "default": false}}, "UISchema": {"soyUte": {"ui:readonly": true}}}', 'SEED_SYSTEM');

-- PSet COMPOSICIÓN L3 (Atado solo al Molde L3 de UTEs)
INSERT OR IGNORE INTO def_pset_template (id_pset, schema_code, schema_alias, fk_ui_group, ui_order, json_shape_definition, created_by) VALUES
(5, 'UTE_COMPOSITION', 'Socios de la UTE', 3, 10, 
'{"DataSchema": {"socios": {"type": "array", "items": {"type": "object", "properties": {"fk_empresa": {"type": "string"}, "porcentaje": {"type": "number"}}}}, "avisoUte": {"type": "boolean", "default": true}}, "UISchema": {"avisoUte": {"ui:readonly": true, "security:visible_roles": ["USUARIO", "ADMINISTRADOR"]}}}', 'SEED_SYSTEM');

-- ATAQUES (PUENTES) POLIMÓRFICOS
INSERT OR IGNORE INTO rel_pset_to_entity_bridge (id_bridge, fk_pset, target_uuid, attachment_level_enum) VALUES
(2, 1, '1', 'L1'), -- L1_EMP
(4, 3, '1', 'L2'), -- L2_EMP
(6, 5, '1', 'L3'); -- EMP

-- =========================================================================
-- 3. ABAC MULTIDIMENSIONAL SEEDING
-- =========================================================================

-- Fases de Vida del Usuario (CODIGO y ALIAS)
INSERT OR IGNORE INTO def_lifecycle_phase (id_phase, phase_code, human_readable_name, ui_order, created_by) VALUES
(1, '00', 'NO APLICA', 5, 'SEED_SYSTEM'),
(2, '05', 'PRE-ESTUDIO', 10, 'SEED_SYSTEM'),
(3, '10', 'ESTUDIO', 20, 'SEED_SYSTEM'),
(4, '20', 'LICITACION', 30, 'SEED_SYSTEM'),
(5, '30', 'ADJUDICACION', 40, 'SEED_SYSTEM'),
(6, '40', 'EJECUCION', 50, 'SEED_SYSTEM'),
(7, '80', 'GARANTIA', 60, 'SEED_SYSTEM'),
(8, '90', 'COMPLETADA', 70, 'SEED_SYSTEM'),
(9, '99', 'TODAS', 80, 'SEED_SYSTEM');

-- Departamentos del Usuario (CODIGO y ALIAS)
INSERT OR IGNORE INTO def_company_department (id_department, department_code, human_readable_name, ui_order, created_by) VALUES
(1, 'EST', 'ESTUDIOS', 10, 'SEED_SYSTEM'),
(2, 'ADM', 'ADMINISTRACION', 20, 'SEED_SYSTEM'),
(3, 'RRH', 'RECURSOS HUMANOS', 30, 'SEED_SYSTEM'),
(4, 'PRL', 'PREVENCION R.L.', 40, 'SEED_SYSTEM'),
(5, 'PCC', 'ASEGURAMIENTO DE LA CALIDAD', 50, 'SEED_SYSTEM'),
(6, 'PVA', 'MEDIOAMBIENTE', 60, 'SEED_SYSTEM'),
(7, 'OFT', 'OF. TECNICA', 70, 'SEED_SYSTEM'),
(8, 'DIR', 'DIRECCION', 80, 'SEED_SYSTEM');

-- Asignación Genérica Transaccional de Ejemplo: 
-- El "PSet 1" en L1_EMP (id_bridge = 2) solo lo edita OFT en Fase Ejecucion (id_phase = 6)
INSERT OR IGNORE INTO rel_abac_matrix_rules (id_rule, fk_bridge, fk_phase, fk_department, can_read, can_write, can_approve) VALUES
(1, 2, 6, 7, 1, 1, 1),
(2, 2, 6, 2, 1, 0, 0);

-- =========================================================================
-- 4. POBLADO DE EJEMPLOS PARA ARQUITECTURA 3 (DOBLE INSERT POLIMÓRFICO)
-- =========================================================================

-- PURGA PREVIA DE L4 (Se lleva por delante PSETS y ARQ3 en cascada)
DELETE FROM dat_entity_l4_instance;

-- -------------------------------------------------------------------------
-- A) EMPRESAS (fk_l3 = 1 para UTE, 2 para NO UTE)
-- -------------------------------------------------------------------------
-- 1. Bases L4
INSERT INTO dat_entity_l4_instance (l4_id, fk_l3, unique_human_code, instance_name, created_by) VALUES
('emp-nortunel', 1, 'EMP-NORTUNEL', 'NORTUNEL S.A.', 'SEED_ARQ3'),
('emp-adif', 1, 'EMP-ADIF', 'ADIF ALTA VELOCIDAD', 'SEED_ARQ3'),
('emp-acciona', 1, 'EMP-ACCIONA', 'ACCIONA CONSTRUCCION', 'SEED_ARQ3'),
('emp-ferrovial', 1, 'EMP-FERROVIAL', 'FERROVIAL AGROMAN', 'SEED_ARQ3'),
('emp-sika', 1, 'EMP-SIKA', 'SIKA ESPAÑA S.A.', 'SEED_ARQ3'),
('emp-hilti', 1, 'EMP-HILTI', 'HILTI ESPAÑOLA S.A.', 'SEED_ARQ3'),
('emp-ute-tunel', 1, 'EMP-UTE-TUNEL', 'UTE TUNEL PAJARES', 'SEED_ARQ3'),
('emp-sub-excav', 1, 'EMP-SUB-EXCAV', 'EXCAVACIONES PACO S.L.', 'SEED_ARQ3');

-- 2. Corazones Físicos (dat_emp_company)
INSERT INTO dat_emp_company (emp_id, emp_fiscalCode, emp_fiscalName, emp_fiscalDirection, emp_fiscalCP, emp_fiscalLocal, emp_fiscalProv, emp_fiscalCountry, is_Proveedor, is_Subcontratista, is_Contratista, is_Cliente) VALUES
('emp-nortunel', 'A01310630', 'NORTUNEL S.A.', 'Pol. Ind. Jundiz', '01015', 'Vitoria-Gasteiz', 'Alava', 'España', 0, 0, 1, 0),
('emp-adif', 'Q2801660H', 'ADIF ALTA VELOCIDAD', 'C/ Sor Angela', '28020', 'Madrid', 'Madrid', 'España', 0, 0, 0, 1),
('emp-acciona', 'A08001851', 'ACCIONA CONSTRUCCION', 'Av. Europa', '28108', 'Alcobendas', 'Madrid', 'España', 0, 0, 1, 0),
('emp-ferrovial', 'A81307653', 'FERROVIAL AGROMAN', 'C/ Ribera del Loira', '28042', 'Madrid', 'Madrid', 'España', 0, 0, 1, 1),
('emp-sika', 'A28078236', 'SIKA ESPAÑA S.A.', 'Carretera de Fuencarral', '28108', 'Alcobendas', 'Madrid', 'España', 1, 0, 0, 0),
('emp-hilti', 'A28236248', 'HILTI ESPAÑOLA S.A.', 'C/ Fuente de la Mora', '28050', 'Madrid', 'Madrid', 'España', 1, 0, 0, 0),
('emp-ute-tunel', 'U12345678', 'UTE TUNEL PAJARES', 'Av. de Guipuzcoa', '33001', 'Oviedo', 'Asturias', 'España', 0, 0, 1, 0),
('emp-sub-excav', 'B98765432', 'EXCAVACIONES PACO S.L.', 'Pol. Ind. Los Arcos', '46014', 'Valencia', 'Valencia', 'España', 0, 1, 0, 0);


-- =========================================================================
-- 5. REGISTROS DE PLANTILLAS DOCUMENTALES (DATA WIZARD)
-- =========================================================================

-- fk_l1 = 1 (L1_EMP) -> plantilla_empresas.csv
INSERT OR IGNORE INTO sys_csv_templates (id_template, fk_l1, file_path, template_name) VALUES
(1, 1, 'datos_csv/templates/plantilla_empresas.csv', 'Plantilla Oficial de Empresas L-Matrix');
