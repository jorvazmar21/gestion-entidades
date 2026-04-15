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
('UI-ABSTRACTION-RULE', 'Frontend must merge fragmented data visually resolving def_pset_groups.', 'fk_pset_group: 1', 'Never map SQLite tables 1:1 to React components.', 'Always group Property Sets dynamically using def_pset_groups so the admin sees a monolithic form, hiding the CQRS fragmentation.');

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
(1, 'L1_EMP', 'Agentes', 'mod_EMP.svg', 10, 'SEED_SYSTEM'),
(2, 'L1_LCT', 'Licitaciones', 'mod_LCT.svg', 20, 'SEED_SYSTEM'),
(3, 'L1_PLK', 'Plicas', 'mod_PLK.svg', 30, 'SEED_SYSTEM'),
(4, 'L1_PRY', 'Proyectos', 'mod_PRY.svg', 40, 'SEED_SYSTEM'),
(5, 'L1_CNT', 'Contratos', 'mod_CNT.svg', 50, 'SEED_SYSTEM'),
(6, 'CDC', 'Centro de Coste', 'mod_CDC.svg', 60, 'SEED_SYSTEM'),
(7, 'L1_OBR', 'Obras', 'mod_OBR.svg', 70, 'SEED_SYSTEM');

-- L2: FAMILIES
INSERT OR IGNORE INTO def_entity_l2_family (id_l2, l2_code, fk_l1, human_readable_name, ui_order, created_by) VALUES
(1, 'L2_EMP', 1, 'Agentes', 10, 'SEED_SYSTEM'),
(2, 'L2_LCT', 2, 'Licitaciones', 20, 'SEED_SYSTEM'),
(3, 'L2_PLK', 3, 'Plicas', 30, 'SEED_SYSTEM'),
(4, 'L2_PRY', 4, 'Proyectos', 40, 'SEED_SYSTEM'),
(5, 'L2_CNT', 5, 'Contratos', 50, 'SEED_SYSTEM'),
(6, 'ALM', 6, 'Almacén', 60, 'SEED_SYSTEM'),
(7, 'MQP', 6, 'Maq. Propia', 70, 'SEED_SYSTEM'),
(8, 'L2_OBR', 7, 'Obras', 80, 'SEED_SYSTEM');

-- L3: TYPES (The Concrete Molds)
INSERT OR IGNORE INTO def_entity_l3_type (id_l3, l3_code, fk_l2, human_readable_name, ui_order, created_by) VALUES
(1, 'EMP', 1, 'Agentes', 10, 'SEED_SYSTEM'),
(2, 'LCT', 2, 'Licitaciones', 20, 'SEED_SYSTEM'),
(3, 'PLK', 3, 'Plicas', 30, 'SEED_SYSTEM'),
(4, 'PRY', 4, 'Proyectos', 40, 'SEED_SYSTEM'),
(5, 'CNT', 5, 'Contratos', 50, 'SEED_SYSTEM'),
(6, 'CTR', 6, 'Almacén Central', 60, 'SEED_SYSTEM'),
(7, 'OTR', 6, 'Almacén Adicional', 70, 'SEED_SYSTEM'),
(8, 'BHO', 7, 'Bomba de Hormigón', 80, 'SEED_SYSTEM'),
(9, 'BIN', 7, 'Bomba Inyectadora', 90, 'SEED_SYSTEM'),
(10, 'BPM', 7, 'Bomba Proy. Membr.', 100, 'SEED_SYSTEM'),
(11, 'CRZ', 7, 'Cabeza Rozadora', 110, 'SEED_SYSTEM'),
(12, 'CEL', 7, 'Carretilla Elevadora', 120, 'SEED_SYSTEM'),
(13, 'CPH', 7, 'Carro Perf. Hidráulico', 130, 'SEED_SYSTEM'),
(14, 'CPN', 7, 'Carro Perf. Neumático', 140, 'SEED_SYSTEM'),
(15, 'CDI', 7, 'Compresor Diesel', 150, 'SEED_SYSTEM'),
(16, 'DAR', 7, 'Dúmper Articulado', 160, 'SEED_SYSTEM'),
(17, 'RET', 7, 'Retroexcavadora', 170, 'SEED_SYSTEM'),
(18, 'GDI', 7, 'Generador Diesel', 180, 'SEED_SYSTEM'),
(19, 'J2B', 7, 'Jumbo (2 brazos)', 190, 'SEED_SYSTEM'),
(20, 'J3B', 7, 'Jumbo (3 brazos)', 200, 'SEED_SYSTEM'),
(21, 'MTE', 7, 'Manip. Telescópica', 210, 'SEED_SYSTEM'),
(22, 'MPI', 7, 'Máquina de Pintar', 220, 'SEED_SYSTEM'),
(23, 'MHI', 7, 'Martillo Hidráulico', 230, 'SEED_SYSTEM'),
(24, 'NAG', 7, 'Nagolifera', 240, 'SEED_SYSTEM'),
(25, 'CCO', 7, 'Carg. Convencional', 250, 'SEED_SYSTEM'),
(26, 'CPB', 7, 'Carg. de Perfil Bajo', 260, 'SEED_SYSTEM'),
(27, 'PIL', 7, 'Planta Inyec. Lechada', 270, 'SEED_SYSTEM'),
(28, 'PEL', 7, 'Plataforma Elevadora', 280, 'SEED_SYSTEM'),
(29, 'RGU', 7, 'Robot de Gunitado', 290, 'SEED_SYSTEM'),
(30, 'TIL', 7, 'Torre de Iluminación', 300, 'SEED_SYSTEM'),
(31, 'VEN', 7, 'Ventilador', 310, 'SEED_SYSTEM'),
(32, 'OBR', 8, 'Obras', 320, 'SEED_SYSTEM');

