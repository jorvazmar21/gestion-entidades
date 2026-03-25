-- =========================================================================
-- FRACTAL CORE 1.0 - SEMILLAS DE BASE DE DATOS (DATA SEEDING)
-- =========================================================================

-- 1. NIVELES JERÁRQUICOS
INSERT OR IGNORE INTO sys_niveles (id_nivel, jerarquia, nombre) VALUES
('L1', 10, 'LUGARES (Hubs)'),
('L2', 20, 'DELEGACIONES (Centros de Coste)'),
('L3', 30, 'EVENTOS (Carpetas Lógicas)'),
('Lm', 90, 'DESGLOSES (Líneas de Imputación)'),
('Ln', 100, 'MEDIOS');

-- 2. MOLDES CANÓNICOS L1 (Entidades Núcleo)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M_OBR', 'OBR', 'L1', 'Obra', 'Epicentro de beneficio', '{"padres_permitidos":[]}', 'mod_OBR.svg'),
('M_SED', 'SED', 'L1', 'Sede Corporativa', 'Unidad de soporte', '{"padres_permitidos":[]}', 'mod_SED.svg'),
('M_PRQ', 'PRQ', 'L1', 'Parque de Maquinaria', 'Hub logístico central', '{"padres_permitidos":[]}', 'mod_PRQ.svg'),
('M_PRO', 'PRO', 'L1', 'Proveedor', 'Suministradores de recursos', '{"padres_permitidos":[]}', 'mod_PRO.svg'),
('M_CLI', 'CLI', 'L1', 'Cliente', 'Agentes destinatarios', '{"padres_permitidos":[]}', 'mod_CLI.svg');

-- 3. MOLDES CANÓNICOS L2 (Delegaciones - Receptores de Coste)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M_SEC', 'SEC', 'L2', 'Sector de Cliente', 'Contratos de cliente', '{"padres_permitidos":["CLI"]}', 'mod_SEC.svg'),
('M_SUC', 'SUC', 'L2', 'Sucursal', 'Talleres o puntos de venta', '{"padres_permitidos":["PRO"]}', 'mod_SUC.svg'),
('M_MQP', 'MQP', 'L2', 'Máquina Propia', 'Receptor L2 de costes mecánicos', '{"padres_permitidos":["PRQ"]}', 'mod_MQP.svg'),
('M_ALM', 'ALM', 'L2', 'Instalación Logística', 'Nodos físicos', '{"padres_permitidos":["PRQ", "OBR", "SED"]}', 'mod_ALM.svg'),
('M_SOB', 'SOB', 'L2', 'Subdivisión de Obra', 'Tramos o actuaciones', '{"padres_permitidos":["OBR"]}', 'mod_SOB.svg'),
('M_OFI', 'OFI', 'L2', 'Oficina', 'Centro de gestión corporativa', '{"padres_permitidos":["SED", "OBR", "PRQ"]}', 'mod_OFI.svg'),
('M_RMA', 'RMA', 'L2', 'Registro Documental', 'Archivador virtual L2', '{"padres_permitidos":["SED", "OBR", "PRQ"]}', 'mod_RMA.svg');

-- 4. EVENTOS OPERATIVOS L3/L4 (Los Camaleones)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M_OTR', 'OTR', 'L3', 'Orden de Trabajo', 'Mantenimiento de maquinaria', null, 'mod_OTR.svg'),
('M_SOT', 'SOT', 'Lm', 'Suborden', 'Línea de Mantenimiento', '{"padres_permitidos":["OTR"]}', 'mod_SOT.svg'),
('M_TAR', 'TAR', 'L3', 'Tarea de Producción', 'Producción física', null, 'mod_TAR.svg'),
('M_STR', 'STR', 'Lm', 'Subtarea', 'Desglose de horas', '{"padres_permitidos":["TAR"]}', 'mod_STR.svg'),
('M_CAP', 'CAP', 'L3', 'Capítulo', 'Agrupación para certificación', null, 'mod_CAP.svg'),
('M_SCA', 'SCA', 'Lm', 'Subcapítulo (Certificación)', 'Trazado de UDOs', '{"padres_permitidos":["CAP"]}', 'mod_SCA.svg'),
('M_PED', 'PED', 'L3', 'Pedido', 'Agrupador logístico', null, 'mod_PED.svg'),
('M_ALB', 'ALB', 'Lm', 'Albarán/Línea Recepción', 'Registro material', '{"padres_permitidos":["PED"]}', 'mod_ALB.svg');

-- 4.2. TRANSACCIONES SINGULARES (El Reparto de Costes Analítico)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M_REP', 'REP', 'L3', 'Asiento de Regularización', 'Distribución de saco temporal a destinatarios', null, 'mod_REP.svg'),
('M_LRP', 'LRP', 'Lm', 'Línea de Regularización', 'Extracción (-) o Inserción (+) equilibrada', '{"padres_permitidos":["REP"]}', 'mod_LRP.svg');

-- 5. MEDIOS L5 (El Catálogo en Bruto)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_tipo_entidad, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M_MAT', 'MAT', 'Ln', 'Material', 'Suministro transaccionable', null, 'mod_MAT.svg'),
('M_MQI', 'MQI', 'Ln', 'Máquina Individual', 'Recurso físico o alquilado portátil', null, 'mod_MQI.svg'),
('M_TRA', 'TRA', 'Ln', 'Trabajador Humano', 'Horas imputables', null, 'mod_TRA.svg'),
('M_UDO', 'UDO', 'Ln', 'Unidad de Obra', 'Elemento certificable (Ingreso)', null, 'mod_UDO.svg'),
('M_SBC', 'SBC', 'Ln', 'Partida Subcontratada', 'Estadillo productivo', null, 'mod_SBC.svg'),
('M_DOC', 'DOC', 'Ln', 'Documento de Calidad', 'Ficha o Auditoría PSet Eval', null, 'mod_DOC.svg');
