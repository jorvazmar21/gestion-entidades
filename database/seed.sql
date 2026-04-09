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
(1, 'L1_EMP', 'Empresas y Directorio', 'mod_EMP.svg', 10, 'SEED_SYSTEM'),
(2, 'L1_OBR', 'Centro de Coste (Obra)', 'mod_OBR.svg', 20, 'SEED_SYSTEM'),
(3, 'L1_SED', 'Sede Corporativa', 'mod_SED.svg', 30, 'SEED_SYSTEM'),
(4, 'L1_PRQ', 'Parque de Maquinaria', 'mod_PRQ.svg', 40, 'SEED_SYSTEM'),
(5, 'L1_EVT', 'Evento Transaccional', 'sys_event.svg', 50, 'SEED_SYSTEM'),
(6, 'L1_REC', 'Recurso Físico / Humano', 'sys_resource.svg', 60, 'SEED_SYSTEM');

-- L2: FAMILIES
INSERT OR IGNORE INTO def_entity_l2_family (id_l2, l2_code, fk_l1, human_readable_name, ui_order, created_by) VALUES
-- Empresas (fk_l1 = 1)
(1, 'L2_EMP_UTE', 1, 'Uniones Temporales de Empresas (UTE)', 10, 'SEED_SYSTEM'),
(2, 'L2_EMP_NOUTE', 1, 'Empresas Individuales / Autónomos', 20, 'SEED_SYSTEM'),
-- Obras (fk_l1 = 2)
(3, 'L2_OBR_GEN', 2, 'Obra General', 10, 'SEED_SYSTEM'),
(4, 'L2_OBR_UTE', 2, 'Obra UTE', 20, 'SEED_SYSTEM'),
(5, 'L2_OBR_SOB', 2, 'Subdivisión de Obra (Tramo)', 30, 'SEED_SYSTEM'),
-- Sedes & Parques (fk_l1 = 3, 4)
(6, 'L2_SED_OFI', 3, 'Oficina Central', 10, 'SEED_SYSTEM'),
(7, 'L2_PRQ_ALM', 4, 'Almacén / Instalación Logística', 10, 'SEED_SYSTEM'),
-- Eventos Operativos (fk_l1 = 5)
(8, 'L2_EVT_MANT', 5, 'Mantenimiento (OT / SOT)', 10, 'SEED_SYSTEM'),
(9, 'L2_EVT_PROD', 5, 'Producción (Tarea / Subtarea)', 20, 'SEED_SYSTEM'),
(10, 'L2_EVT_LOGI', 5, 'Logística (Pedido / Albarán)', 30, 'SEED_SYSTEM'),
-- Recursos (fk_l1 = 6)
(11, 'L2_REC_MAQ', 6, 'Máquina Individual', 10, 'SEED_SYSTEM'),
(12, 'L2_REC_MAT', 6, 'Material Fungible', 20, 'SEED_SYSTEM'),
(13, 'L2_REC_HUM', 6, 'Trabajador Humano', 30, 'SEED_SYSTEM');

-- L3: TYPES (The Concrete Molds)
INSERT OR IGNORE INTO def_entity_l3_type (id_l3, l3_code, fk_l2, human_readable_name, ui_order, created_by) VALUES
-- Empresas
(1, 'L3_EMP_UTE_STD', 1, 'Molde UTE Estándar', 10, 'SEED_SYSTEM'),
(2, 'L3_EMP_NOUTE_STD', 2, 'Molde Empresa Individual Estándar', 10, 'SEED_SYSTEM'),
-- Obras
(3, 'L3_OBR_CIVIL', 3, 'Molde Obra Civil Estándar', 10, 'SEED_SYSTEM'),
(4, 'L3_OBR_TRAMO', 5, 'Molde Tramo Lineal', 10, 'SEED_SYSTEM'),
-- Sedes
(5, 'L3_SED_OFI_ADM', 6, 'Molde Oficina Administrativa', 10, 'SEED_SYSTEM'),
-- Eventos Operativos
(6, 'M_OTR', 8, 'Orden de Trabajo (Cabecera)', 10, 'SEED_SYSTEM'),
(7, 'M_SOT', 8, 'Suborden de Trabajo (Línea)', 20, 'SEED_SYSTEM'),
(8, 'M_TAR', 9, 'Tarea de Producción', 10, 'SEED_SYSTEM'),
(9, 'M_PED', 10, 'Pedido de Suministro', 10, 'SEED_SYSTEM'),
(10, 'M_ALB', 10, 'Albarán de Recepción', 20, 'SEED_SYSTEM'),
-- Recursos
(11, 'L3_REC_MAQ_PESADA', 11, 'Máquina Pesada', 10, 'SEED_SYSTEM'),
(12, 'L3_REC_MAQ_LIGERA', 11, 'Máquina Ligera Portátil', 20, 'SEED_SYSTEM');

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
(1, 1, '2', 'L1'), -- L1_OBR
(2, 1, '1', 'L1'), -- L1_EMP
(4, 3, '1', 'L2'), -- L2_EMP_UTE
(5, 4, '2', 'L2'), -- L2_EMP_NOUTE
(6, 5, '1', 'L3'); -- L3_EMP_UTE_STD

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
-- El "PSet 1" en L1_OBR (id_bridge = 1) solo lo edita OFT en Fase Ejecucion (id_phase = 6)
INSERT OR IGNORE INTO rel_abac_matrix_rules (id_rule, fk_bridge, fk_phase, fk_department, can_read, can_write, can_approve) VALUES
(1, 1, 6, 7, 1, 1, 1),
(2, 1, 6, 2, 1, 0, 0);

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
('emp-nortunel', 2, 'EMP-NORTUNEL', 'NORTUNEL S.A.', 'SEED_ARQ3'),
('emp-adif', 2, 'EMP-ADIF', 'ADIF ALTA VELOCIDAD', 'SEED_ARQ3'),
('emp-acciona', 2, 'EMP-ACCIONA', 'ACCIONA CONSTRUCCION', 'SEED_ARQ3');

