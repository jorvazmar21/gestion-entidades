-- =========================================================================
-- FRACTAL CORE 1.0 - SEMILLAS DE BASE DE DATOS (DATA SEEDING)
-- =========================================================================

-- 1. NIVELES JERÁRQUICOS
INSERT OR IGNORE INTO sys_niveles (id_nivel, jerarquia, nombre) VALUES
('L1', 10, 'ENTIDADES NÚCLEO (Hubs)'),
('L2', 20, 'DELEGACIONES (Centros de Coste)'),
('L3', 30, 'EVENTOS (Carpetas Lógicas)'),
('L4', 40, 'DESGLOSES (Líneas de Imputación)'),
('L5', 50, 'RECURSOS Y MEDIOS');

-- 2. MOLDES CANÓNICOS L1 (Entidades Núcleo)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M-CLIENTE',   'L1', 'Cliente', 'Agentes destinatarios', '{"padres_permitidos":[]}', 'UserCheck'),
('M-PROVEEDOR', 'L1', 'Proveedor', 'Suministradores de recursos', '{"padres_permitidos":[]}', 'Truck'),
('M-PARQUE',    'L1', 'Parque de Maquinaria', 'Hub logístico central', '{"padres_permitidos":[]}', 'Settings'),
('M-SEDE',      'L1', 'Sede Corporativa', 'Unidad de soporte', '{"padres_permitidos":[]}', 'Building'),
('M-OBRA',      'L1', 'Obra', 'Epicentro de beneficio', '{"padres_permitidos":[]}', 'HardHat');

-- 3. MOLDES CANÓNICOS L2 (Delegaciones - Receptores de Coste)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M-SECTOR',     'L2', 'Sector de Cliente', 'Contratos de cliente', '{"padres_permitidos":["M-CLIENTE"]}', 'Network'),
('M-SUCURSAL',   'L2', 'Sucursal', 'Talleres o puntos de venta', '{"padres_permitidos":["M-PROVEEDOR"]}', 'Store'),
('M-MAQUINA-PRO','L2', 'Máquina Propia', 'Receptor L2 de costes mecánicos', '{"padres_permitidos":["M-PARQUE"]}', 'Wrench'),
('M-ALMACEN',    'L2', 'Instalación Logística', 'Nodos físicos', '{"padres_permitidos":["M-PARQUE", "M-OBRA", "M-SEDE"]}', 'PackageOpen'),
('M-SUB-OBRA',   'L2', 'Subdivisión de Obra', 'Tramos o actuaciones', '{"padres_permitidos":["M-OBRA"]}', 'MapPin'),
('M-OFICINA',    'L2', 'Oficina', 'Centro de gestión corporativa', '{"padres_permitidos":["M-SEDE", "M-OBRA", "M-PARQUE"]}', 'Briefcase'),
('M-REGISTRO-MA','L2', 'Registro Documental', 'Archivador virtual L2', '{"padres_permitidos":["M-SEDE", "M-OBRA", "M-PARQUE"]}', 'Folders');

-- 4. EVENTOS OPERATIVOS L3/L4 (Los Camaleones)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M-ORDEN-TRABAJO',  'L3', 'Orden de Trabajo', 'Mantenimiento de maquinaria', null, 'ClipboardList'),
('M-SUBORDEN',       'L4', 'Suborden', 'Línea de Mantenimiento', '{"padres_permitidos":["M-ORDEN-TRABAJO"]}', 'Activity'),
('M-TAREA',          'L3', 'Tarea de Producción', 'Producción física', null, 'CalendarDays'),
('M-SUBTAREA',       'L4', 'Subtarea', 'Desglose de horas', '{"padres_permitidos":["M-TAREA"]}', 'Timer'),
('M-CAPITULO',       'L3', 'Capítulo', 'Agrupación para certificación', null, 'FolderOpen'),
('M-SUBCAPITULO',    'L4', 'Subcapítulo (Certificación)', 'Trazado de UDOs', '{"padres_permitidos":["M-CAPITULO"]}', 'FileCheck'),
('M-PEDIDO',         'L3', 'Pedido', 'Agrupador logístico', null, 'ShoppingCart'),
('M-ALBARAN',        'L4', 'Albarán/Línea Recepción', 'Registro material', '{"padres_permitidos":["M-PEDIDO"]}', 'Receipt');

-- 4.2. TRANSACCIONES SINGULARES (El Reparto de Costes Analítico)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M-REPARTO-COSTES', 'L3', 'Asiento de Regularización', 'Distribución de saco temporal a destinatarios', null, 'Scale'),
('M-LINEA-REPARTO',  'L4', 'Línea de Regularización', 'Extracción (-) o Inserción (+) equilibrada', '{"padres_permitidos":["M-REPARTO-COSTES"]}', 'Equal');

-- 5. MEDIOS L5 (El Catálogo en Bruto)
INSERT OR IGNORE INTO sys_moldes (id_molde, id_nivel, nombre, descripcion, reglas_config, icono_sistema) VALUES
('M-MATERIAL',       'L5', 'Material', 'Suministro transaccionable', null, 'Box'),
('M-MAQUINA-IND',    'L5', 'Máquina Individual', 'Recurso físico o alquilado portátil', null, 'Tractor'),
('M-TRABAJADOR',     'L5', 'Trabajador Humano', 'Horas imputables', null, 'UserCog'),
('M-UDO',            'L5', 'Unidad de Obra', 'Elemento certificable (Ingreso)', null, 'Ruler'),
('M-SUBCONTRATA',    'L5', 'Partida Subcontratada', 'Estadillo productivo', null, 'Handshake'),
('M-DOCUMENTO',      'L5', 'Documento de Calidad', 'Ficha o Auditoría PSet Eval', null, 'FileSearch');