-- =========================================================================
-- 2. PARAMETRIC PROPERTY SETS (CQRS DICTIONARIES) SEEDING
-- =========================================================================

-- UI GROUPS (The centralized visual containers for React-- Grupos de PSet (Semillas)
INSERT OR IGNORE INTO def_pset_groups (id_pset_group, pset_group_code, pset_group_name, ui_order, created_by) VALUES
(1, 'G01_GENERAL', 'Datos Generales', 10, 'SEED_SYSTEM'),
(2, 'G02_NATURE', 'Naturaleza de Entidad', 20, 'SEED_SYSTEM'),
(3, 'G03_PHYSICAL', 'Composición Física', 30, 'SEED_SYSTEM');

-- PSets Definición
INSERT OR IGNORE INTO def_pset_template (id_pset, schema_code, schema_alias, fk_pset_group, pset_behavior_type, ui_order, json_shape_definition, created_by) VALUES
(1, 'EMP_001', 'Datos Fiscales', 1, 'STATIC', 10, '{"DataSchema": {"EMP_FISCALNAME": {"type": "string"}, "EMP_FISCALCODE": {"type": "string"}, "EMP_FISCALDIRECTION": {"type": "string"}, "EMP_FISCALCP": {"type": "string"}, "EMP_FISCALLOCAL": {"type": "string"}, "EMP_FISCALPROV": {"type": "string"}, "EMP_FISCALCOUNTRY": {"type": "string"}}, "UISchema": {"EMP_FISCALNAME": {}, "EMP_FISCALCODE": {}, "EMP_FISCALDIRECTION": {}, "EMP_FISCALCP": {}, "EMP_FISCALLOCAL": {}, "EMP_FISCALPROV": {}, "EMP_FISCALCOUNTRY": {}}}', 'SEED_SYSTEM'),
(2, 'EMP_002', 'Enlace SAGE', 1, 'STATIC', 20, '{"DataSchema": {"SAGE_ID": {"type": "string"}}, "UISchema": {"SAGE_ID": {}}}', 'SEED_SYSTEM');

-- ATAQUES (PUENTES) POLIMÓRFICOS
INSERT OR IGNORE INTO rel_pset_to_entity_bridge (id_bridge, fk_pset, target_definition_uuid, definition_level_enum) VALUES
(1, 1, '1', 'L3'), -- EMP -> EMP_001 Datos Fiscales
(2, 2, '1', 'L3'); -- EMP -> EMP_002 Enlace SAGE

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
DELETE FROM dat_emp_company;
DELETE FROM rel_emp_jointventure;

-- -------------------------------------------------------------------------
-- A) EMPRESAS (L4, FISCAL, JOINT_VENTURE)
-- -------------------------------------------------------------------------
-- 1. Bases L4
INSERT INTO dat_entity_l4_instance (l4_id, fk_l3, unique_human_code, instance_name, fk_phase, is_active, created_at, created_by, deleted_at, deleted_by) VALUES
('1', 1, 'EMP-0001', 'AURTENETXEA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('2', 1, 'EMP-0002', 'VERKOL', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('3', 1, 'EMP-0003', 'BASF', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('4', 1, 'EMP-0004', 'MAXMEN', NULL, 0, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('5', 1, 'EMP-0005', 'ARBERE', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('6', 1, 'EMP-0006', 'MIRAMAR', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('7', 1, 'EMP-0007', 'SAIGO', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('8', 1, 'EMP-0008', 'TRAT. DEL PIRINEO', NULL, 0, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('9', 1, 'EMP-0009', 'OLARRA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('10', 1, 'EMP-0010', 'COBRA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('11', 1, 'EMP-0011', 'M.ELECT. SAN IGNACIO', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('12', 1, 'EMP-0012', 'LA MOLINA', NULL, 0, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('13', 1, 'EMP-0013', 'VIVANCO HERNANDEZ, S.A.', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('14', 1, 'EMP-0014', 'COBILAN, S.C.', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('15', 1, 'EMP-0015', 'HERCAL', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('16', 1, 'EMP-0016', 'COMSA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('17', 1, 'EMP-0017', 'COMSA INSTALACIONES', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('18', 1, 'EMP-0018', 'NORTUNEL', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('19', 1, 'EMP-0019', 'SANDO', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('20', 1, 'EMP-0020', 'ROVER', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('21', 1, 'EMP-0021', 'CYCASA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('22', 1, 'EMP-0022', 'CAMPEZO', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('23', 1, 'EMP-0023', 'GEOTUNEL', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('24', 1, 'EMP-0024', 'IZA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('25', 1, 'EMP-0025', 'ZUBIEDER', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('26', 1, 'EMP-0026', 'MARIEZCURRENA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('27', 1, 'EMP-0027', 'FERROVIAL', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('28', 1, 'EMP-0028', 'MINA DE SANTA MARTA', NULL, 0, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('29', 1, 'ADM-0001', 'GOBIERNO DE NAVARRA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('30', 1, 'ADM-0002', 'ETS', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('31', 1, 'ADM-0003', 'D.F.G.', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('32', 1, 'ADM-0004', 'CONSELL DE MALLORCA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('33', 1, 'ADM-0005', 'AYTO. CASTRILLON', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('34', 1, 'ADM-0006', 'ADIF', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('35', 1, 'UTE-0001', 'PEGUERA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('36', 1, 'UTE-0002', 'RANTE', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('37', 1, 'UTE-0003', 'MARKIJANA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('38', 1, 'UTE-0004', 'SECTOR 3', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('39', 1, 'UTE-0005', 'GALERIAS', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('40', 1, 'UTE-0006', 'LINEA 5', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('41', 1, 'UTE-0007', 'UTE IRAETA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('42', 1, 'UTE-0008', 'UTE GOROSMENDI', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('43', 1, 'UTE-0009', 'ALTZA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('44', 1, 'UTE-0010', 'UTE ADIANTE', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL),
('45', 1, 'EMP-0029', 'BALZOLA', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', '30/06/2020 0:00', 'SEED_SYSTEM'),
('46', 1, 'EMP-0030', 'AZVI', NULL, 1, '02/04/1975 0:00', 'SEED_SYSTEM', NULL, NULL);

-- 2. Corazones Físicos (dat_emp_company)
INSERT INTO dat_emp_company (emp_id, emp_fiscalName, emp_fiscalCode, emp_fiscalDirection, emp_fiscalCP, emp_fiscalLocal, emp_fiscalProv, emp_fiscalCountry, is_Proveedor, is_Subcontratista, is_Contratista, is_Cliente) VALUES
('1', 'AURTENETXEA, S.A.', 'A48245849', 'Avenida de la Constitucion, 46, Bajo B', '48115', 'SONDIKA', 'BIZKAIA', 'ESPAÑA', 1, 0, 0, 0),
('2', 'VERKOL, S.A.', 'A20020510', 'Avenida de los Chopos, 103, Esc. B, 5º1º', '31700', 'VERA DE BIDASOA', 'NAVARRA', 'ESPAÑA', 1, 0, 0, 0),
('3', 'MASTER BUILDERS SOLUTIONS ESPAÑA, S.L.U.', 'B31721541', 'Avenida Diagonal, 480, 2º2º', '08940', 'CORNELLA DE LLOBREGAT', 'BARCELONA', 'ESPAÑA', 1, 0, 0, 0),
('4', 'MAXMEN, S.L.', 'B33762311', 'Calle Corazon de Maria, 22, 4ºD', '33510', 'SIERO', 'ASTURIAS', 'ESPAÑA', 1, 0, 0, 0),
('5', 'COMERCIAL ARBERE, S.L.', 'B48597139', 'Calle de la Esperanza, 9, Bajo Izquierda', '48213', 'IZURZA', 'BIZKAIA', 'ESPAÑA', 1, 0, 0, 0),
('6', 'MIRAMAR GUNITADOS, S.A.', 'A48126458', 'Calle de la Luna, 7, 3ºB', '48510', 'SAN SALVADOR DEL VALLE', 'BIZKAIA', 'ESPAÑA', 0, 1, 0, 0),
('7', 'SAIGO S.L.', 'B48149535', 'Calle de los Herreros, 4, 3ºC', '48001', 'BILBAO', 'VIZCAYA', 'ESPAÑA', 0, 1, 0, 0),
('8', 'TRACTAMENTS AMBIENTALS DELS PIRINEUS SLU', 'B17423971', 'Calle del Pez, 12, 2ºA', '17520', 'PUIGCERDA', 'GIRONA', 'ESPAÑA', 0, 1, 0, 0),
('9', 'ASFALTADOS OLARRA, S.A.', 'A48020455', 'Calle Jorge Juan, 55, 1º Exterior', '48001', 'BILBAO', 'VIZCAYA', 'ESPAÑA', 0, 1, 0, 0),
('10', 'COBRA INSTALACIONES Y SERVICIOS, S.A.', 'A46146387', 'Calle Mayor, 3, 1º Izquierda', '28001', 'MADRID', 'MADRID', 'ESPAÑA', 0, 1, 0, 0),
('11', 'MONTAJES ELECTRICOS SAN IGNACIO, S.L.', 'B48162663', 'Paseo de la Castellana, 120, 7ºC', '48215', 'IURRETA', 'VIZCAYA', 'ESPAÑA', 0, 1, 0, 0),
('12', 'MANTENIMIENTO E INSTALACIONES LA MOLINA, S.L.', 'B17788078', 'Paseo del Prado, 26, 5º', '17537', 'LA MOLINA', 'GIRONA', 'ESPAÑA', 0, 1, 0, 0),
('13', 'VIVANCO HERNANDEZ, S.A.', 'A43123819', 'Plaza de España, 15, Ático', '43201', 'REUS', 'TARRAGONA', 'ESPAÑA', 0, 1, 0, 0),
('14', 'COBILAN, S.C.', 'J01304943', 'Ronda de Valencia, 14, 6º Derecha', '1001', 'VITORIA-GASTEIZ', 'ALAVA', 'ESPAÑA', 0, 1, 0, 0),
('15', 'HERCAL DIGGERS, S.L.', 'B64143639', 'Travesia del Sol, 8, Duplex 4', '0221', 'TERRASSA', 'BARCELONA', 'ESPAÑA', 0, 1, 0, 0),
('16', 'COMSA, S.A.', 'A08002071', 'Calle Viriato, 47', '08014', 'Barcelona', 'Barcelona', 'ESPAÑA', 0, 1, 1, 1),
('17', 'COMSA INSTALACIONES Y SISTEMAS, S.A.U.', 'A08304956', 'Calle Julian Camarillo, 6', '28037', 'Madrid', 'Madrid', 'ESPAÑA', 0, 1, 1, 1),
('18', 'NORTUNEL, S.A.', 'A48425217', 'Poligono Ind. Sangroniz, Calle Ibaibarte, 19', '48150', 'Sondika', 'Bizkaia', 'ESPAÑA', 0, 1, 1, 0),
('19', 'CONSTRUCCIONES SANCHEZ DOMINGUEZ-SANDO, S.A.', 'A29011788', 'Avenida de Manoteras, 46', '28050', 'Madrid', 'Madrid', 'ESPAÑA', 0, 1, 1, 0),
('20', 'ROVER INFRAESTRUCTURAS, S.A.', 'A46141360', 'Calle de Jose Abascal, 45', '28003', 'Madrid', 'Madrid', 'ESPAÑA', 0, 1, 1, 0),
('21', 'CYCASA CANTERAS Y CONSTRUCCIONES, S.A.', 'A48020771', 'Calle Maximo Aguirre, 18', '48011', 'Bilbao', 'Bizkaia', 'ESPAÑA', 1, 1, 1, 1),
('22', 'CAMPEZO OBRAS Y SERVICIOS, S.A.', 'A20014294', 'Lugar Barrio de Añorga, s/n', '20010', 'San Sebastian', 'Gipuzkoa', 'ESPAÑA', 0, 1, 1, 0),
('23', 'GEOTUNEL, S.L.', 'B81260174', 'Calle de los Manzanares, 1', '28005', 'Madrid', 'Madrid', 'ESPAÑA', 0, 1, 1, 0),
('24', 'CONSTRUCCIONES IZA, S.A.', 'A48143281', 'Barrio de Iurreta, s/n', '48215', 'Iurreta', 'Bizkaia', 'ESPAÑA', 0, 1, 1, 0),
('25', 'ZUBIEDER, S.A.', 'A48135899', 'Calle del Horno, 14', '48008', 'Bilbao', 'Bizkaia', 'ESPAÑA', 0, 1, 1, 0),
('26', 'CONSTRUCCIONES MARIEZCURRENA, S.L.', 'B31034448', 'Carretera de Irurita, s/n', '31740', 'Santesteban', 'Navarra', 'ESPAÑA', 0, 1, 1, 1),
('27', 'FERROVIAL CONSTRUCCION, S.A.', 'A81250506', 'Calle de la Ribera del Loira, 42', '28042', 'Madrid', 'Madrid', 'ESPAÑA', 0, 1, 1, 1),
('28', 'MINERA SANTA MARTA, S.A.', 'A20014066', 'Calle de Serrano, 45', '28001', 'Madrid', 'Madrid', 'ESPAÑA', 0, 0, 0, 1),
('29', 'COMUNIDAD FORAL DE NAVARRA', 'S3100001I', 'Avenida de Carlos III el Noble, 2', '31002', 'Pamplona', 'Navarra', 'ESPAÑA', 0, 0, 0, 1),
('30', 'EUSKAL TRENBIDE SAREA', 'Q4800643J', 'Calle de San Vicente, 8', '48001', 'Bilbao', 'Bizkaia', 'ESPAÑA', 0, 0, 0, 1),
('31', 'DIPUTACION FORAL DE GIPUZKOA', 'P2000000F', 'Plaza de Gipuzkoa, s/n', '20004', 'San Sebastian', 'Gipuzkoa', 'ESPAÑA', 0, 0, 0, 1),
('32', 'CONSELL INSULAR DE MALLORCA', 'P0700002J', 'Calle del Palau Reial, 1', '07001', 'Palma', 'Illes Balears', 'ESPAÑA', 0, 0, 0, 1),
('33', 'AYUNTAMIENTO DE CASTRILLON', 'P3301600G', 'Plaza de la Constitucion, 1', '33450', 'Piedras Blancas', 'Asturias', 'ESPAÑA', 0, 0, 0, 1),
('34', 'ADMINISTRADOR DE INFRAESTRUCTURAS FERROVIARIAS', 'Q2801660H', 'Calle de la Sor Angela de la Cruz, 3', '28020', 'Madrid', 'Madrid', 'ESPAÑA', 0, 0, 0, 1),
('35', 'UTE TUNEL PEGUERA', 'U57210677', 'Calle de la Sor Angela de la Cruz, 3', '28020', 'Madrid', 'Madrid', 'ESPAÑA', 0, 0, 1, 1),
('36', 'UTE TUNEL DE RANTE', 'U88220023', 'Calle de la Ribera del Loira, 42', '28042', 'Madrid', 'Madrid', 'ESPAÑA', 0, 0, 1, 1),
('37', 'UTE SISTEMA MARKIJANA', 'U01509650', 'Poligono Ind. Sangroniz, Calle Ibaibarte, 19', '48150', 'Sondika', 'Bizkaia', 'ESPAÑA', 0, 0, 1, 1),
('38', 'UTE SECTOR 3', 'U87613583', 'Calle Julian Camarillo, 6', '28037', 'Madrid', 'Madrid', 'ESPAÑA', 0, 0, 1, 1),
('39', 'UTE SALIDAS DE EMERGENCIA', 'U48464323', 'Calle Maximo Aguirre, 18', '48011', 'Bilbao', 'Bizkaia', 'ESPAÑA', 0, 0, 1, 1),
('40', 'UTE L5 GALDAKAO HOSPITAL', 'U95914659', 'Calle San Vicente, 8, Planta 13', '48001', 'Bilbao', 'Bizkaia', 'ESPAÑA', 0, 0, 1, 1),
('41', 'UTE IRAETA', 'U20036522', 'Barrio de Añorga, s/n', '20010', 'San Sebastian', 'Gipuzkoa', 'ESPAÑA', 0, 0, 1, 1),
('42', 'UTE GOROSMENDI BI', 'U95655435', 'Calle Gran Via, 17', '48001', 'Bilbao', 'Bizkaia', 'ESPAÑA', 0, 0, 1, 1),
('43', 'UTE ALTZA GALTZARABORDA', 'U48123456', 'Paseo de la Castellana, 120', '28046', 'Madrid', 'Madrid', 'ESPAÑA', 0, 0, 1, 1),
('44', 'UTE ADIANTE', 'U15982125', 'Calle Marie Curie, 7', '15008', 'A Coruña', 'A Coruña', 'ESPAÑA', 0, 0, 1, 1),
('45', 'Construcciones y Promociones Balzola, S.A.', 'A48763148', 'Sabino Arana Etorbidea, 20', '48013', 'BILBAO', 'BIZKAIA', 'ESPAÑA', 0, 0, 1, 0),
('46', 'AZVI, S.A.U.', 'A41017088', 'Calle Almendralejo, 5', '41019', 'Sevilla', 'Sevilla', 'ESPAÑA', 0, 0, 1, 0);

-- 3. Composicion de UTEs (rel_emp_jointventure)
INSERT INTO rel_emp_jointventure (jointVenture_emp_id, partner_emp_id, participationShare) VALUES
('35', '16', 33.34),
('35', '17', 33.33),
('35', '18', 33.33),
('36', '19', 50.0),
('36', '20', 50.0),
('37', '16', 70.0),
('37', '18', 30.0),
('38', '16', 40.0),
('38', '21', 20.0),
('38', '22', 20.0),
('38', '18', 20.0),
('39', '18', 50.0),
('39', '23', 50.0),
('40', '18', 30.0),
('40', '16', 35.0),
('40', '24', 35.0),
('41', '16', 70.0),
('41', '25', 30.0),
('42', '16', 50.0),
('42', '25', 25.0),
('42', '26', 25.0),
('43', '16', 30.0),
('43', '46', 30.0),
('43', '22', 30.0),
('43', '18', 10.0),
('44', '18', 50.0),
('44', '26', 50.0);


-- =========================================================================
-- 5. REGISTROS DE PLANTILLAS DOCUMENTALES (DATA WIZARD)
-- =========================================================================

-- fk_l1 = 1 (L1_EMP) -> plantilla_empresas.csv
INSERT OR IGNORE INTO sys_csv_templates (id_template, fk_l1, file_path, template_name) VALUES
(1, 1, 'datos_csv/templates/plantilla_empresas.csv', 'Plantilla Oficial de Empresas L-Matrix');


-- =========================================================================
-- PAYLOADS GENERADOS AUTOMÁTICAMENTE DESDE TABLAS
-- =========================================================================

INSERT OR IGNORE INTO dat_pset_live_payloads (id_payload_record, target_value_uuid, value_level_enum, fk_pset, json_payload, created_by) VALUES
('PAY-FISC-0001', '1', 'L4', 1, '{"EMP_FISCALNAME":"AURTENETXEA, S.A.","EMP_FISCALCODE":"A48245849","EMP_FISCALDIRECTION":"Avenida de la Constitución, 45, Bajo B","EMP_FISCALCP":"48115","EMP_FISCALLOCAL":"SONDIKA","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0001', '1', 'L4', 2, '{"SAGE_ID":"4000001"}', 'SEED_SYSTEM'),
('PAY-FISC-0002', '2', 'L4', 1, '{"EMP_FISCALNAME":"VERKOL S.A.","EMP_FISCALCODE":"A20028510","EMP_FISCALDIRECTION":"Avenida de los Chopos, 103, Esc. B, 5º1ª","EMP_FISCALCP":"31780","EMP_FISCALLOCAL":"VERA DE BIDASOA","EMP_FISCALPROV":"NAVARRA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0002', '2', 'L4', 2, '{"SAGE_ID":"4000002"}', 'SEED_SYSTEM'),
('PAY-FISC-0003', '3', 'L4', 1, '{"EMP_FISCALNAME":"MASTER BUILDERS SOLUTIONS ESPAÑA, S.L.U.","EMP_FISCALCODE":"B31721541","EMP_FISCALDIRECTION":"Avenida Diagonal, 450, 2º2ª","EMP_FISCALCP":"8940","EMP_FISCALLOCAL":"CORNELLA DE LLOBREGAT","EMP_FISCALPROV":"BARCELONA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0003', '3', 'L4', 2, '{"SAGE_ID":"4000003"}', 'SEED_SYSTEM'),
('PAY-FISC-0004', '4', 'L4', 1, '{"EMP_FISCALNAME":"MAXMEN, S.L.","EMP_FISCALCODE":"B33762311","EMP_FISCALDIRECTION":"Calle Corazón de María, 22, 4ºD","EMP_FISCALCP":"33510","EMP_FISCALLOCAL":"SIERO","EMP_FISCALPROV":"ASTURIAS","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0004', '4', 'L4', 2, '{"SAGE_ID":"4000004"}', 'SEED_SYSTEM'),
('PAY-FISC-0005', '5', 'L4', 1, '{"EMP_FISCALNAME":"COMERCIAL ARBERE, S.L.","EMP_FISCALCODE":"B48527139","EMP_FISCALDIRECTION":"Calle de la Esperanza, 9, Bajo Izquierda","EMP_FISCALCP":"48213","EMP_FISCALLOCAL":"IZURZA","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0005', '5', 'L4', 2, '{"SAGE_ID":"4000005"}', 'SEED_SYSTEM'),
('PAY-FISC-0006', '6', 'L4', 1, '{"EMP_FISCALNAME":"MIRAMAR GUNITADOS, S.A.","EMP_FISCALCODE":"A48125488","EMP_FISCALDIRECTION":"Calle de la Luna, 7, 3ºB","EMP_FISCALCP":"48510","EMP_FISCALLOCAL":"SAN SALVADOR DEL VALLE","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0006', '6', 'L4', 2, '{"SAGE_ID":"4110031"}', 'SEED_SYSTEM'),
('PAY-FISC-0007', '7', 'L4', 1, '{"EMP_FISCALNAME":"SAIGO S.L.","EMP_FISCALCODE":"B48149538","EMP_FISCALDIRECTION":"Calle de los Herreros, 4, 3ºC","EMP_FISCALCP":"48001","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"VIZCAYA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0007', '7', 'L4', 2, '{"SAGE_ID":"4110032"}', 'SEED_SYSTEM'),
('PAY-FISC-0008', '8', 'L4', 1, '{"EMP_FISCALNAME":"TRACTAMENTS AMBIENTALS DELS PIRINEUS SLU","EMP_FISCALCODE":"B17423971","EMP_FISCALDIRECTION":"Calle del Pez, 12, 2ºA","EMP_FISCALCP":"17520","EMP_FISCALLOCAL":"PUIGCERDA","EMP_FISCALPROV":"GIRONA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0008', '8', 'L4', 2, '{"SAGE_ID":"4110033"}', 'SEED_SYSTEM'),
('PAY-FISC-0009', '9', 'L4', 1, '{"EMP_FISCALNAME":"ASFALTADOS OLARRA, S.A.","EMP_FISCALCODE":"A48028435","EMP_FISCALDIRECTION":"Calle Jorge Juan, 55, 1º Exterior","EMP_FISCALCP":"48001","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"VIZCAYA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0009', '9', 'L4', 2, '{"SAGE_ID":"4110034"}', 'SEED_SYSTEM'),
('PAY-FISC-0010', '10', 'L4', 1, '{"EMP_FISCALNAME":"COBRA INSTALACIONES Y SERVICIOS, S.A.","EMP_FISCALCODE":"A46146387","EMP_FISCALDIRECTION":"Calle Mayor, 3, 1º Izquierda","EMP_FISCALCP":"28001","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0010', '10', 'L4', 2, '{"SAGE_ID":"4110035"}', 'SEED_SYSTEM'),
('PAY-FISC-0011', '11', 'L4', 1, '{"EMP_FISCALNAME":"MONTAJES ELECTRICOS SAN IGNACIO, S.L.","EMP_FISCALCODE":"B48162663","EMP_FISCALDIRECTION":"Paseo de la Castellana, 120, 7ºC","EMP_FISCALCP":"48215","EMP_FISCALLOCAL":"IURRETA","EMP_FISCALPROV":"VIZCAYA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0011', '11', 'L4', 2, '{"SAGE_ID":"4110036"}', 'SEED_SYSTEM'),
('PAY-FISC-0012', '12', 'L4', 1, '{"EMP_FISCALNAME":"MANTENIMENT I SERVEIS LA MOLINA, S.C.","EMP_FISCALCODE":"J17768078","EMP_FISCALDIRECTION":"Paseo del Prado, 28, 5ºF","EMP_FISCALCP":"17537","EMP_FISCALLOCAL":"LA MOLINA","EMP_FISCALPROV":"GIRONA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0012', '12', 'L4', 2, '{"SAGE_ID":"4110037"}', 'SEED_SYSTEM'),
('PAY-FISC-0013', '13', 'L4', 1, '{"EMP_FISCALNAME":"VIVANCO HERNANDEZ, S.A.","EMP_FISCALCODE":"A43123819","EMP_FISCALDIRECTION":"Plaza de España, 15, Ático","EMP_FISCALCP":"43201","EMP_FISCALLOCAL":"REUS","EMP_FISCALPROV":"TARRAGONA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0013', '13', 'L4', 2, '{"SAGE_ID":"4110038"}', 'SEED_SYSTEM'),
('PAY-FISC-0014', '14', 'L4', 1, '{"EMP_FISCALNAME":"COBILAN, S.C.","EMP_FISCALCODE":"J01504943","EMP_FISCALDIRECTION":"Ronda de Valencia, 14, 6º Derecha","EMP_FISCALCP":"1001","EMP_FISCALLOCAL":"VITORIA-GASTEIZ","EMP_FISCALPROV":"ALAVA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0014', '14', 'L4', 2, '{"SAGE_ID":"4110039"}', 'SEED_SYSTEM'),
('PAY-FISC-0015', '15', 'L4', 1, '{"EMP_FISCALNAME":"HERCAL DIGGERS, S.L.","EMP_FISCALCODE":"B64143639","EMP_FISCALDIRECTION":"Travesía del Sol, 8, Duplex 4","EMP_FISCALCP":"8221","EMP_FISCALLOCAL":"TERRASSA","EMP_FISCALPROV":"BARCELONA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0015', '15', 'L4', 2, '{"SAGE_ID":"4110040"}', 'SEED_SYSTEM'),
('PAY-FISC-0016', '16', 'L4', 1, '{"EMP_FISCALNAME":"COMSA, S.A.","EMP_FISCALCODE":"A08002071","EMP_FISCALDIRECTION":"Calle Viriato, 47","EMP_FISCALCP":"8014","EMP_FISCALLOCAL":"BARCELONA","EMP_FISCALPROV":"BARCELONA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0017', '17', 'L4', 1, '{"EMP_FISCALNAME":"COMSA INSTALACIONES Y SISTEMAS, S.A.U.","EMP_FISCALCODE":"A08304956","EMP_FISCALDIRECTION":"Calle Julián Camarillo, 6","EMP_FISCALCP":"28037","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0018', '18', 'L4', 1, '{"EMP_FISCALNAME":"NORTUNEL, S.A.","EMP_FISCALCODE":"A48425217","EMP_FISCALDIRECTION":"Polígono Ind. Sangroniz, Calle Ibaitarte, 19","EMP_FISCALCP":"48150","EMP_FISCALLOCAL":"SONDIKA","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0019', '19', 'L4', 1, '{"EMP_FISCALNAME":"CONSTRUCCIONES SÁNCHEZ DOMÍNGUEZ-SANDO, S.A.","EMP_FISCALCODE":"A29011788","EMP_FISCALDIRECTION":"Avenida de Manoteras, 46","EMP_FISCALCP":"28050","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0020', '20', 'L4', 1, '{"EMP_FISCALNAME":"ROVER INFRAESTRUCTURAS, S.A.","EMP_FISCALCODE":"A46141360","EMP_FISCALDIRECTION":"Calle de José Abascal, 45","EMP_FISCALCP":"28003","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0021', '21', 'L4', 1, '{"EMP_FISCALNAME":"CYCASA CANTERAS Y CONSTRUCCIONES, S.A.","EMP_FISCALCODE":"A48028771","EMP_FISCALDIRECTION":"Calle Máximo Aguirre, 18","EMP_FISCALCP":"48011","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0022', '22', 'L4', 1, '{"EMP_FISCALNAME":"CAMPEZO OBRAS Y SERVICIOS, S.A.","EMP_FISCALCODE":"A20014294","EMP_FISCALDIRECTION":"Lugar Barrio de Añorga, s/n","EMP_FISCALCP":"20018","EMP_FISCALLOCAL":"SAN SEBASTIÁN","EMP_FISCALPROV":"GIPUZKOA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0023', '23', 'L4', 1, '{"EMP_FISCALNAME":"GEOTUNEL, S.L.","EMP_FISCALCODE":"A81260174","EMP_FISCALDIRECTION":"Calle de los Manzanares, 1","EMP_FISCALCP":"28005","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0024', '24', 'L4', 1, '{"EMP_FISCALNAME":"CONSTRUCCIONES IZA, S.A.","EMP_FISCALCODE":"A48143281","EMP_FISCALDIRECTION":"Barrio de Iurreta, s/n","EMP_FISCALCP":"48215","EMP_FISCALLOCAL":"IURRETA","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0025', '25', 'L4', 1, '{"EMP_FISCALNAME":"ZUBIEDER, S.A.","EMP_FISCALCODE":"A48135899","EMP_FISCALDIRECTION":"Calle de Elcano, 14","EMP_FISCALCP":"48008","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0026', '26', 'L4', 1, '{"EMP_FISCALNAME":"CONSTRUCCIONES MARIEZCURRENA, S.L.","EMP_FISCALCODE":"A31034448","EMP_FISCALDIRECTION":"Carretera de Ituren, s/n","EMP_FISCALCP":"31740","EMP_FISCALLOCAL":"SANTESTEBAN","EMP_FISCALPROV":"NAVARRA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0027', '27', 'L4', 1, '{"EMP_FISCALNAME":"FERROVIAL CONSTRUCCIÓN, S.A.","EMP_FISCALCODE":"A81250506","EMP_FISCALDIRECTION":"Calle de la Ribera del Loira, 42","EMP_FISCALCP":"28042","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0028', '28', 'L4', 1, '{"EMP_FISCALNAME":"MINERA SANTA MARTA, S.A.","EMP_FISCALCODE":"A28014866","EMP_FISCALDIRECTION":"Calle de Serrano, 45","EMP_FISCALCP":"28001","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0029', '29', 'L4', 1, '{"EMP_FISCALNAME":"COMUNIDAD FORAL DE NAVARRA","EMP_FISCALCODE":"S3100001I","EMP_FISCALDIRECTION":"Avenida de Carlos III el Noble, 2","EMP_FISCALCP":"31002","EMP_FISCALLOCAL":"PAMPLONA","EMP_FISCALPROV":"NAVARRA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0030', '30', 'L4', 1, '{"EMP_FISCALNAME":"EUSKAL TRENBIDE SAREA","EMP_FISCALCODE":"Q4800643J","EMP_FISCALDIRECTION":"Calle de San Vicente, 8","EMP_FISCALCP":"48001","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0031', '31', 'L4', 1, '{"EMP_FISCALNAME":"DIPUTACIÓN FORAL DE GIPUZKOA","EMP_FISCALCODE":"P2000000F","EMP_FISCALDIRECTION":"Plaza de Gipuzkoa, s/n","EMP_FISCALCP":"20004","EMP_FISCALLOCAL":"SAN SEBASTIÁN","EMP_FISCALPROV":"GIPUZKOA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0032', '32', 'L4', 1, '{"EMP_FISCALNAME":"CONSELL INSULAR DE MALLORCA","EMP_FISCALCODE":"P0700002J","EMP_FISCALDIRECTION":"Calle del Palau Reial, 1","EMP_FISCALCP":"7001","EMP_FISCALLOCAL":"PALMA","EMP_FISCALPROV":"ILLES BALEARS","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0033', '33', 'L4', 1, '{"EMP_FISCALNAME":"AYUNTAMIENTO DE CASTRILLÓN","EMP_FISCALCODE":"P3301600G","EMP_FISCALDIRECTION":"Plaza de la Constitución, 1","EMP_FISCALCP":"33450","EMP_FISCALLOCAL":"PIEDRAS BLANCAS","EMP_FISCALPROV":"ASTURIAS","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0034', '34', 'L4', 1, '{"EMP_FISCALNAME":"ADMINISTRADOR DE INFRAESTRUCTURAS FERROVIARIAS","EMP_FISCALCODE":"Q2801660H","EMP_FISCALDIRECTION":"Calle de la Sor Ángela de la Cruz, 3","EMP_FISCALCP":"28020","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0035', '35', 'L4', 1, '{"EMP_FISCALNAME":"UTE TÚNEL PEGUERA","EMP_FISCALCODE":"U57218677","EMP_FISCALDIRECTION":"Calle de la Sor Ángela de la Cruz, 3","EMP_FISCALCP":"28020","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0036', '36', 'L4', 1, '{"EMP_FISCALNAME":"UTE TÚNEL DE RANTE","EMP_FISCALCODE":"U88220023","EMP_FISCALDIRECTION":"Calle de la Ribera del Loira, 42","EMP_FISCALCP":"28042","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0037', '37', 'L4', 1, '{"EMP_FISCALNAME":"UTE SISTEMA MARKIJANA","EMP_FISCALCODE":"U01509650","EMP_FISCALDIRECTION":"Polígono Ind. Sangroniz, Calle Ibaitarte, 19","EMP_FISCALCP":"48150","EMP_FISCALLOCAL":"SONDIKA","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0038', '38', 'L4', 1, '{"EMP_FISCALNAME":"UTE SECTOR 3","EMP_FISCALCODE":"U82813583","EMP_FISCALDIRECTION":"Calle Julián Camarillo, 6","EMP_FISCALCP":"28037","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0039', '39', 'L4', 1, '{"EMP_FISCALNAME":"UTE SALIDAS DE EMERGENCIA","EMP_FISCALCODE":"U48464323","EMP_FISCALDIRECTION":"Calle Máximo Aguirre, 18","EMP_FISCALCP":"48011","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0040', '40', 'L4', 1, '{"EMP_FISCALNAME":"UTE L5 GALDAKAO HOSPITAL","EMP_FISCALCODE":"U95914659","EMP_FISCALDIRECTION":"Calle San Vicente, 8, Planta 13","EMP_FISCALCP":"48001","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0041', '41', 'L4', 1, '{"EMP_FISCALNAME":"UTE IRAETA","EMP_FISCALCODE":"U20836522","EMP_FISCALDIRECTION":"Barrio de Añorga, s/n","EMP_FISCALCP":"20018","EMP_FISCALLOCAL":"SAN SEBASTIÁN","EMP_FISCALPROV":"GIPUZKOA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0042', '42', 'L4', 1, '{"EMP_FISCALNAME":"UTE GOROSMENDI BI","EMP_FISCALCODE":"U95655435","EMP_FISCALDIRECTION":"Calle Gran Vía, 17","EMP_FISCALCP":"48001","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0043', '43', 'L4', 1, '{"EMP_FISCALNAME":"UTE ALTZA GALTZARABORDA","EMP_FISCALCODE":"U48123456*","EMP_FISCALDIRECTION":"Paseo de la Castellana, 120","EMP_FISCALCP":"28046","EMP_FISCALLOCAL":"MADRID","EMP_FISCALPROV":"MADRID","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0044', '44', 'L4', 1, '{"EMP_FISCALNAME":"UTE ADIANTE","EMP_FISCALCODE":"U15982125","EMP_FISCALDIRECTION":"Calle Marie Curie, 7","EMP_FISCALCP":"15008","EMP_FISCALLOCAL":"A CORUÑA","EMP_FISCALPROV":"A CORUÑA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-FISC-0045', '45', 'L4', 1, '{"EMP_FISCALNAME":"Construcciones y Promociones Balzola, S.A.","EMP_FISCALCODE":"A48763148","EMP_FISCALDIRECTION":"Sabino Arana Etorbidea, 20","EMP_FISCALCP":"48013","EMP_FISCALLOCAL":"BILBAO","EMP_FISCALPROV":"BIZKAIA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM'),
('PAY-SAGE-0045', '45', 'L4', 2, '{"SAGE_ID":"4100585"}', 'SEED_SYSTEM'),
('PAY-FISC-0046', '46', 'L4', 1, '{"EMP_FISCALNAME":"AZVI, S.A.U.","EMP_FISCALCODE":"A41017088","EMP_FISCALDIRECTION":"Calle Almendralejo, 5","EMP_FISCALCP":"41019","EMP_FISCALLOCAL":"SEVILLA","EMP_FISCALPROV":"SEVILLA","EMP_FISCALCOUNTRY":"ESPAÑA"}', 'SEED_SYSTEM');
