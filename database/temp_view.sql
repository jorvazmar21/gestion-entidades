-- ========================================================================
-- VISTAS MODO DIOS (BFF) PARA DATAGRIDS FRONTEND
-- ========================================================================
CREATE VIEW IF NOT EXISTS vw_entidades_master AS
SELECT 
    L4.l4_id AS EMP_ID,
    L4.l4_id AS id,
    L4.unique_human_code AS UNIQUE_HUMAN_CODE,
    L4.instance_name AS INSTANCE_NAME,
    L4.is_active AS IS_ACTIVE,
    L4.deleted_at AS DELETED_AT,
    CASE 
        WHEN L4.deleted_at IS NOT NULL THEN 'ANULADA'
        WHEN L4.is_active = 1 THEN 'ACTIVA'
        ELSE 'INACTIVA'
    END AS ESTADO_TXT,
    IFNULL(COMP.is_Proveedor, 0) AS IS_PROVEEDOR,
    IFNULL(COMP.is_Subcontratista, 0) AS IS_SUBCONTRATA,
    IFNULL(COMP.is_Contratista, 0) AS IS_CONTRATISTA,
    IFNULL(COMP.is_Cliente, 0) AS IS_CLIENTE,
    CASE WHEN EXISTS (SELECT 1 FROM rel_emp_jointventure WHERE jointVenture_emp_id = L4.l4_id) THEN 1 ELSE 0 END AS IS_UTE
FROM dat_entity_l4_instance L4
LEFT JOIN dat_emp_company COMP ON L4.l4_id = COMP.emp_id;
