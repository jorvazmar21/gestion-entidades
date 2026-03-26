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
('L-MATRIX-HIERARCHY', 'Strict 4-tier generic directed tree (Category->Family->Type->Instance).', 'L1_OBR -> L2_OBR_GEN -> L3_OBR_STD -> INST_PAJARES', 'L4 MUST have L3 parent. L3 MUST have L2 parent. L2 MUST have L1 parent. No skipping tiers.', 'If creating an instance, you MUST traverse the entire tree to find a valid L3 Type.'),
('CQRS-PSET-ATTACHMENT', 'Polymorphic JSON Schema attachment system.', '{pset_id: "ID_BASE", target_uuid: "L1_OBR", level: "L1"}', 'A PSet mapped to an L1 category applies to ALL descendant L4 instances.', 'Never mutate schema.sql to add entity columns. Always create a PSet and attach it via rel_pset_to_entity_bridge.'),
('NODEJS-SECURITY-PRUNING', 'REST API response JSON trimming based on UISchema roles.', '{"esUte": {"type": "boolean", "ui:visible_roles": ["ADMIN"]}}', 'Only Node.js executes this. SQLite stores full JSON.', 'Never trust the frontend to hide data. Assume the browser is compromised.');

INSERT OR IGNORE INTO sys_ai_behavioral_directives (directive_id, activation_context, ai_attention_weight, imperative_prompt_instruction) VALUES
('DIR_NO_SQL_TRIGGERS', 'When modifying DB schema or adding logic.', 'CRITICAL', 'DO NOT create triggers for math or cascading logic. Defer to Node.js.'),
('DIR_JSON_OPTIMISTIC', 'When updating dat_pset_live_payloads.', 'HIGH', 'Always require __v parameter in payload. Reject if mismatched to prevent lost updates.');

INSERT OR IGNORE INTO rel_ai_behavior_to_table_bridge (target_table_name, directive_id, ai_attention_enforcement_reason) VALUES
('dat_pset_live_payloads', 'DIR_JSON_OPTIMISTIC', 'Protects against concurrent editing collisions in generic JSON blobs.');

-- =========================================================================
-- 1. L-MATRIX ENTITY HIERARCHY SEEDING
-- =========================================================================

-- L1: CATEGORIES
INSERT OR IGNORE INTO def_entity_l1_category (l1_id, human_readable_name, ui_icon_identifier) VALUES
('L1_OBR', 'Centro de Coste (Obra)', 'mod_OBR.svg'),
('L1_SED', 'Sede Corporativa', 'mod_SED.svg'),
('L1_PRQ', 'Parque de Maquinaria', 'mod_PRQ.svg'),
('L1_PRO', 'Proveedor / Acreedor', 'mod_PRO.svg'),
('L1_CLI', 'Cliente / Pagador', 'mod_CLI.svg'),
('L1_EVT', 'Evento Transaccional', 'sys_event.svg'),
('L1_REC', 'Recurso Físico / Humano', 'sys_resource.svg');

-- L2: FAMILIES
INSERT OR IGNORE INTO def_entity_l2_family (l2_id, l1_parent_id, human_readable_name) VALUES
-- Obras
('L2_OBR_GEN', 'L1_OBR', 'Obra General'),
('L2_OBR_UTE', 'L1_OBR', 'Obra UTE'),
('L2_OBR_SOB', 'L1_OBR', 'Subdivisión de Obra (Tramo)'),
-- Sedes & Parques
('L2_SED_OFI', 'L1_SED', 'Oficina Central'),
('L2_PRQ_ALM', 'L1_PRQ', 'Almacén / Instalación Logística'),
-- Proveedores & Clientes
('L2_PRO_SUC', 'L1_PRO', 'Sucursal de Proveedor'),
('L2_CLI_SEC', 'L1_CLI', 'Sector de Cliente'),
-- Eventos Operativos
('L2_EVT_MANT', 'L1_EVT', 'Mantenimiento (OT / SOT)'),
('L2_EVT_PROD', 'L1_EVT', 'Producción (Tarea / Subtarea)'),
('L2_EVT_LOGI', 'L1_EVT', 'Logística (Pedido / Albarán)'),
-- Recursos
('L2_REC_MAQ', 'L1_REC', 'Máquina Individual'),
('L2_REC_MAT', 'L1_REC', 'Material Fungible'),
('L2_REC_HUM', 'L1_REC', 'Trabajador Humano');

-- L3: TYPES (The Concrete Molds)
INSERT OR IGNORE INTO def_entity_l3_type (l3_id, l2_parent_id, human_readable_name) VALUES
-- Obras
('L3_OBR_CIVIL', 'L2_OBR_GEN', 'Molde Obra Civil Estándar'),
('L3_OBR_TRAMO', 'L2_OBR_SOB', 'Molde Tramo Lineal'),
-- Sedes
('L3_SED_OFI_ADM', 'L2_SED_OFI', 'Molde Oficina Administrativa'),
-- Proveedores
('L3_PRO_SUC_STD', 'L2_PRO_SUC', 'Molde Sucursal Proveedor Estándar'),
-- Eventos Operativos (Los antiguos M_OTR, M_TAR, etc.)
('M_OTR', 'L2_EVT_MANT', 'Orden de Trabajo (Cabecera)'),
('M_SOT', 'L2_EVT_MANT', 'Suborden de Trabajo (Línea)'),
('M_TAR', 'L2_EVT_PROD', 'Tarea de Producción'),
('M_PED', 'L2_EVT_LOGI', 'Pedido de Suministro'),
('M_ALB', 'L2_EVT_LOGI', 'Albarán de Recepción'),
-- Recursos
('L3_REC_MAQ_PESADA', 'L2_REC_MAQ', 'Máquina Pesada'),
('L3_REC_MAQ_LIGERA', 'L2_REC_MAQ', 'Máquina Ligera Portátil');

-- =========================================================================
-- 2. PARAMETRIC PROPERTY SETS (CQRS DICTIONARIES) SEEDING
-- =========================================================================

-- PSet Base Identidad Universal (Aplica a todo el mundo que sea una Obra)
INSERT OR IGNORE INTO def_pset_template (pset_id, schema_code, schema_alias, ui_group_name, json_shape_definition) VALUES
('PSET_SYS_IDENTITY', 'IDENTITY_BASE', 'Identidad Básica', 'Datos Generales', 
'{"DataSchema": {"cif": {"type": "string"}, "fecha_inicio": {"type": "string", "format": "date"}}, "UISchema": {"cif": {"security:visible_roles": ["CREADOR", "ADMINISTRADOR", "USUARIO"]}, "fecha_inicio": {"security:visible_roles": ["CREADOR", "ADMINISTRADOR", "USUARIO"]}}}');

-- Atar el PSET_SYS_IDENTITY genéricamente a la Categoría L1 (Obra). Todas las obras lo heredarán.
INSERT OR IGNORE INTO rel_pset_to_entity_bridge (pset_id, target_uuid, attachment_level_enum) VALUES
('PSET_SYS_IDENTITY', 'L1_OBR', 'L1');

-- =========================================================================
-- 3. ABAC MATRIX SEEDING
-- =========================================================================
INSERT OR IGNORE INTO sys_abac_matrix (fase_obra, departamento, rol_autoridad, can_view, can_edit, can_approve) VALUES
('ESTUDIO', 'OFICINA_TECNICA', 'CREADOR', 1, 1, 1),
('EJECUCION', 'PRODUCCION', 'ADMINISTRADOR', 1, 1, 1),
('EJECUCION', 'PRODUCCION', 'USUARIO', 1, 1, 0);
