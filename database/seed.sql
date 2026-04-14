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

-- UI GROUPS (The centralized visual containers for React-- Grupos de PSet (Semillas)
INSERT OR IGNORE INTO def_pset_groups (id_pset_group, pset_group_code, pset_group_name, ui_order, created_by) VALUES
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
INSERT OR IGNORE INTO rel_pset_to_entity_bridge (id_bridge, fk_pset, target_definition_uuid, definition_level_enum) VALUES
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
