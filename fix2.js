const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/generics/HierarchicalEntityGrid.tsx', 'utf8');

// The block to replace was messed up. Let's find exactly lines 21 to 140 and overwrite them with our logic safely.
const lines = code.split('\n');

const topPart = lines.slice(0, 25).join('\n'); // until `const searchTerm`

const newLogic = `
  const searchTerm = useUiStore(state => state.searchTerm);
  
  const activeDetailTab = useUiStore(state => state.activeDetailTab);
  const setActiveDetailTab = useUiStore(state => state.setActiveDetailTab);
  
  const activeTabFilter = useUiStore(state => state.activeTabFilter);
  const setActiveTabFilter = useUiStore(state => state.setActiveTabFilter);

  const masterTabs = blueprint?.masterConfig.tabs || [];

  // Pestañas Hijas Dinámicas (Detail) dependientes de la "global" o la específica de la pestaña Padre
  const detailViewDef = useMemo(() => {
      if (!blueprint?.detailConfig) return null;
      if (activeTabFilter && blueprint.detailConfig[activeTabFilter]) {
          return blueprint.detailConfig[activeTabFilter];
      }
      return blueprint.detailConfig['global'] || null;
  }, [blueprint, activeTabFilter]);

  const allowedChildren = detailViewDef?.tabs || [];

  const [serverData, setServerData] = useState<any[]>([]);

  // BFF Fetch en la inicialización del Módulo
  useEffect(() => {
     if (!blueprint) return;
     const baseConfig = masterTabs[0]?.queryConfig;
     if (baseConfig && baseConfig.endpoint) {
         fetch(baseConfig.endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ table: baseConfig.table, conditions: {} })
         })
         .then(res => res.json())
         .then(json => {
             if (json.success) {
                 setServerData(json.data);
             } else {
                 console.error("Error en BFF fetch:", json.error);
             }
         })
         .catch(err => console.error("Error red BFF fetch:", err));
     }
  }, [blueprint?.viewId]);

  useEffect(() => {
     if (masterTabs.length > 0 && !activeTabFilter) {
        setActiveTabFilter(masterTabs[0].id);
     }
  }, [masterTabs, activeTabFilter, setActiveTabFilter]);

  // Si estamos en un L2 o L3 sin hijos L4, forzamos cerrar panel
  useEffect(() => {
     if (allowedChildren.length > 0) {
        if (!activeDetailTab) {
           setActiveDetailTab(detailViewDef?.defaultOpenTabId || allowedChildren[0].id);
        }
     } else {
        setActiveDetailTab(null);
     }
  }, [activeTabFilter, blueprint?.viewId, detailViewDef]);

  // Filtrado Frontend (Pestañas, Texto, Semáforos)
  const filteredData = useMemo(() => {
      if (!serverData) return [];
      
      return serverData.filter((e: any) => {
         
         // Filtrado por pestaña lógica (Data-Driven 'whereClause') local
         const currentTab = masterTabs.find(t => t.id === activeTabFilter);
         if (currentTab?.queryConfig?.whereClause) {
             const [field, operation, value] = currentTab.queryConfig.whereClause.split(' ');
             if (field && operation === '=' && value === '1') {
                 if (e[field] !== 1) return false;
             }
             if (field && operation === '=' && value === '0') {
                 if (e[field] !== 0) return false;
             }
         }
         
         // Filtrado por búsqueda de texto
         if (searchTerm) {
             const term = searchTerm.toLowerCase();
             const codeMatch = e.UNIQUE_HUMAN_CODE && String(e.UNIQUE_HUMAN_CODE).toLowerCase().includes(term);
             const nameMatch = e.INSTANCE_NAME && String(e.INSTANCE_NAME).toLowerCase().includes(term);
             if (!codeMatch && !nameMatch) return false;
         }

         // Filtrado por estado (Semáforos de Zona 5)
         const isDeleted = e.DELETED_AT !== undefined && e.DELETED_AT !== null; 
         const isActive = e.IS_ACTIVE === 1;

         if (isDeleted) {
            return statusFilter.anuladas;
         } else {
            if (isActive) return statusFilter.activas;
            if (!isActive) return statusFilter.inactivas;
         }

         return false;
      });
  }, [serverData, activeTabFilter, statusFilter, masterTabs, searchTerm]);

  // Si la visibilidad desaparece, cerramos el panel
  useEffect(() => {
     if (selectedEntityId) {
        const stillExists = filteredData.some((r: any) => r.EMP_ID === selectedEntityId || r.id === selectedEntityId);
        if (!stillExists) {
           setSelectedEntityId(null);
        }
     }
  }, [filteredData, selectedEntityId, setSelectedEntityId]);
`;

// Find the line where `if (!blueprint) return null;` is, which is right after these hooks.
const endLineIndex = lines.findIndex(line => line.includes('if (!blueprint) return null;'));
if (endLineIndex !== -1) {
    const bottomPart = lines.slice(endLineIndex).join('\\n');
    fs.writeFileSync('frontend/src/components/generics/HierarchicalEntityGrid.tsx', topPart + '\\n' + newLogic + '\\n' + bottomPart, 'utf8');
    console.log("Success");
} else {
    console.log("Error finding end line");
}
