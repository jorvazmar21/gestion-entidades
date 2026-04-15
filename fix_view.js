const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/fractal_core.sqlite');

const sql = `
DROP VIEW IF EXISTS vw_entidades_master;
CREATE VIEW vw_entidades_master AS
SELECT 
    L4.l4_id AS EMP_ID,
    L4.l4_id AS id,
    L4.unique_human_code AS UNIQUE_HUMAN_CODE,
    L4.instance_name AS INSTANCE_NAME,
    L4.is_active AS IS_ACTIVE,
    L4.deleted_at AS DELETED_AT,
    IFNULL(COMP.is_Proveedor, 0) AS IS_PROVEEDOR,
    IFNULL(COMP.is_Subcontratista, 0) AS IS_SUBCONTRATA,
    IFNULL(COMP.is_Contratista, 0) AS IS_CONTRATISTA,
    IFNULL(COMP.is_Cliente, 0) AS IS_CLIENTE,
    CASE WHEN EXISTS (SELECT 1 FROM rel_emp_jointventure WHERE jointVenture_emp_id = L4.l4_id) THEN 1 ELSE 0 END AS IS_UTE
FROM dat_entity_l4_instance L4
LEFT JOIN dat_emp_company COMP ON L4.l4_id = COMP.emp_id;
`;

db.exec(sql, function(err) {
    if (err) {
        console.error('Error applying view:', err);
    } else {
        console.log('View successfully updated in database!');
    }
});