-- 2. Corazones Físicos (dat_emp_company)
INSERT INTO dat_emp_company (emp_id, emp_fiscalCode, emp_fiscalName, emp_fiscalDirection, emp_fiscalCP, emp_fiscalLocal, emp_fiscalProv, emp_fiscalCountry, is_Proveedor, is_Subcontratista, is_Contratista, is_Cliente) VALUES
('emp-nortunel', 'A01310630', 'NORTUNEL S.A.', 'Pol. Ind. Jundiz', '01015', 'Vitoria-Gasteiz', 'Alava', 'España', 0, 0, 1, 0),
('emp-adif', 'Q2801660H', 'ADIF ALTA VELOCIDAD', 'C/ Sor Angela', '28020', 'Madrid', 'Madrid', 'España', 0, 0, 0, 1),
('emp-acciona', 'A08001851', 'ACCIONA CONSTRUCCION', 'Av. Europa', '28108', 'Alcobendas', 'Madrid', 'España', 0, 0, 1, 0);

-- -------------------------------------------------------------------------
-- B) LICITACIONES Y LOTES (Asumimos fk_l3 genérico = 3 para Obra Civil si no hay Molde LCT)
-- -------------------------------------------------------------------------
INSERT INTO dat_entity_l4_instance (l4_id, fk_l3, unique_human_code, instance_name, created_by) VALUES
('lct-ave-madrid', 3, 'LCT-AVE-001', 'EXP. MARCO: AVE MADRID NORTE', 'SEED_ARQ3'),
('lct-lote-1', 3, 'LCT-AVE-L1', 'LOTE 1: TÚNEL GUADARRAMA', 'SEED_ARQ3');

INSERT INTO dat_lct_tender (lct_id, promoter_emp_id, parentTender_lct_id) VALUES
('lct-ave-madrid', 'emp-adif', NULL),         -- Macro-Expediente
('lct-lote-1', 'emp-adif', 'lct-ave-madrid'); -- Lote 1 colgando del Macro-Expediente

-- -------------------------------------------------------------------------
-- C) PLICAS (Ofertas al Lote 1)
-- -------------------------------------------------------------------------
INSERT INTO dat_entity_l4_instance (l4_id, fk_l3, unique_human_code, instance_name, created_by) VALUES
('plk-estudio-nor', 3, 'PLK-NOR-01', 'OFERTA NORTUNEL LOTE 1 (ESTUDIO)', 'SEED_ARQ3'),
('plk-ajena-acc', 3, 'PLK-ACC-01', 'OFERTA ACCIONA LOTE 1 (AJENA)', 'SEED_ARQ3');

INSERT INTO dat_plk_bid (plk_id, target_lct_id, bidder_emp_id, plk_status, is_plkAwarded) VALUES
('plk-estudio-nor', 'lct-lote-1', 'emp-nortunel', 'ESTUDIA', 0),
('plk-ajena-acc', 'lct-lote-1', 'emp-acciona', 'AJENA', 1); -- Acciona nos gana en el Seed

-- -------------------------------------------------------------------------
-- D) CONTRATOS (CNT) Y PROYECTOS (PRY)
-- -------------------------------------------------------------------------
-- Acciona ganó, así que hay un Contrato de Adjudicación
INSERT INTO dat_entity_l4_instance (l4_id, fk_l3, unique_human_code, instance_name, created_by) VALUES
('cnt-ave-l1', 3, 'CNT-ADIF-25', 'CONTRATO EJECUCIÓN AVE L1', 'SEED_ARQ3'),
('pry-estudio', 3, 'PRY-BASE-01', 'PRY BASE LICITACIÓN LOTE 1', 'SEED_ARQ3');

INSERT INTO dat_cnt_contract (cnt_id) VALUES ('cnt-ave-l1');

-- Enlace del Contrato con la Plica Ganadora
INSERT INTO rel_cnt_awardedPlk (cnt_id, awardedPlk_id) VALUES ('cnt-ave-l1', 'plk-ajena-acc');

-- El proyecto técnico (PRY) del Lote
INSERT INTO dat_pry_project (pry_id, originTender_lct_id, activeContract_cnt_id, semanticVersion_tag, dateVersion) VALUES
('pry-estudio', 'lct-lote-1', NULL, 'PROYECTO_BASE_LICITACION', '2026-03-01T00:00:00Z');

-- =========================================================================
-- 5. REGISTROS DE PLANTILLAS DOCUMENTALES (DATA WIZARD)
-- =========================================================================

-- fk_l1 = 1 (L1_EMP) -> plantilla_empresas.csv
INSERT OR IGNORE INTO sys_csv_templates (id_template, fk_l1, file_path, template_name) VALUES
(1, 1, 'datos_csv/templates/plantilla_empresas.csv', 'Plantilla Oficial de Empresas L-Matrix');
