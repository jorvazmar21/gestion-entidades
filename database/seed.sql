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
('DIR_JSON_OPTIMISTIC', 'When updating dat_pset_live_payloads.', 'HIGH', 'Always require __v parameter in payload. Reject if mismatched to prevent lost updates.');

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

-- PSet: Rol que Desempeñas (Para Entidades Directorio EMP)
INSERT OR IGNORE INTO def_pset_template (id_pset, schema_code, schema_alias, fk_ui_group, ui_order, json_shape_definition, created_by) VALUES
(2, 'ROLES_DINAMICOS', 'Rol que Desempeñas', 2, 10, 
'{"DataSchema": {"soyProveedor": {"type": "boolean"}, "soyCliente": {"type": "boolean"}, "soyContrata": {"type": "boolean"}, "soySubcontrata": {"type": "boolean"}}, "UISchema": {"soyProveedor": {"ui:readonly": false}, "soyCliente": {"ui:readonly": false}, "soyContrata": {"ui:readonly": false}, "soySubcontrata": {"ui:readonly": false}}}', 'SEED_SYSTEM');

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
INSERT OR IGNORE INTO rel_pset_to_entity_bridge (fk_pset, target_uuid, attachment_level_enum) VALUES
(1, '2', 'L1'), -- L1_OBR
(1, '1', 'L1'), -- L1_EMP
(2, '1', 'L1'), -- L1_EMP
(3, '1', 'L2'), -- L2_EMP_UTE
(4, '2', 'L2'), -- L2_EMP_NOUTE
(5, '1', 'L3'); -- L3_EMP_UTE_STD

-- =========================================================================
-- 3. ABAC MATRIX SEEDING
-- =========================================================================
INSERT OR IGNORE INTO sys_abac_matrix (fase_obra, departamento, rol_autoridad, can_view, can_edit, can_approve) VALUES
('ESTUDIO', 'OFICINA_TECNICA', 'CREADOR', 1, 1, 1),
('EJECUCION', 'PRODUCCION', 'ADMINISTRADOR', 1, 1, 1),
('EJECUCION', 'PRODUCCION', 'USUARIO', 1, 1, 0);
