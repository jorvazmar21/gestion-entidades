const DB_KEY = 'MAESTRO_ACTIVOS_DB';

// Configuración de Módulos (Tipos) - AHORA DINÁMICO
let MODULES = {};
// La lista ordenada y completa vendrá del backend
let tiposEntidadDb = [];

// Estado Global
const app = {
    currentModule: null,
    filters: { active: true, inactive: false, deleted: false },
    db: [],
    psets_def: [], // Definiciones de los PSets relacional
    psetValuesDb: {}, // Valores ESTATICOS (idEnt_idPset -> {prop:val})
    psetHistoryDb: [], // Valores DINAMICOS [{id_entity, id_pset, timestamp, data:{prop:val}}]

    // Iteración 8: Memoria de Estado
    moduleStates: {},
    pstExpandedRows: new Set(),
    expandedRows: new Set(), // Para el acordeón de Lugares
    // Iteración 8.2: Filtros independientes para PST
    pstFilters: {
        ESTATICO: { active: true, inactive: false, deleted: false },
        DINAMICO: { active: true, inactive: false, deleted: false }
    },
    delegationFilters: { active: true, inactive: false, deleted: false }, // Filtros locales del acordeón
    // Iteración 8.3: Filtros de PST
    pstSearch: {
        ESTATICO: '',
        DINAMICO: ''
    },

    // Configuracion DataGrids
    sortCol: 'name',
    sortAsc: true,

    // -- MOCKS DICCIONARIO Y TABLAS --
    schemaTables: [
        {
            name: 'Directorio_Master_Activos',
            fields: [
                { name: 'id', type: 'VARCHAR(50)', desc: 'PK - Identificador Unico UUID' },
                { name: 'level', type: 'VARCHAR(10)', desc: 'Nivel Jerárquico (L1-L5, L1B, L2B)' },
                { name: 'category', type: 'VARCHAR(50)', desc: 'Categoría (LUGAR, DELEGACION...)' },
                { name: 'subCategory', type: 'VARCHAR(50)', desc: 'Subcategoría (ALMACEN, MAQUINARIA...)' },
                { name: 'type', type: 'VARCHAR(10)', desc: 'Tipo de Entidad' },
                { name: 'code', type: 'VARCHAR(12)', desc: 'Código de Usuario' },
                { name: 'name', type: 'VARCHAR(255)', desc: 'Nombre descriptivo' },
                { name: 'location', type: 'VARCHAR(255)', desc: 'Ubicación física' },
                { name: 'canal', type: 'VARCHAR(8)', desc: 'Código imputación contable' },
                { name: 'parentId', type: 'VARCHAR(50)', desc: 'FK -> Master_Activos(id) del Padre' },
                { name: 'isActive', type: 'BIT', desc: 'Bandera Activo/Inactivo (1/0)' },
                { name: 'deletedAt', type: 'DATETIME', desc: 'Fecha borrado lógico (NULL=OK)' },
                { name: 'deletedBy', type: 'VARCHAR(50)', desc: 'Usuario que archivó' },
                { name: 'createdAt', type: 'DATETIME', desc: 'Fecha alta' },
                { name: 'createdBy', type: 'VARCHAR(50)', desc: 'Usuario creador' },
                { name: 'updatedAt', type: 'DATETIME', desc: 'Fecha última modificación' },
                { name: 'updatedBy', type: 'VARCHAR(50)', desc: 'Usuario que modificó' }
            ],
            constraints: 'PK_Directorio_Master(id). \nUK_Master_Code(code) WHERE deletedAt IS NULL.'
        },
        // Nuevas arquitecturas para el Diccionario referentes a PSETS
        {
            name: 'PSet_Definitions',
            fields: [
                { name: 'id_pset', type: 'VARCHAR(50)', desc: 'PK/FK -> Master_Activos(id) tipo PST' },
                { name: 'behavior', type: 'VARCHAR(20)', desc: 'ESTATICO | DINAMICO' },
                { name: 'appliesTo', type: 'JSON', desc: 'Array Entidades Ej: ["OBR","PRV"]' },
                { name: 'properties', type: 'JSON', desc: 'Array de {name, type, config}' }
            ],
            constraints: 'PK_PSet_Defs(id_pset).'
        },
        {
            name: 'PSet_Values_Static',
            fields: [
                { name: 'id_entity', type: 'VARCHAR(50)', desc: 'PK/FK -> Master_Activos(id)' },
                { name: 'id_pset', type: 'VARCHAR(50)', desc: 'PK/FK -> Master_Activos(id) tipo PST' },
                { name: 'data', type: 'JSON', desc: 'KvP Values Ej: {"Direccion": "Calle 1"}' }
            ],
            constraints: 'PK_Composite(id_entity, id_pset).'
        },
        {
            name: 'PSet_Values_Dynamic',
            fields: [
                { name: 'id_record', type: 'VARCHAR(50)', desc: 'PK Autogenerado' },
                { name: 'id_entity', type: 'VARCHAR(50)', desc: 'FK -> Master_Activos(id)' },
                { name: 'id_pset', type: 'VARCHAR(50)', desc: 'FK -> Master_Activos(id) tipo PST' },
                { name: 'timestamp', type: 'DATETIME', desc: 'Fecha de captura' },
                { name: 'data', type: 'JSON', desc: 'KvP Values Ej: {"Horas Uso": 450}' }
            ],
            constraints: 'PK(id_record).'
        },
        {
            name: 'Tipos_Entidad',
            fields: [
                { name: 'id_tipo', type: 'VARCHAR(3)', desc: 'PK - Identificador/Prefijo' },
                { name: 'nombre', type: 'VARCHAR(100)', desc: 'Nombre del Módulo o Tipo' },
                { name: 'categoria', type: 'VARCHAR(20)', desc: 'LUGAR | DELEGACION | PSET' },
                { name: 'subCategoria', type: 'VARCHAR(50)', desc: 'Clasificación secundaria' },
                { name: 'nivel', type: 'VARCHAR(5)', desc: 'Nivel Jerárquico (L1, L2...)' },
                { name: 'icono', type: 'VARCHAR(50)', desc: 'Icono SVG/Emoji' },
                { name: 'tipos_hijo_permitidos', type: 'JSON', desc: 'Array de prefijos hijos admitidos' },
                { name: 'max_count_per_parent', type: 'INT', desc: 'Límite maximo por nivel superior' }
            ],
            constraints: 'PK_Tipos_Entidad(id_tipo).'
        }
    ],
    currentExcelTableIdx: 0,

    // -- INICIALIZACIÓN --
    async init() {
        try {
            // Intentamos cargar del Servidor Node 
            const res = await fetch('/api/load');
            const result = await res.json();

            if (!res.ok || !result.success) {
                if (result.error === "CRITICAL_MISSING_TYPES") {
                    this.showCriticalError(result.message);
                    return;
                }
                throw new Error(result.error || "Error desconocido al cargar del servidor");
            }

            if (result.success && result.csvData) {
                this.db = this.parseCSV(result.csvData.master);
                this.psets_def = this.parseCSVDefs(result.csvData.psets_def);
                this.psetValuesDb = this.parseCSVVals(result.csvData.psets_val);
                this.psetHistoryDb = this.parseCSVDyns(result.csvData.psets_dyn);
                this.parseTiposEntidad(result.csvData.tipos_entidad);
            } else {
                this.fallbackLocalInit();
            }
        } catch (e) {
            console.warn("No se pudo conectar al servidor. Fallback a LocalStorage.", e);
            this.fallbackLocalInit();
        }

        // Setup table functionality
        this.setupTableSorting('data-table');
        this.setupTableSorting('pst-table-ESTATICO');
        this.setupTableSorting('pst-table-DINAMICO');
    },

    fallbackLocalInit() {
        console.warn("Modo Fallback Offline (LocalStorage)");
        // Master
        const stored = localStorage.getItem(DB_KEY);
        if (stored) this.db = JSON.parse(stored);
        else { this.db = []; this.saveDb(); }

        // PSets
        const storedPsets = localStorage.getItem('psets_def_db');
        if (storedPsets) this.psets_def = JSON.parse(storedPsets);
        else { this.psets_def = []; localStorage.setItem('psets_def_db', '[]'); }

        const storedSValues = localStorage.getItem('psets_val_db');
        if (storedSValues) this.psetValuesDb = JSON.parse(storedSValues);
        else { this.psetValuesDb = {}; localStorage.setItem('psets_val_db', '{}'); }

        const storedDValues = localStorage.getItem('psets_dyn_db');
        if (storedDValues) this.psetHistoryDb = JSON.parse(storedDValues);
        else { this.psetHistoryDb = []; localStorage.setItem('psets_dyn_db', '[]'); }

        // Tipos Dinámicos (Nuevo Iteracion 9)
        const storedTipos = localStorage.getItem('tipos_entidad_db');
        if (storedTipos) {
            tiposEntidadDb = JSON.parse(storedTipos);
            this.parseTiposEntidadFromObject(tiposEntidadDb);
        } else {
            // Unidades por defecto si no hay base local
            const defaultLines = [
                'OBR;Obras;LUGAR;;L1;#icon-build;["PRL","SEC"];',
                'PRV;Proveedores;LUGAR;;L1;#icon-handshake;["PRL","SEC"];',
                'SED;Sedes;LUGAR;;L1;#icon-office;["PRL","SEC"];',
                'PAR;Parque;LUGAR;;L1;#icon-tractor;["PRL","BHO","BIN","BPM","CRZ","CEL","CPH","CPN","CDI","DAR","RET","GDI","J2B","J3B","MTE","MPI","MHI","NAG","CCO","CPB","PIL","PEL","RGU","TIL","VEN"];',
                'CLI;Clientes;LUGAR;;L1;#icon-handshake;["PRL","SEC"];',
                'PRL;Principal;DELEGACION;ALMACEN;L2;;[];1',
                'SEC;Secundario;DELEGACION;ALMACEN;L2;;[];',
                'BHO;Bomba de Hormigón;DELEGACION;MAQUINARIA;L2;;[];',
                'BIN;Bomba Inyectadora;DELEGACION;MAQUINARIA;L2;;[];',
                'BPM;Bomba Proy. Membrana;DELEGACION;MAQUINARIA;L2;;[];',
                'CRZ;Cabeza Rozadora;DELEGACION;MAQUINARIA;L2;;[];',
                'CEL;Carretilla Elevadora;DELEGACION;MAQUINARIA;L2;;[];',
                'CPH;Carro Perf. Hidráulico;DELEGACION;MAQUINARIA;L2;;[];',
                'CPN;Carro Perf. Neumático;DELEGACION;MAQUINARIA;L2;;[];',
                'CDI;Compresor Diesel;DELEGACION;MAQUINARIA;L2;;[];',
                'DAR;Dúmper Articulado;DELEGACION;MAQUINARIA;L2;;[];',
                'RET;Retroexcavadora;DELEGACION;MAQUINARIA;L2;;[];',
                'GDI;Generador Diesel;DELEGACION;MAQUINARIA;L2;;[];',
                'J2B;Jumbo (2 brazo);DELEGACION;MAQUINARIA;L2;;[];',
                'J3B;Jumbo (3 brazos);DELEGACION;MAQUINARIA;L2;;[];',
                'MTE;Manipuldora Telescópica;DELEGACION;MAQUINARIA;L2;;[];',
                'MPI;Máquina de Pintar;DELEGACION;MAQUINARIA;L2;;[];',
                'MHI;Martillo Hidráulico;DELEGACION;MAQUINARIA;L2;;[];',
                'NAG;Nagolitera;DELEGACION;MAQUINARIA;L2;;[];',
                'CCO;Cargadora Convencional;DELEGACION;MAQUINARIA;L2;;[];',
                'CPB;Cargadora de Perfil Bajo;DELEGACION;MAQUINARIA;L2;;[];',
                'PIL;Planta de Inyec. Lechada;DELEGACION;MAQUINARIA;L2;;[];',
                'PEL;Plataforma Elevadora;DELEGACION;MAQUINARIA;L2;;[];',
                'RGU;Robot de Gunitado;DELEGACION;MAQUINARIA;L2;;[];',
                'TIL;Torre de Iluminación;DELEGACION;MAQUINARIA;L2;;[];',
                'VEN;Ventilador;DELEGACION;MAQUINARIA;L2;;[];',
                'PST;Propiedades (PSet);PSET;;L1B;#icon-pset;[];'
            ];
            this.parseTiposEntidad(defaultLines);
        }
    },

    parseTiposEntidadFromObject(objList) {
        tiposEntidadDb = objList;
        MODULES = {};
        tiposEntidadDb.forEach(t => {
            MODULES[t.id_tipo] = {
                title: t.nombre,
                prefix: t.id_tipo,
                level: t.nivel,
                category: t.categoria,
                subCategory: t.subCategoria,
                icono: t.icono,
                tiposHijo: t.tipos_hijo_permitidos,
                maxCount: t.max_count_per_parent
            };
        });
        this.renderMainMenu();
        localStorage.setItem('tipos_entidad_db', JSON.stringify(tiposEntidadDb));
    },

    parseTiposEntidad(lines) {
        tiposEntidadDb = lines.map(line => {
            const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
            return {
                id_tipo: vals[0],
                nombre: vals[1],
                categoria: vals[2],
                subCategoria: vals[3] || '',
                nivel: vals[4],
                icono: vals[5] || '',
                tipos_hijo_permitidos: vals[6] ? JSON.parse(vals[6]) : [],
                max_count_per_parent: vals[7] ? parseInt(vals[7]) : null
            };
        });

        // Reconstruir el objeto MODULES global para compatibilidad
        this.parseTiposEntidadFromObject(tiposEntidadDb);
    },

    renderMainMenu() {
        const container = document.getElementById('dynamic-menu-modules');
        if (!container) return;
        container.innerHTML = '';

        // Solo mostrar en el menú principal los de Nivel 1 (L1 y L1B) o que sean Entornos Operativos (LUGAR, PSET)
        tiposEntidadDb.filter(t => t.nivel.startsWith('L1') && (t.categoria === 'LUGAR' || t.categoria === 'PSET')).forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'module-btn';
            btn.onclick = () => this.openModule(t.id_tipo);
            
            let iconHtml = '';
            if (t.icono && t.icono.startsWith('#')) {
                iconHtml = `<svg class="module-icon-svg"><use href="${t.icono}"></use></svg>`;
            } else if (t.icono) {
                iconHtml = `<span style="margin-right:8px">${t.icono}</span>`;
            }
            
            btn.innerHTML = `${iconHtml} ${t.nombre}`;
            container.appendChild(btn);
        });
    },

    // Mini-parsers para el array de strings crudos que nos manda el servidor
    parseCSV(lines) {
        let parsedDb = lines.map(line => {
            const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, ''));

            if (vals.length <= 8) {
                const modCfg = MODULES[vals[1]] || {};
                return {
                    id: vals[0],
                    level: modCfg.level || 'L1',
                    category: modCfg.category || 'LUGAR',
                    subCategory: modCfg.subCategory || '',
                    type: vals[1],
                    code: vals[2],
                    name: vals[3],
                    location: '', canal: '', parentId: null,
                    isActive: vals[4] === 'true',
                    deletedAt: vals[5] && vals[5] !== 'null' && vals[5] !== '""' ? vals[5] : null,
                    deletedBy: '',
                    createdAt: vals[6],
                    createdBy: 'SYSTEM_MIGRATION',
                    updatedAt: vals[7],
                    updatedBy: 'SYSTEM_MIGRATION'
                };
            } else {
                return {
                    id: vals[0],
                    level: vals[1] || 'L1',
                    category: vals[2] || 'LUGAR',
                    subCategory: vals[3] || '',
                    type: vals[4],
                    code: vals[5],
                    name: vals[6],
                    location: vals[7] || '',
                    canal: vals[8] || '',
                    parentId: vals[9] && vals[9] !== 'null' ? vals[9] : null,
                    isActive: vals[10] === 'true',
                    deletedAt: vals[11] && vals[11] !== 'null' && vals[11] !== '""' ? vals[11] : null,
                    deletedBy: vals[12] || '',
                    createdAt: vals[13],
                    createdBy: vals[14] || '',
                    updatedAt: vals[15],
                    updatedBy: vals[16] || ''
                };
            }
        }).filter(r => r && r.id);

        // Pasada de Inferencia de parentId para esquema antiguo
        parsedDb.forEach(r => {
            if (r.parentId === null && r.level === 'L2') {
                // Inferir desde el código. Ej: O-001.01 -> O-001
                const parts = r.code.split('.');
                if (parts.length > 1) {
                    const parentCode = parts[0];
                    const parent = parsedDb.find(p => p.code === parentCode && p.level === 'L1');
                    if (parent) {
                        r.parentId = parent.id;
                    }
                }
            }
        });
        
        return parsedDb;
    },
    parseCSVDefs(lines) {
        return lines.map(line => {
            const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
            return {
                id_pset: vals[0], behavior: vals[1],
                appliesTo: vals[2] ? JSON.parse(vals[2]) : [],
                properties: vals[3] ? JSON.parse(vals[3]) : []
            };
        });
    },
    parseCSVVals(lines) {
        const obj = {};
        lines.forEach(line => {
            const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
            const key = `${vals[0]}_${vals[1]}`;
            obj[key] = vals[2] ? JSON.parse(vals[2]) : {};
        });
        return obj;
    },
    parseCSVDyns(lines) {
        return lines.map(line => {
            const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
            return {
                id_record: vals[0], id_entity: vals[1], id_pset: vals[2], timestamp: vals[3],
                data: vals[4] ? JSON.parse(vals[4]) : {}
            };
        });
    },

    async saveDb() {
        // Enviar TODA la DB al Servidor para el CSV
        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    db: this.db,
                    psets_def: this.psets_def,
                    psetValuesDb: this.psetValuesDb,
                    psetHistoryDb: this.psetHistoryDb,
                    tiposEntidadDb: tiposEntidadDb
                })
            });
        } catch (e) {
            console.error("Error guardando en el servidor.", e);
        }

        // Mantener Backup Local por si acaso
        localStorage.setItem(DB_KEY, JSON.stringify(this.db));
        localStorage.setItem('psets_def_db', JSON.stringify(this.psets_def));
        localStorage.setItem('psets_val_db', JSON.stringify(this.psetValuesDb));
        localStorage.setItem('psets_dyn_db', JSON.stringify(this.psetHistoryDb));
        localStorage.setItem('tipos_entidad_db', JSON.stringify(tiposEntidadDb));
    },

    // -- NAVEGACIÓN Y LOGIN --
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    },
    login() {
        // Mock simple de profesionalidad
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        if (u && p) this.showScreen('menu-screen');
        else alert('Por favor introduzca credenciales.');
    },
    magicLogin() {
        this.showScreen('menu-screen');
    },
    logout() {
        if (confirm("Va a salir de la aplicación. Esto intentará cerrar la pestaña del navegador. ¿Continuar?")) {
            window.close(); // Solicitado: Salir es Salir. (Nota: algunos navegadores bloquean el cierre si no fue abierto por script)

            // Fallback si el navegador bloquea window.close()
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            this.currentModule = null;
            this.showScreen('login-screen');
        }
    },
    goHome() {
        this.currentModule = null;
        this.showScreen('menu-screen');
    },

    // -- GESTIÓN DEL MÓDULO (ENTIDAD) --
    openModule(type) {
        // Guardar estado del módulo anterior si existe
        if (this.currentModule) {
            this.moduleStates[this.currentModule] = {
                filters: { ...this.filters },
                sortCol: this.sortCol,
                sortAsc: this.sortAsc,
                searchTerm: document.getElementById('search-input') ? document.getElementById('search-input').value : ''
            };
        }

        this.currentModule = type;

        // Restaurar o inicializar estado
        const savedState = this.moduleStates[type];
        if (savedState) {
            this.filters = { ...savedState.filters };
            this.sortCol = savedState.sortCol;
            this.sortAsc = savedState.sortAsc;
            document.getElementById('search-input').value = savedState.searchTerm;
        } else {
            this.filters = { active: true, inactive: false, deleted: false };
            this.sortCol = 'name';
            this.sortAsc = true;
            document.getElementById('search-input').value = '';
        }

        this.updateFilterButtons();
        document.getElementById('entity-title').innerText = MODULES[type].title;

        // Configurar Layout 
        const entityContainer = document.querySelector('.entity-container');
        const mainTable = document.getElementById('main-table-container');
        const pstDual = document.getElementById('pst-dual-container');

        if (type === 'PST') {
            entityContainer.classList.remove('has-sidebar');
            mainTable.classList.add('hidden');
            const childTable = document.getElementById('child-table-container');
            if(childTable) childTable.classList.add('hidden');
            pstDual.classList.remove('hidden');
            document.querySelector('.toolbar.card').classList.add('hidden');
        } else {
            entityContainer.classList.add('has-sidebar');
            mainTable.classList.remove('hidden');
            const childTable = document.getElementById('child-table-container');
            if(childTable) childTable.classList.add('hidden'); // Always hide child table initially
            pstDual.classList.add('hidden');
            document.querySelector('.toolbar.card').classList.remove('hidden');
        }

        this.showScreen('entity-screen');
        this.renderTable();
    },

    // -- TABLA, FILTROS TOGGLE Y BÚSQUEDA --
    toggleFilter(filterType) {
        // Toggle behavior
        this.filters[filterType] = !this.filters[filterType];
        this.updateFilterButtons();
        // Memoria de Escena Total (Iteración 8.1)
        if (this.currentModule) {
            this.moduleStates[this.currentModule] = {
                filters: { ...this.filters },
                sortCol: this.sortCol,
                sortAsc: this.sortAsc,
                searchTerm: document.getElementById('search-input').value
            };
        }
        this.filterTable();
    },
    updateFilterButtons() {
        document.querySelectorAll('.toolbar .filter-btn').forEach(btn => {
            const isToggled = this.filters[btn.dataset.filter];
            if (isToggled) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    renderTable(searchTerm = '') {
        if (this.currentModule === 'PST') {
            this.renderPstDual();
            return;
        }

        const tbody = document.getElementById('table-body');
        const emptyState = document.getElementById('empty-state');
        tbody.innerHTML = '';

        // -- Lógica Maestro-Representante (Iteración 8.2) --
        // Primero agrupamos por CODE y nos quedamos con el más reciente de cada uno
        const masterMap = new Map();
        this.db.forEach(r => {
            if (r.type !== this.currentModule) return;
            const existing = masterMap.get(r.code);
            if (!existing || r.createdAt > existing.createdAt) {
                masterMap.set(r.code, r);
            }
        });

        const records = Array.from(masterMap.values()).filter(r => {
            // "Al pulsar activo se ven los activos no archivados"
            // "Al pulsar inactivo se ven los inactivos no archivados"
            // "Al pulsar archivado se ve el resto"
            let passState = false;
            if (r.deletedAt === null) {
                if (this.filters.active && r.isActive) passState = true;
                if (this.filters.inactive && !r.isActive) passState = true;
            } else {
                if (this.filters.deleted) passState = true;
            }

            if (!passState) return false;

            const matchSearch = r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchSearch;
        });

        if (records.length === 0) {
            emptyState.classList.remove('hidden');
            document.querySelector('#data-table').classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            document.querySelector('#data-table').classList.remove('hidden');

            // Ordenar según estado
            records.sort((a, b) => {
                let vA = a[this.sortCol];
                let vB = b[this.sortCol]; // Fix
                if (this.sortCol === 'date') { vA = a.createdAt; vB = b.createdAt; }

                if (!vA) vA = '';
                if (!vB) vB = '';

                if (vA < vB) return this.sortAsc ? -1 : 1;
                if (vA > vB) return this.sortAsc ? 1 : -1;
                return 0;
            }).forEach(r => {
                const tr = document.createElement('tr');
                tr.dataset.id = r.id;
                tr.className = 'master-row'; // Clase para control de clic

                let rowColorMaster = '#000'; // Activo
                let statusIconMaster = '✓';
                let statusWeightMaster = 1; // Para ordenación

                if (r.deletedAt !== null) {
                    rowColorMaster = '#ccc'; // Borrado
                    statusIconMaster = '🗑';
                    statusWeightMaster = 3;
                } else if (!r.isActive) {
                    rowColorMaster = '#777'; // Inactivo
                    statusIconMaster = '✗';
                    statusWeightMaster = 2;
                }
                tr.style.color = rowColorMaster;

                let accionesHTML = '';
                if (r.deletedAt === null) {
                    accionesHTML = `
                        <button class="action-btn edit-btn" onclick="app.openModal('${r.id}')">Editar</button>
                        <button class="action-btn delete-btn" onclick="app.deleteRecord('${r.id}')">Archivar</button>
                    `;
                } else {
                    accionesHTML = `<button class="action-btn" style="color:#ff00ff; font-weight:bold;" onclick="app.restoreRecord('${r.id}')">Restaurar</button>`;
                }

                tr.innerHTML = `
                    <td><strong>${r.code}</strong></td>
                    <td>${r.name}</td>
                    <td class="status-col" style="font-size:1.1rem;" data-weight="${statusWeightMaster}">${statusIconMaster}</td>
                    <td class="actions-col">
                        ${accionesHTML}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        // Resizers
        this.createResizableColumns(document.getElementById('data-table'));
        this.updateSortIterface('data-table');
        this.attachRowSelection();
    },

    renderSubTable(parentId) {
        this.currentParentId = parentId; // Guardar para cuando se añaden nuevas delegaciones
        const tbody = document.getElementById('child-table-body');
        const emptyState = document.getElementById('child-empty-state');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        // --- LOGICA MAESTRO PARA DELEGACIONES ---
        const masterMap = new Map();
        
        this.db.forEach((r) => {
            if (r.parentId !== parentId) return;
            if (r.category !== 'DELEGACION' && r.level !== 'L2') return;

            const existing = masterMap.get(r.code);
            if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
                masterMap.set(r.code, r);
            }
        });
        
        const f = this.delegationFilters;
        const children = Array.from(masterMap.values()).filter(c => {
            const isArchived = c.deletedAt !== null;
            if (isArchived) return f.deleted;
            if (c.isActive) return f.active;
            return f.inactive;
        });

        // Configurar botones de filtro locales
        const btnClass = (key) => `btn-icon-only filter-btn ${this.delegationFilters[key] ? 'active' : ''}`;
        document.getElementById('child-filter-active').className = btnClass('active');
        document.getElementById('child-filter-inactive').className = btnClass('inactive');
        document.getElementById('child-filter-deleted').className = btnClass('deleted');
        
        // Actualizar acción del botón crear nuevo
        document.getElementById('btn-new-delegation').onclick = () => app.openDelegationCreator(parentId);

        if (children.length === 0) {
            emptyState.innerHTML = 'No hay delegaciones para este registro.';
            emptyState.classList.remove('hidden');
            document.getElementById('child-data-table').classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            document.getElementById('child-data-table').classList.remove('hidden');

            children.forEach(c => {
                const mod = MODULES[c.type] || { title: c.type };
                let statusIcon = '✓';
                let rowColor = '#333';
                if (c.deletedAt) { statusIcon = '🗑'; rowColor = '#ccc'; }
                else if (!c.isActive) { statusIcon = '✗'; rowColor = '#999'; }

                let acciones = '';
                if (!c.deletedAt) {
                    acciones = `
                        <button class="btn-icon-sm edit-btn" onclick="app.openModal('${c.id}')" title="Editar">✏️</button>
                        <button class="btn-icon-sm delete-btn" style="color:var(--danger);" onclick="app.deleteRecord('${c.id}')" title="Archivar">🗑</button>
                    `;
                } else {
                    acciones = `
                        <button class="btn-icon-sm" style="color:magenta; font-weight:bold;" onclick="app.restoreRecord('${c.id}')" title="Restaurar">♻️</button>
                    `;
                }

                const tr = document.createElement('tr');
                tr.style.color = rowColor;
                tr.className = 'sub-delegation-row';
                tr.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    app.selectSubRow(c.id, tr, parentId);
                };

                tr.innerHTML = `
                    <td style="text-align:center; font-size:14px;">${statusIcon}</td>
                    <td><span class="badge">${mod.title}</span></td>
                    <td><strong>${c.code}</strong></td>
                    <td>${c.name}</td>
                    <td>${c.location || '-'}</td>
                    <td>${c.canal || '-'}</td>
                    <td class="actions-col">
                        ${acciones}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    // Logic for accordion removed around here.

    selectSubRow(childId, rowEl, parentId) {
        // Desmarcar otras delegaciones
        document.querySelectorAll('.sub-delegation-row').forEach(tr => {
            tr.classList.remove('selected');
        });

        // Marcar esta sub-fila
        rowEl.classList.add('selected');

        // Cargar propiedades en el panel lateral
        this.loadSideProperties(childId);
    },


    toggleDelegationFilter(key) {
        this.delegationFilters[key] = !this.delegationFilters[key];
        if (this.currentParentId) {
            this.renderSubTable(this.currentParentId);
        }
    },


    togglePstFilter(behavior, filterKey) {
        this.pstFilters[behavior][filterKey] = !this.pstFilters[behavior][filterKey];
        const btn = document.querySelector(`.pst-column button[data-filter="${filterKey}"][data-type="${behavior}"]`);
        if (btn) btn.classList.toggle('active', this.pstFilters[behavior][filterKey]);
        this.renderPstDual();
    },
    filterPst(behavior) {
        const val = document.getElementById(`pst-search-${behavior}`).value;
        this.pstSearch[behavior] = val;
        this.renderPstDual();
    },

    restoreRecord(id) {
        const record = this.db.find(x => x.id === id);
        if (!record) return;

        // --- VALIDACIÓN DE DUPLICADOS ACTIVOS ---
        const dupe = this.db.find(r => r.id !== id && r.code === record.code && r.type === record.type && r.deletedAt === null);
        if (dupe) {
            alert(`⚠️ ERROR DE RESTAURACIÓN: No se puede restaurar '${record.code}' porque ya existe otro registro activo con el mismo código.\n\nCambie el código del registro activo o del archivado antes de continuar.`);
            return;
        }

        // Limpiar el campo deletedAt y actualizar la fecha de modificación
        record.deletedAt = null;
        record.deletedBy = '';
        record.updatedAt = new Date().toISOString();
        record.updatedBy = 'USER';

        this.saveDb();
        this.renderTable();

        alert(`Registro '${record.code}' restaurado correctamente.`);
    },
    attachRowSelection() {
        const trs = document.querySelectorAll('#table-body tr.master-row');
        trs.forEach(tr => {
            tr.addEventListener('click', (e) => {
                const isButton = e.target.closest('button');
                if (!isButton) {
                    trs.forEach(x => x.style.backgroundColor = '');
                    tr.style.backgroundColor = '#e8f0fe';

                    const id = tr.dataset.id;
                    const modCfg = MODULES[this.currentModule] || {};

                    if (modCfg.tiposHijo && modCfg.tiposHijo.length > 0) {
                        document.getElementById('child-table-container').classList.remove('hidden');
                        this.renderSubTable(id);
                    } else {
                        document.getElementById('child-table-container').classList.add('hidden');
                    }

                    this.loadSideProperties(id);
                }
            });
        });
    },

    refreshSubRows() {
        if (this.currentParentId) {
            this.renderSubTable(this.currentParentId);
        }
    },
    filterTable() {
        const val = document.getElementById('search-input').value;
        // Memoria de Escena Total (Iteración 8.1)
        if (this.currentModule) {
            this.moduleStates[this.currentModule] = {
                filters: { ...this.filters },
                sortCol: this.sortCol,
                sortAsc: this.sortAsc,
                searchTerm: val
            };
        }
        this.renderTable(val);
    },

    renderPstDual() {
        const estBody = document.getElementById('pst-body-ESTATICO');
        const dinBody = document.getElementById('pst-body-DINAMICO');
        if (!estBody || !dinBody) return;
        estBody.innerHTML = '';
        dinBody.innerHTML = '';

        const processRecords = (behavior) => {
            const searchVal = (this.pstSearch[behavior] || '').toLowerCase();
            const filters = this.pstFilters[behavior];

            // --- LOGICA MAESTRO EN PST (Iteración 8.3) ---
            const masterMap = new Map();
            this.db.forEach(r => {
                if (r.type !== 'PST') return;
                const def = this.psets_def.find(d => d.id_pset === r.id);
                if (!def || def.behavior !== behavior) return;

                const existing = masterMap.get(r.code);
                if (!existing || r.createdAt > existing.createdAt) {
                    masterMap.set(r.code, r);
                }
            });

            return Array.from(masterMap.values()).filter(r => {
                let passState = false;
                if (r.deletedAt === null) {
                    if (filters.active && r.isActive) passState = true;
                    if (filters.inactive && !r.isActive) passState = true;
                } else {
                    if (filters.deleted) passState = true;
                }
                if (!passState) return false;

                return r.code.toLowerCase().includes(searchVal) || r.name.toLowerCase().includes(searchVal);
            });
        };

        const renderPstRow = (r, behavior, tbody) => {
            const tr = document.createElement('tr');
            tr.dataset.id = r.id;

            let statusIcon = '✓';
            let rowColor = '#000';
            if (r.deletedAt !== null) {
                rowColor = '#ccc';
                statusIcon = '🗑';
            } else if (!r.isActive) {
                rowColor = '#777';
                statusIcon = '✗';
            }
            tr.style.color = rowColor;

            tr.onclick = (e) => {
                if (e.target.tagName === 'BUTTON') return;
                app.togglePstRowExpand(r.id);
            };

            let accionesHTML = '';
            if (r.deletedAt === null) {
                accionesHTML = `
                    <button class="action-btn edit-btn" onclick="app.openModal('${r.id}')">Editar</button>
                    <button class="action-btn delete-btn" onclick="app.deleteRecord('${r.id}')">Archivar</button>
                `;
            } else {
                accionesHTML = `<button class="action-btn" style="color:#ff00ff; font-weight:bold;" onclick="app.restoreRecord('${r.id}')">Restaurar</button>`;
            }

            const isExpanded = this.pstExpandedRows.has(r.id);
            const displayStyle = isExpanded ? 'table-row' : 'none';

            tr.innerHTML = `
                <td><strong>${r.code}</strong></td>
                <td>${r.name}</td>
                <td class="status-col" style="font-size:1.1rem;">${statusIcon}</td>
                <td class="actions-col">${accionesHTML}</td>
            `;
            tbody.appendChild(tr);

            const def = this.psets_def.find(d => d.id_pset === r.id);
            if (def && def.properties.length > 0) {
                const propsHTML = `
                    <tr class="pst-props-row pst-props-${behavior}" id="pst-child-${r.id}" style="display:${displayStyle}; background:#fcfcfc;">
                        <td colspan="4" style="padding: 0; border-bottom:1px solid var(--border-color);">
                            <div style="padding-left: 24px; border-left: 3px solid var(--primary); margin: 8px;">
                                <table style="width:100%; font-size:11px; border-collapse:collapse; margin-bottom:0; table-layout:fixed;">
                                    <tbody>
                                        ${def.properties.map(p => `<tr><td class="pst-prop-name" style="border:none; border-bottom:1px solid #eee; padding:2px 8px;">${p.name}</td><td class="pst-prop-type" style="border:none; border-bottom:1px solid #eee; padding:2px 8px; color:var(--text-muted);">${p.type}</td></tr>`).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                `;
                const temp = document.createElement('tbody');
                temp.innerHTML = propsHTML;
                tbody.appendChild(temp.firstElementChild);
            } else {
                const emptyRow = document.createElement('tr');
                emptyRow.className = `pst-props-row pst-props-${behavior}`;
                emptyRow.id = `pst-child-${r.id}`;
                emptyRow.style.display = displayStyle;
                emptyRow.innerHTML = `<td colspan="4" style="padding: 4px 24px; color:#999; font-style:italic;">Sin propiedades.</td>`;
                tbody.appendChild(emptyRow);
            }
        };

        processRecords('ESTATICO').forEach(r => renderPstRow(r, 'ESTATICO', estBody));
        processRecords('DINAMICO').forEach(r => renderPstRow(r, 'DINAMICO', dinBody));
    },


    togglePstExpand(behavior, expand) {
        // Togglear el display de todas las subfilas de una categoría
        const rows = document.querySelectorAll(`.pst-props-${behavior}`);
        if (rows.length === 0) return;

        rows.forEach(r => {
            r.style.display = expand ? 'table-row' : 'none';
            // Sync state
            const id = r.id.replace('pst-child-', '');
            if (expand) this.pstExpandedRows.add(id);
            else this.pstExpandedRows.delete(id);
        });
    },

    togglePstRowExpand(id) {
        const row = document.getElementById(`pst-child-${id}`);
        if (!row) return;

        if (row.style.display === 'none') {
            row.style.display = 'table-row';
            this.pstExpandedRows.add(id);
        } else {
            row.style.display = 'none';
            this.pstExpandedRows.delete(id);
        }
    },

    // -- IMPORT / EXPORT CSV LOCALIZADO (MÓDULO) --
    downloadTemplateCSV() {
        if (!this.currentModule) return;
        // Plantilla solo con campos humanos separada por punto y coma
        const fields = ['code', 'name', 'isActive'];
        const header = fields.join(';');
        const blob = new Blob([header + '\n'], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantilla_carga_${MODULES[this.currentModule].prefix}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    exportModuleCSV(behavior = null) { // behavior solo para PST
        const targetType = this.currentModule;
        if (!targetType) return;

        // --- LOGICA MAESTRO (Iteración 8.2) ---
        // Agrupar por CODE y quedarse solo con el más reciente
        const masterMap = new Map();
        this.db.forEach(r => {
            if (r.type !== targetType) return;

            // Si es PST, filtrar por comportamiento (ESTATICO/DINAMICO)
            if (targetType === 'PST' && behavior) {
                const def = this.psets_def.find(d => d.id_pset === r.id);
                if (!def || def.behavior !== behavior) return;
            }

            const existing = masterMap.get(r.code);
            if (!existing || r.createdAt > existing.createdAt) {
                masterMap.set(r.code, r);
            }
        });

        const records = Array.from(masterMap.values());
        if (records.length === 0) { alert('No hay datos maestros para exportar.'); return; }

        // Definimos Cabeceras Estándar
        const fields = ['id', 'type', 'code', 'name', 'isActive', 'deletedAt', 'createdAt', 'updatedAt'];
        const header = fields.join(';');

        // Limpiamos strings de comas, punto y comas o saltos para el CSV
        const escapeCSV = (str) => {
            if (str === null || str === undefined) return '""';
            const s = String(str);
            if (s.includes(';') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };

        const rows = records.map(r => fields.map(f => escapeCSV(r[f])).join(';'));
        const csv = [header, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = MODULES[this.currentModule].title.replace(/\s+/g, '_').toLowerCase();
        a.download = `export_${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    importModuleCSV(e) {
        if (!this.currentModule) return;
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/);

            if (lines.length < 1) return;

            // Extraer y mapear cabeceras. Split por punto y coma.
            const headers = lines[0].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.toLowerCase().trim().replace(/(^"|"$)/g, ''));
            const idxCode = headers.indexOf('code');
            const idxName = headers.indexOf('name');
            const idxId = headers.indexOf('id');
            const idxType = headers.indexOf('type');
            const idxIsActive = headers.indexOf('isactive');
            const idxDeletedAt = headers.indexOf('deletedat');
            const idxCreatedAt = headers.indexOf('createdat');
            const idxUpdatedAt = headers.indexOf('updatedat');

            if (idxCode === -1) {
                alert("Error: El archivo CSV debe contener al menos la columna 'code' en la cabecera.");
                return;
            }

            let added = 0;
            let updated = 0;
            let skipped = 0;

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                // Parse CSV simple por punto y coma
                const vals = lines[i].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, ''));

                const code = vals[idxCode] ? vals[idxCode].trim() : '';
                if (!code) { skipped++; continue; } // Código es estricto

                // Extraer resto basándonos en si la columna existe en el CSV
                const csvId = idxId > -1 ? (vals[idxId] || '').trim() : '';
                const type = (idxType > -1 && vals[idxType]) ? vals[idxType].trim() : this.currentModule;
                const name = (idxName > -1 && vals[idxName]) ? vals[idxName].trim() : 'Sin Nombre';

                if (type !== this.currentModule) { skipped++; continue; } // Ignorar de otros módulos

                let isActive = true;
                if (idxIsActive > -1 && vals[idxIsActive] !== undefined) {
                    const actVal = vals[idxIsActive].trim().toLowerCase();
                    isActive = (actVal === 'true' || actVal === '1' || actVal === 'activo' || actVal === 'si' || actVal === 'sí');
                }

                const deletedAt = (idxDeletedAt > -1 && vals[idxDeletedAt] && vals[idxDeletedAt].trim() !== 'null') ? vals[idxDeletedAt].trim() : null;
                const createdAt = (idxCreatedAt > -1 && vals[idxCreatedAt]) ? vals[idxCreatedAt].trim() : new Date().toISOString();
                const updatedAt = (idxUpdatedAt > -1 && vals[idxUpdatedAt]) ? vals[idxUpdatedAt].trim() : new Date().toISOString();

                // Buscar si ya existe por CODE
                const existingRecordMsg = this.db.find(r => r.code === code && r.type === this.currentModule);

                if (existingRecordMsg) {
                    // Existe -> Actualizar (Upsert) ignorando lo que no venga en el excel
                    if (idxName > -1) existingRecordMsg.name = name;
                    if (idxIsActive > -1) existingRecordMsg.isActive = isActive;
                    if (idxDeletedAt > -1) existingRecordMsg.deletedAt = deletedAt;
                    existingRecordMsg.updatedAt = new Date().toISOString();
                    updated++;
                } else {
                    // No existe -> Crear Nuevo (auto-generar IDs si faltan)
                    const newId = csvId || (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + Math.random());
                    this.db.push({
                        id: newId,
                        type,
                        code,
                        name,
                        isActive,
                        deletedAt,
                        createdAt,
                        updatedAt
                    });
                    added++;
                }
            }

            this.saveDb();
            this.filterTable();
            document.getElementById('module-csv-upload').value = ''; // Reset file input

            alert(`Carga Masiva Procesada:\n\n- Registros Nuevos: ${added}\n- Registros Actualizados: ${updated}\n- Filas Omitidas/Error: ${skipped}`);
        };
        reader.readAsText(file);
    },

    // -- MODALES (CREAR/EDITAR ENTIDAD) --
    openModal(id = null, fixedType = null) {
        if (this.currentModule === 'PST') {
            // Si el botón pasó 'PST' como ID (desde la vista dual), significa 'Crear Nuevo'
            const actualId = (id === 'PST') ? null : id;
            this.openPSetModal(actualId);
            
            // Si estuviéramos guardando el behavior para el nuevo PSet, lo asignaríamos aquí
            if (actualId === null && behavior) {
                setTimeout(() => {
                    document.getElementById('pset-modal-behavior').value = behavior; // Forzar ESTATICO o DINAMICO
                }, 100);
            }
            return;
        }

        document.getElementById('modal-backdrop').classList.remove('hidden');
        const titleEl = document.getElementById('modal-title');
        const idInput = document.getElementById('modal-id');
        const parentIdInput = document.getElementById('modal-parent-id');
        const typeSelect = document.getElementById('modal-type');
        const codeInput = document.getElementById('modal-code');
        const nameInput = document.getElementById('modal-name');
        const locationInput = document.getElementById('modal-location');
        const canalInput = document.getElementById('modal-canal');
        const activeInput = document.getElementById('modal-active');

        // Configuración de visibilidad inicial
        parentIdInput.value = '';

        // Si id es un objeto, es una creación especial (ej: bajo un padre)
        let isCreationUnderParent = false;
        let parentId = null;
        if (typeof id === 'object' && id !== null) {
            isCreationUnderParent = true;
            parentId = id.parentId;
            id = null; // Reset para que entre en lógica de "Create"
        }

        if (id) {
            const record = this.db.find(r => r.id === id);
            titleEl.innerText = 'Editar Registro';
            idInput.value = record.id;
            parentIdInput.value = record.parentId || '';

            // En edición no dejamos cambiar el tipo por ahora (seguridad estructural)
            typeSelect.innerHTML = `<option value="${record.type}">${MODULES[record.type].title}</option>`;
            typeSelect.disabled = true;

            codeInput.value = record.code;
            nameInput.value = record.name;
            locationInput.value = record.location || '';
            canalInput.value = record.canal || '';
            activeInput.checked = record.isActive;

            this.updateModalVisibility(record.type);
        } else {
            titleEl.innerText = 'Crear Registro';
            idInput.value = '';
            typeSelect.disabled = false;

            if (isCreationUnderParent) {
                parentIdInput.value = parentId;
                titleEl.innerText = 'Añadir Hija';
                this.populateTypeSelectDynamic('HIJOS', parentId);
            } else {
                this.populateTypeSelectDynamic('RAIZ');
            }

            codeInput.value = '';
            nameInput.value = '';
            locationInput.value = '';
            canalInput.value = '';
            activeInput.checked = true;

            this.updateModalVisibility(typeSelect.value);
        }

        // Listener para cambio de tipo dinámico
        typeSelect.onchange = () => this.updateModalVisibility(typeSelect.value);
    },

    populateTypeSelectDynamic(context, parentId = null) {
        const typeSelect = document.getElementById('modal-type');
        typeSelect.innerHTML = '';

        if (context === 'RAIZ') {
            // Solo permitir crear del contexto actual
            if (this.currentModule && this.currentModule !== 'PST') {
                typeSelect.innerHTML = `<option value="${this.currentModule}">${MODULES[this.currentModule].title}</option>`;
            } else {
                typeSelect.innerHTML = `<option value="">-- No configurado --</option>`;
                typeSelect.disabled = true;
            }
        } else if (context === 'HIJOS' && parentId) {
            const parentRecord = this.db.find(r => r.id === parentId);
            if (!parentRecord) return;
            
            const parentConfig = MODULES[parentRecord.type];
            if (!parentConfig || !parentConfig.tiposHijo || parentConfig.tiposHijo.length === 0) {
                typeSelect.innerHTML = '<option value="">(No admite hijos)</option>';
                typeSelect.disabled = true;
                return;
            }

            // Agrupar los tipos de hijos por categoría para mostrar secciones
            const allowList = parentConfig.tiposHijo;
            const groups = {};
            
            allowList.forEach(childType => {
                const cfg = MODULES[childType];
                if (cfg) {
                    const gName = cfg.subCategory || 'Opciones';
                    if (!groups[gName]) groups[gName] = [];
                    groups[gName].push({ id: childType, title: cfg.title });
                }
            });

            for (const [gName, items] of Object.entries(groups)) {
                if (Object.keys(groups).length > 1) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = gName;
                    items.forEach(item => {
                        const opt = document.createElement('option');
                        opt.value = item.id; opt.innerText = item.title;
                        optgroup.appendChild(opt);
                    });
                    typeSelect.appendChild(optgroup);
                } else {
                    items.forEach(item => {
                        const opt = document.createElement('option');
                        opt.value = item.id; opt.innerText = item.title;
                        typeSelect.appendChild(opt);
                    });
                }
            }
        }
    },

    updateModalVisibility(type) {
        const modCfg = MODULES[type] || {};
        const isDelegation = modCfg.category === 'DELEGACION';

        document.getElementById('modal-location-group').style.display = isDelegation ? 'block' : 'none';
        document.getElementById('modal-canal-group').style.display = (isDelegation && (modCfg.subCategory === 'ALMACEN' || modCfg.subCategory === 'MAQUINARIA')) ? 'block' : 'none';
    },

    openDelegationCreator(parentId) {
        this.openModal({ parentId: parentId });
    },

    closeModal() {
        document.getElementById('modal-backdrop').classList.add('hidden');
    },

    // -- CRUD LÓGICA CORE --
    saveRecord() {
        const id = document.getElementById('modal-id').value;
        const parentId = document.getElementById('modal-parent-id').value;
        const type = document.getElementById('modal-type').value;
        const code = document.getElementById('modal-code').value.trim();
        const name = document.getElementById('modal-name').value.trim();
        const location = document.getElementById('modal-location').value.trim();
        const canal = document.getElementById('modal-canal').value.trim();
        const isActive = document.getElementById('modal-active').checked;
        const now = new Date().toISOString();

        if (!code || !name) {
            alert("Código y Nombre son obligatorios.");
            return;
        }

        if (code.length > 12) {
            alert("El código no puede exceder los 12 caracteres.");
            return;
        }

        if (id) {
            // Update
            const idx = this.db.findIndex(r => r.id === id);
            if (idx > -1) {
                // Validación estricta de código único POR TIPO
                const dupe = this.db.find(r => r.code === code && r.type === type && r.id !== id && r.deletedAt === null);
                if (dupe) { alert(`El código '${code}' ya existe en el módulo actual. Nombres únicos requeridos por módulo.`); return; }

                this.db[idx].code = code;
                this.db[idx].name = name;
                this.db[idx].location = location;
                this.db[idx].canal = canal;
                this.db[idx].isActive = isActive;
                this.db[idx].updatedAt = now;
                this.db[idx].updatedBy = 'USER'; // Mock de usuario

                // Estos campos se mantienen o se actualizan según lógica
                if (this.db[idx].category === 'DELEGACION') {
                    // Si implementamos campos en el modal luego, se asignarían aquí
                }
            }
        } else {
            // Create
            const dupe = this.db.find(r => r.code === code && r.type === type && r.deletedAt === null);
            if (dupe) { alert(`El código '${code}' ya existe en el módulo actual. Use otro código único.`); return; }

            const typeConfig = MODULES[type];
            if (!typeConfig) { alert("Error crítico: Tipo de entidad desconocido."); return; }

            // --- VALIDACIÓN DE LÍMITES POR PADRE (EJ: SOLO UN PRINCIPAL) ---
            if (parentId && typeConfig.maxCount) {
                 let activeCount = 0;
                 const masterMap = new Map();
                 this.db.forEach((r) => {
                     if (r.parentId === parentId && r.type === type) {
                         const existing = masterMap.get(r.code);
                         if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
                             masterMap.set(r.code, r);
                         }
                     }
                 });
                 
                 masterMap.forEach(r => {
                     if (r.deletedAt === null) activeCount++;
                 });

                 if (activeCount >= typeConfig.maxCount) {
                     alert(`⚠️ LÍMITE ALCANZADO: Este registro padre solo admite un máximo de ${typeConfig.maxCount} registro(s) activo(s) del tipo '${typeConfig.title}'.\n\nPuede archivar el existente antes de intentar añadir uno nuevo.`);
                     return;
                 }
            }

            // ID más robusto (UUID con fallback random)
            const newId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

            // Inyección de METADATOS estructurales según el módulo seleccionado
            const modCfg = MODULES[type] || {};

            this.db.push({
                id: newId,
                level: modCfg.level || 'L1',
                category: modCfg.category || 'LUGAR',
                subCategory: modCfg.subCategory || '',
                type: type,
                code: code,
                name: name,
                location: location,
                canal: canal,
                parentId: parentId || null,
                isActive: isActive,
                deletedAt: null,
                deletedBy: '',
                createdAt: now,
                createdBy: 'USER', // Mock
                updatedAt: now,
                updatedBy: 'USER'  // Mock
            });

            // --- AUTO-CREACIÓN DE DELEGACIÓN PRINCIPAL (Fase 2) ---
            if (modCfg.category === 'LUGAR') {
                const prlId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'prl-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

                // Generar código PRL de max 12 caracteres: "P-" + 10 chars finales del código original
                // Si el código original es corto, se usa entero. Si es largo, se trunca el final.
                let cleanCode = code.replace(/[^a-zA-Z0-9]/g, '');
                let prlCode = 'P-' + cleanCode.substring(Math.max(0, cleanCode.length - 10)).toUpperCase();

                this.db.push({
                    id: prlId,
                    level: 'L2',
                    category: 'DELEGACION',
                    subCategory: 'ALMACEN',
                    type: 'PRL',
                    code: prlCode,
                    name: 'Principal - ' + name,
                    location: location || 'Sede Central/Obra',
                    canal: canal || '',
                    parentId: newId,
                    isActive: true,
                    deletedAt: null,
                    deletedBy: '',
                    createdAt: now,
                    createdBy: 'SYSTEM_AUTO',
                    updatedAt: now,
                    updatedBy: 'SYSTEM_AUTO'
                });
                console.log(`✨ Autocreada Delegación Principal para ${code}`);
                // Notificación visual temporal para el usuario
                setTimeout(() => alert(`¡Éxito! Se ha creado el Lugar '${code}' y su Delegación Principal automáticamente.`), 100);

                // Auto-expandir el nuevo lugar para que vea la PRL
                this.expandedRows.add(newId);
            }
        }

        this.saveDb();
        this.closeModal();
        // Change from generic renderTable to filterTable to respect current search AND toggle states
        this.filterTable();
    },
    deleteRecord(id) {
        const record = this.db.find(r => r.id === id);
        if (!record) return;

        // --- REGLAS DE BORRADO (Fase 2) ---
        if (record.type === 'PRL' && record.deletedAt === null) {
            alert(`⚠️ ACCIÓN BLOQUEADA: La Delegación Principal (${record.code}) no se puede archivar de forma independiente.\n\nPara archivarla, debe archivar el LUGAR padre correspondiente.`);
            return;
        }

        const msg = `¿Está seguro de que desea archivar el registro '${record.code}'?${record.category === 'LUGAR' ? '\n\n⚠️ NOTA: Esto archivará también todas sus Delegaciones vinculadas.' : ''}`;

        if (confirm(msg)) {
            const now = new Date().toISOString();
            const idx = this.db.findIndex(r => r.id === id);
            if (idx > -1) {
                // Archivar el principal
                this.db[idx].deletedAt = now;
                this.db[idx].deletedBy = 'USER';

                // --- BORRADO EN CASCADA ---
                if (record.category === 'LUGAR') {
                    let cascadeCount = 0;
                    this.db.forEach(c => {
                        if (c.parentId === id && c.deletedAt === null) {
                            c.deletedAt = now;
                            c.deletedBy = 'SYSTEM_CASCADE';
                            cascadeCount++;
                        }
                    });
                    if (cascadeCount > 0) console.log(`🌊 Borrado en cascada aplicado a ${cascadeCount} delegaciones.`);
                }

                this.saveDb();
                this.filterTable();
            }
        }
    },

    // -- ARQUITECTURA: DICCIONARIO DATOS --
    openDictionary() {
        this.showScreen('dict-screen');
        const cont = document.getElementById('dict-container');
        cont.innerHTML = '';

        this.schemaTables.forEach(t => {
            const card = document.createElement('div');
            card.className = 'dict-card card';

            let rows = t.fields.map(f => `<tr><td><strong>${f.name}</strong></td><td><code>${f.type}</code></td><td>${f.desc}</td></tr>`).join('');

            card.innerHTML = `
                <div class="dict-header">💾 TABLA: ${t.name}</div>
                <div class="dict-body">
                    <table class="dict-table">
                        <thead><tr><th>Campo</th><th>Tipo</th><th>Descripción</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div class="dict-constraints">
                        <strong>Restricciones de Integridad:</strong><br>
                        ${t.constraints.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
            cont.appendChild(card);
        });
    },

    // -- ARQUITECTURA: EXCEL VIEWER --
    openExcelViewer() {
        this.showScreen('excel-screen');
        this.currentExcelTableIdx = 0;
        this.renderExcel();
        this.setupExcelEvents();
    },
    changeExcelTable(dir) {
        this.currentExcelTableIdx += dir;
        if (this.currentExcelTableIdx < 0) this.currentExcelTableIdx = this.schemaTables.length - 1;
        if (this.currentExcelTableIdx >= this.schemaTables.length) this.currentExcelTableIdx = 0;
        this.renderExcel();
    },
    renderExcel() {
        const tableSchema = this.schemaTables[this.currentExcelTableIdx];
        document.getElementById('excel-table-name').innerText = tableSchema.name;

        const thead = document.getElementById('excel-thead');
        const tbody = document.getElementById('excel-tbody');

        // Header
        thead.innerHTML = '<tr>' + tableSchema.fields.map(f => `<th>${f.name}</th>`).join('') + '</tr>';

        // Body (Llenado dinámico referenciando a los arrays en memoria)
        tbody.innerHTML = '';
        let data = [];
        const tableName = tableSchema.name;
        
        if (tableName === 'Directorio_Master_Activos') {
            data = this.db;
        } else if (tableName === 'PSet_Definitions') {
            data = this.psets_def;
        } else if (tableName === 'PSet_Values_Static') {
            // Transformar el objeto de memoria en array tabular
            data = Object.keys(this.psetValuesDb).map(k => {
                const parts = k.split('_');
                return {
                    id_entity: parts[0],
                    id_pset: parts.slice(1).join('_'), // En caso de que haya mas _ 
                    data: this.psetValuesDb[k]
                };
            });
        } else if (tableName === 'PSet_Values_Dynamic') {
            data = this.psetHistoryDb;
        } else if (tableName === 'Tipos_Entidad') {
            data = tiposEntidadDb;
        }

        if (data.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="${tableSchema.fields.length}" style="text-align:center; color: #888;">(Tabla sin registros)</td>`;
            tbody.appendChild(tr);
        }

        data.forEach((record, i) => {
            const tr = document.createElement('tr');

            // Render Rows properties
            tableSchema.fields.forEach(f => {
                let val = record[f.name];
                
                // Mapear casos excepcionales como stringify json
                if (typeof val === 'object' && val !== null) {
                    val = JSON.stringify(val);
                }
                
                const cell = document.createElement('td');
                cell.classList.add('readonly');
                cell.textContent = val !== undefined ? val : '';
                tr.appendChild(cell);
            });

            tbody.appendChild(tr);
        });

        this.createResizableColumns(document.getElementById('excel-table'));
        this.setupTableSorting('excel-table', true);
    },
    setupExcelEvents() {
        // Solo para mantener firma. Eventos eliminados ya que es readonly y tr.ondblclick hace el trabajo.
    },
    exportExcel() {
        if (this.currentExcelTableIdx !== 0) { alert('Solo soportado en Maestro en esta iteración mock.'); return; }

        // CSV gen. para Excel Viewer mock
        const header = this.schemaTables[0].fields.map(f => f.name).join(';');
        const rows = this.db.map(r => this.schemaTables[0].fields.map(f => `"${r[f.name] || ''}"`).join(';'));
        const csv = [header, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maestro_activos_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    },
    importExcel(e) {
        if (this.currentExcelTableIdx !== 0) { alert('Solo soportado en Maestro en esta iteración mock.'); return; }
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            // Un parcer rudimentario CSV para el mock
            const lines = text.split('\n');
            const newDb = [];
            // saltamos cabecera
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                // parse comas ignorando dentro de quotes
                const vals = lines[i].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, ''));
                if (vals.length >= 8) {
                    newDb.push({
                        id: vals[0], type: vals[1], code: vals[2], name: vals[3],
                        isActive: vals[4] === 'true' || vals[4] === '1', deletedAt: vals[5] ? vals[5] : null,
                        createdAt: vals[6], updatedAt: vals[7]
                    });
                }
            }
            if (newDb.length > 0 && confirm(`¿Importar ${newDb.length} registros sobreescribiendo toda la DB?`)) {
                this.db = newDb;
                this.saveDb();
                this.renderExcel();
                document.getElementById('file-upload').value = ''; // reset
            }
        };
        reader.readAsText(file);
    },

    // -- EXPORT / IMPORT MODULOS Y PSETS --
    downloadTemplateCSV(pstType = null) {
        let header = "";
        let fileName = "";
        
        if (!pstType) { 
            // Formato exigido para lugares/entidades (El "Tipo" es implícito por la pantalla actual)
            header = "Codigo;Nombre;Ubicacion;Canal;Activo";
            fileName = `plantilla_${app.currentModule.toLowerCase()}.csv`;
        } else {
            // Reservado para futura iteración PSet
            header = "Entidad_Code;PSet_Code;Propiedad;Valor";
            fileName = `plantilla_psets_${pstType.toLowerCase()}.csv`;
        }
        
        const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    importModuleCSV(e, pstType = null) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            // Parse crudo para analizar headers y lineas vacías
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
            
            if (lines.length < 1) {
                alert("El archivo está vacío.");
                e.target.value = '';
                return;
            }

            if (!pstType) {
                // Validación Estricta de la Cabecera
                const headerLine = lines[0];
                const expectedHeader = "Codigo;Nombre;Ubicacion;Canal;Activo";
                if (headerLine !== expectedHeader) {
                    alert("Datos facilitados sin formato de importación válido. Por favor, descargue la plantilla.");
                    e.target.value = '';
                    return;
                }

                let newCount = 0;
                let autoPrlCount = 0;
                const activeModCode = app.currentModule;
                const modDef = MODULES[activeModCode];
                if (!modDef) {
                    alert("Error crítico: No se ha Detectado el tipo de módulo actual.");
                    return;
                }

                // Parse rows (saltando header)
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // Split por ; explícitamente y limpieza de comillas si hay
                    const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, ''));
                    
                    // Validación Estricta del número de columnas del separador ";"
                    if (vals.length !== 5) {
                        console.warn(`Fila ${i+1} omitida: El número de columnas no coincide con la plantilla.`);
                        continue;
                    }

                    const code = vals[0].trim();
                    const name = vals[1].trim();
                    const ubicacion = vals[2].trim();
                    const canal = vals[3].trim();
                    const activoRaw = vals[4].trim().toLowerCase();
                    const activo = activoRaw === '1' || activoRaw === 'true' || activoRaw === 'sí' || activoRaw === 'si';

                    // Regla de Oro: Si el código ya existe, omitir y no actualizar
                    if (this.db.some(r => r.code === code)) {
                        console.warn(`Código ${code} ya existe. Fila omitida según reglas del sistema.`);
                        continue;
                    }

                    // Crear nueva Entidad (L1 sin padre asumiendo bulk import global de base)
                    const newId = crypto.randomUUID();
                    const newEntity = {
                        id: newId,
                        level: modDef.level,
                        category: modDef.category,
                        subCategory: modDef.subCategory,
                        type: activeModCode,
                        code: code,
                        name: name,
                        location: ubicacion,
                        canal: canal,
                        parentId: null, // Los importados bulk en este stage son nodos semilla L1
                        isActive: activo,
                        deletedAt: null,
                        deletedBy: null,
                        createdAt: new Date().toISOString(),
                        createdBy: 'BULK_IMPORT_CSV',
                        updatedAt: new Date().toISOString(),
                        updatedBy: 'BULK_IMPORT_CSV'
                    };
                    
                    this.db.push(newEntity);
                    newCount++;

                    // Regla de Auto-Creación de PRL si la entidad de categoría LUGAR permite PRL
                    if (modDef.category === 'LUGAR' && modDef.tipos_hijo_permitidos && modDef.tipos_hijo_permitidos.includes('PRL')) {
                        const prlCode = code + '-PRL';
                        // Validamos adicionalmente que este código hermano no exista
                        if (!this.db.some(r => r.code === prlCode)) {
                            // Extraemos las métricas del tipo PRL (Principal) desde tiposEntidadDb
                            const prlDef = MODULES['PRL'];
                            this.db.push({
                                id: crypto.randomUUID(),
                                level: prlDef ? prlDef.level : 'L2',
                                category: prlDef ? prlDef.category : 'DELEGACION',
                                subCategory: prlDef ? prlDef.subCategory : 'ALMACEN',
                                type: 'PRL',
                                code: prlCode,
                                name: `${name} (Almacén Principal)`,
                                location: ubicacion,
                                canal: canal,
                                parentId: newId,
                                isActive: true,
                                deletedAt: null,
                                deletedBy: null,
                                createdAt: new Date().toISOString(),
                                createdBy: 'SYSTEM_AUTOGEN',
                                updatedAt: new Date().toISOString(),
                                updatedBy: 'SYSTEM_AUTOGEN'
                            });
                            autoPrlCount++;
                        }
                    }
                }

                if (newCount > 0) {
                    this.saveDb();
                    this.filterTable(); // refrescar UI
                    alert(`Importación completada con éxito:\n- ${newCount} nuevos registros maestros.\n- ${autoPrlCount} sub-delegaciones (PRL) auto-generadas.`);
                } else {
                    alert("No se importó ningún registro nuevo. O bien los códigos ya existían en la base de datos, o las filas contenían errores de formato.");
                }

            } else {
                alert("Importación PSet aún pendiente de construcción.");
            }
            e.target.value = ''; // Reset input file state
        };
        reader.readAsText(file);
    },

    exportModuleCSV(pstType = null) {
        try {
            if (!pstType) {
                const activeMod = this.currentModule || app.currentModule;
                if (!activeMod) {
                    alert("Error: No se ha detectado el módulo actual.");
                    return;
                }

                // Extraemos TODOS los datos de la DB que coincidan con el tipo de modulo abierto (ignoramos filtro visual)
                const dataToExport = this.db.filter(r => r.type === activeMod);
                if(dataToExport.length === 0) { 
                    alert(`No hay registros de tipo '${activeMod}' para exportar en la base de datos.`); 
                    return; 
                }
                
                // Exportando absolutamente todos los campos (Dump maestro)
                const header = "Id;Tipo;Codigo;Nombre;Categoria;SubCategoria;Nivel;Padre;Ubicacion;Canal;Activo;FechaCreacion;FechaModificacion";
                
                // Función de escape robusta para CSV
                const esc = (str) => {
                    if (str === null || str === undefined) return '""';
                    // Convert to string and escape internal quotes
                    const s = String(str).replace(/"/g, '""');
                    return `"${s}"`;
                };

                const rows = dataToExport.map(r => {
                    return [
                        esc(r.id), esc(r.type), esc(r.code), esc(r.name), 
                        esc(r.category), esc(r.subCategory), esc(r.level), 
                        esc(r.parentId), esc(r.location), esc(r.canal), 
                        esc(r.isActive ? '1' : '0'), esc(r.createdAt), esc(r.updatedAt)
                    ].join(';');
                });

                const csv = [header, ...rows].join('\n');
                // Añadir BOM para que Excel en Windows detecte el UTF-8 correctamente automáticamente
                const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `exportacion_completa_${activeMod}_${new Date().getTime()}.csv`;
                document.body.appendChild(a); // Required for Firefox
                a.click();
                
                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

            } else {
                alert("Exportación de PSets no implementada todavía.");
            }
        } catch (error) {
            console.error("Error al exportar CSV:", error);
            alert("Ocurrió un error inesperado al intentar exportar los datos. Revise la consola.");
        }
    },

    // -- GESTIÓN DE TIPOS (NUEVO MÓDULO ARQUITECTURA) --
    openTypeManager() {
        this.showScreen('type-manager-screen');
        this.renderTypeManager();
    },

    renderTypeManager() {
        const tbody = document.getElementById('types-tbody');
        tbody.innerHTML = '';

        tiposEntidadDb.forEach(t => {
            const tr = document.createElement('tr');
            
            // Highlight special system types
            if (t.id_tipo === 'PST') tr.style.backgroundColor = '#f0f8ff'; // Light blue for PSet

            let iconDisplay = t.icono ? (t.icono.startsWith('#') ? `<svg style="width:16px; height:16px; vertical-align:middle;"><use href="${t.icono}"></use></svg>` : t.icono) : '-';
            
            let hijosHtml = t.tipos_hijo_permitidos && t.tipos_hijo_permitidos.length > 0 
                ? t.tipos_hijo_permitidos.map(h => `<span style="background:#eee; padding:2px 6px; border-radius:3px; font-size:10px; margin-right:4px;">${h}</span>`).join('') 
                : '<span style="color:#aaa; font-style:italic;">(Ninguno)</span>';

            tr.innerHTML = `
                <td><strong>${t.id_tipo}</strong></td>
                <td>${iconDisplay} ${t.nombre}</td>
                <td><span class="badge badge-${t.categoria === 'LUGAR' ? 'success' : (t.categoria === 'DELEGACION' ? 'warning' : 'info')}">${t.categoria}</span></td>
                <td>${t.subCategoria || '-'}</td>
                <td>${t.nivel || 'L1'}</td>
                <td>${hijosHtml}</td>
                <td>${t.max_count_per_parent || '∞'}</td>
                <td class="actions-col">
                    <button class="action-btn edit-btn" onclick="app.openTypeModal('${t.id_tipo}')">Editar</button>
                    <button class="action-btn delete-btn" onclick="app.deleteTypeRecord('${t.id_tipo}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openTypeModal(id = null) {
        document.getElementById('type-modal-backdrop').classList.remove('hidden');
        document.getElementById('type-modal-backdrop').style.display = 'flex'; // Force flex for centering
        
        const titleEl = document.getElementById('type-modal-title');
        const originalIdEl = document.getElementById('tm-original-id');
        const idInput = document.getElementById('tm-id');
        const nameInput = document.getElementById('tm-name');
        const catInput = document.getElementById('tm-category');
        const subcatInput = document.getElementById('tm-subcategory');
        const levelInput = document.getElementById('tm-level');
        const iconInput = document.getElementById('tm-icon');
        const childrenInput = document.getElementById('tm-children');
        const countInput = document.getElementById('tm-maxcount');

        if (id) {
            titleEl.innerText = 'Editar Tipo de Entidad';
            const record = tiposEntidadDb.find(t => t.id_tipo === id);
            
            originalIdEl.value = record.id_tipo;
            idInput.value = record.id_tipo;
            idInput.disabled = true; // No permitir cambiar ID en edición por integridad
            
            nameInput.value = record.nombre;
            catInput.value = record.categoria;
            subcatInput.value = record.subCategoria || '';
            levelInput.value = record.nivel || 'L1';
            iconInput.value = record.icono || '';
            childrenInput.value = record.tipos_hijo_permitidos ? record.tipos_hijo_permitidos.join(', ') : '';
            countInput.value = record.max_count_per_parent || '';
        } else {
            titleEl.innerText = 'Nuevo Tipo de Entidad';
            originalIdEl.value = '';
            idInput.value = '';
            idInput.disabled = false;
            
            nameInput.value = '';
            catInput.value = 'LUGAR'; // default
            subcatInput.value = '';
            levelInput.value = 'L1';
            iconInput.value = '';
            childrenInput.value = '';
            countInput.value = '';
        }
    },

    closeTypeModal() {
        document.getElementById('type-modal-backdrop').classList.add('hidden');
        document.getElementById('type-modal-backdrop').style.display = 'none';
    },

    saveTypeRecord() {
        const originalId = document.getElementById('tm-original-id').value;
        let id_tipo = document.getElementById('tm-id').value.trim().toUpperCase();
        const nombre = document.getElementById('tm-name').value.trim();
        const categoria = document.getElementById('tm-category').value;
        const subCategoria = document.getElementById('tm-subcategory').value.trim().toUpperCase();
        const nivel = document.getElementById('tm-level').value;
        const icono = document.getElementById('tm-icon').value.trim();
        const max_count_per_parent = document.getElementById('tm-maxcount').value ? parseInt(document.getElementById('tm-maxcount').value) : null;
        
        // Parsear hijos
        const childrenRaw = document.getElementById('tm-children').value.trim();
        let tipos_hijo_permitidos = [];
        if (childrenRaw) {
            tipos_hijo_permitidos = childrenRaw.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== '');
        }

        // Validaciones Básicas
        if (!id_tipo || !nombre) {
            alert('El ID y el Nombre son obligatorios.');
            return;
        }

        if (id_tipo.length > 3) {
            alert('El ID (Prefijo) no puede tener más de 3 caracteres.');
            return;
        }

        // Check Duplicados en creación
        if (!originalId && tiposEntidadDb.some(t => t.id_tipo === id_tipo)) {
            alert(`El ID de Tipo '${id_tipo}' ya existe. Use uno diferente.`);
            return;
        }

        const payload = {
            id_tipo, nombre, categoria, subCategoria, nivel, icono, tipos_hijo_permitidos, max_count_per_parent
        };

        if (originalId) {
            // Update
            const idx = tiposEntidadDb.findIndex(t => t.id_tipo === originalId);
            if (idx > -1) {
                // Check Compatibility: Si cambia max_count, asegurar que datos actuales lo cumplen
                if (max_count_per_parent !== null) {
                   const violateCount = this.checkMaxCountViolations(originalId, max_count_per_parent);
                   if (violateCount > 0) {
                       alert(`⚠️ INCOMPATIBILIDAD DE DATOS:\nExisten ${violateCount} padres en la base de datos que ya superan el nuevo límite fijado de ${max_count_per_parent} respecto a este tipo (${originalId}).\n\nDebe limpiar los datos existentes (archivar el exceso) antes de aplicar esta nueva regla estructural.`);
                       return;
                   }
                }
                tiposEntidadDb[idx] = payload;
            }
        } else {
            // Create
            tiposEntidadDb.push(payload);
        }

        // Recargar MODULES y Guardar
        this.parseTiposEntidad(this.serializeTiposEntidad());
        this.saveDb();
        this.renderTypeManager();
        this.closeTypeModal();
        alert('Configuración guardada correctamente. Los menús han sido reconstruidos.');
    },

    deleteTypeRecord(id_tipo) {
        if (id_tipo === 'PST') {
            alert('El sistema no permite eliminar el tipo base PST (Propiedades).');
            return;
        }

        // Validar que no existan registros de este tipo en la DB
        const existingRecords = this.db.some(r => r.type === id_tipo && r.deletedAt === null);
        if (existingRecords) {
            alert(`⚠️ ACCIÓN BLOQUEADA:\nNo puede eliminar este Tipo de Entidad porque existen registros activos asociados a él en la Base de Datos.\n\nPor favor, archive todos los registros vinculados antes de eliminar la categoría.`);
            return;
        }

        if (confirm(`¿Está completamente seguro de eliminar el Tipo de Entidad '${id_tipo}'?\nEsta acción modificará la estructura global de la aplicación.`)) {
            tiposEntidadDb = tiposEntidadDb.filter(t => t.id_tipo !== id_tipo);
            
            // Recargar MODULES y Guardar
            this.parseTiposEntidad(this.serializeTiposEntidad());
            this.saveDb();
            this.renderTypeManager();
            alert('Tipo de Entidad eliminado correctamente.');
        }
    },

    checkMaxCountViolations(childType, newMaxCount) {
        // Mapa: parentId -> conteo de hijos activos de tipo 'childType'
        const counts = new Map();
        
        // Usar la masterMap logic del frontend para tener la imagen final de cabeceras
        const masterMap = new Map();
        this.db.forEach((r) => {
             const existing = masterMap.get(r.code);
             if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
                 masterMap.set(r.code, r);
             }
         });

        masterMap.forEach(r => {
             if (r.deletedAt === null && r.parentId && r.type === childType) {
                 counts.set(r.parentId, (counts.get(r.parentId) || 0) + 1);
             }
        });

        let violations = 0;
        counts.forEach(count => {
            if (count > newMaxCount) violations++;
        });

        return violations;
    },

    // Serializador inverso para parseTiposEntidad (espera lineas CSV)
    serializeTiposEntidad() {
        return tiposEntidadDb.map(t => {
            return `${t.id_tipo};"${t.nombre}";${t.categoria};${t.subCategoria};${t.nivel};${t.icono};${t.tipos_hijo_permitidos.length > 0 ? '"' + JSON.stringify(t.tipos_hijo_permitidos).replace(/"/g, '""') + '"' : ''};${t.max_count_per_parent === null ? '' : t.max_count_per_parent}`;
        });
    },

    // --- LOGICA DE TABLAS AVANZADAS (Sort y Resize) ---
    setupTableSorting(tableId, isDynamic = false) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const ths = table.querySelectorAll('thead th');
        ths.forEach(th => {
            if (!th.dataset.col) return; // solo si tiene un data col
            // Si tiene botón, clickear botón, sino el th
            const btn = th.querySelector('.sort-btn');
            const targetEl = btn || th;
            targetEl.onclick = (e) => {
                e.stopPropagation();
                if (e.target.classList.contains('resizer')) return; // ignorar click en resizer
                if (this.sortCol === th.dataset.col) {
                    this.sortAsc = !this.sortAsc;
                } else {
                    this.sortCol = th.dataset.col;
                    this.sortAsc = true;
                }

                if (tableId === 'data-table') {
                    // Update main view and save immediately
                    this.filterTable();
                    if (this.currentModule) {
                        this.moduleStates[this.currentModule] = {
                            filters: { ...this.filters },
                            sortCol: this.sortCol,
                            sortAsc: this.sortAsc,
                            searchTerm: document.getElementById('search-input') ? document.getElementById('search-input').value : ''
                        };
                    }
                } else if (tableId === 'excel-table') {
                    // Quick and dirty sort for excel data
                    const tableObj = this.schemaTables[this.currentExcelTableIdx];
                    if (tableObj.name === 'Directorio_Master_Activos') {
                        // Just toggle asc/desc and rerender
                        this.renderExcel();
                    }
                }
            };
        });
        if (!isDynamic) this.updateSortIterface(tableId);
    },
    updateSortIterface(tableId) {
        const ths = document.querySelectorAll(`#${tableId} thead th`);
        ths.forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.col === this.sortCol) {
                th.classList.add(this.sortAsc ? 'sort-asc' : 'sort-desc');
            }
        });
    },
    createResizableColumns(table) {
        if (!table) return;
        const cols = table.querySelectorAll('th');
        [].forEach.call(cols, (th) => {
            // Eliminar viejo si existe
            const oldR = th.querySelector('.resizer');
            if (oldR) oldR.remove();

            const resizer = document.createElement('div');
            resizer.classList.add('resizer');
            resizer.style.height = `${table.offsetHeight}px`; // Ajuste inicial
            th.appendChild(resizer);
            this.createResizableColumn(th, resizer, table);
        });
    },
    createResizableColumn(th, resizer, table) {
        let x = 0;
        let w = 0;

        const mouseDownHandler = (e) => {
            x = e.clientX;
            const styles = window.getComputedStyle(th);
            w = parseInt(styles.width, 10);

            resizer.classList.add('resizing');
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = (e) => {
            const dx = e.clientX - x;
            th.style.width = `${w + dx}px`;
            th.style.minWidth = `${w + dx}px`;
        };

        const mouseUpHandler = () => {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        resizer.addEventListener('mousedown', mouseDownHandler);
    },

    // --- LOGICA PSETS (Panel Izquierdo AutoCAD) ---
    loadSideProperties(id, activeTab = 'ESTATICO') {
        const record = this.db.find(r => r.id === id);
        if (!record) return;

        const sidebar = document.getElementById('properties-panel');
        const empty = document.getElementById('props-empty');
        const content = document.getElementById('props-content');

        empty.classList.add('hidden');
        content.classList.remove('hidden');

        // Buscar qué PSets aplican a este tipo (y que sigan activos en tabla maestra)
        const applicableDefs = this.psets_def.filter(def =>
            def.appliesTo.includes(record.type) &&
            this.db.some(r => r.id === def.id_pset && r.deletedAt === null)
        ).sort((a, b) => {
            const rA = this.db.find(x => x.id === a.id_pset);
            const rB = this.db.find(x => x.id === b.id_pset);
            return (rA?.code || '').localeCompare(rB?.code || '');
        });

        const estaticos = applicableDefs.filter(d => d.behavior === 'ESTATICO');
        const dinamicos = applicableDefs.filter(d => d.behavior === 'DINAMICO');

        const isEstatico = activeTab === 'ESTATICO';

        // Render Pestañas
        const estBtnStyle = `flex:1; padding:0.4rem; background:transparent; border:none; border-bottom:2px solid ${isEstatico ? 'var(--primary)' : 'transparent'}; font-weight:${isEstatico ? 'bold' : 'normal'}; color:${isEstatico ? 'var(--text-main)' : '#666'}; cursor:pointer;`;
        const dinBtnStyle = `flex:1; padding:0.4rem; background:transparent; border:none; border-bottom:2px solid ${!isEstatico ? 'var(--primary)' : 'transparent'}; font-weight:${!isEstatico ? 'bold' : 'normal'}; color:${!isEstatico ? 'var(--text-main)' : '#666'}; cursor:pointer;`;

        let html = `
            <div style="font-size:12px; margin-bottom: 1rem;">
                <strong>Elemento:</strong> ${record.code} - ${record.name}
            </div>
            
            <div style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom: 0.5rem;">
                <button style="${estBtnStyle}" onclick="app.loadSideProperties('${id}', 'ESTATICO')">Estáticas</button>
                <button style="${dinBtnStyle}" onclick="app.loadSideProperties('${id}', 'DINAMICO')">Dinámicas</button>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-bottom:0.5rem;">
                <button class="btn btn-outline btn-sm" style="font-size:10px; padding:2px 6px; border:none;" onclick="app.toggleSideAccordion(true)">➕ Abrir Todo</button>
                <button class="btn btn-outline btn-sm" style="font-size:10px; padding:2px 6px; border:none;" onclick="app.toggleSideAccordion(false)">➖ Cerrar Todo</button>
            </div>
        `;

        const renderSet = isEstatico ? estaticos : dinamicos;

        if (renderSet.length === 0) {
            html += `<div style="font-size:11px; color:#999; text-align:center; padding: 1rem;">No hay conjuntos de propiedades de este tipo asignables a ${MODULES[record.type].title}.</div>`;
        } else {
            renderSet.forEach(pset => {
                const mst = this.db.find(r => r.id === pset.id_pset);

                // Fetch saved values and last timestamp for header
                let savedData = {};
                let recordTimestamp = null;
                if (isEstatico) {
                    const key = `${id}_${pset.id_pset}`;
                    savedData = this.psetValuesDb[key] || {};
                } else {
                    const history = this.psetHistoryDb.filter(h => h.id_entity === id && h.id_pset === pset.id_pset).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    if (history.length > 0) {
                        savedData = history[0].data;
                        recordTimestamp = history[0].timestamp;
                    }
                }

                const dateSuffix = (!isEstatico && recordTimestamp) ? ` (${new Date(recordTimestamp).toLocaleDateString('es-ES')})` : '';
                const title = `[+] ${mst.name}${dateSuffix}`;

                // Construir Formulario Interno del Acordeón
                let formHtml = `<div style="padding: 0.5rem; display:none;" id="pset-body-${pset.id_pset}">`;

                // Action row for Dynamic (Add record)
                if (!isEstatico) {
                    formHtml += `
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                            <button class="btn btn-outline btn-sm" style="font-size:10px; padding:0.2rem 0.4rem;" onclick="app.showDynamicChart('${id}', '${pset.id_pset}')">📊 Ver Gráfico Histórico</button>
                            <button class="btn btn-primary btn-sm" style="font-size:10px; padding:0.2rem 0.4rem;" onclick="app.saveDynamicProperty('${id}', '${pset.id_pset}')">💾 Guardar Nuevo Punto</button>
                        </div>
                    `;
                }

                // Note: savedData and recordTimestamp are already fetched above for the title

                // Añadir Campo Fecha Transversal (Iteración 8.1)
                if (isEstatico) {
                    const entity = this.db.find(e => e.id === id);
                    const updateDate = entity ? new Date(entity.updatedAt || entity.createdAt).toLocaleDateString('es-ES') : '-';
                    formHtml += `
                        <div class="pset-field" style="border-bottom:1px solid #eee; padding:4px 0; display:flex; justify-content:space-between; font-size:11px;">
                            <span style="color:#777;">Fecha Actualización:</span>
                            <span style="font-weight:600;">${updateDate}</span>
                        </div>
                    `;
                } else if (recordTimestamp) {
                    const dateStr = new Date(recordTimestamp).toLocaleDateString('es-ES');
                    formHtml += `
                        <div class="pset-field" style="border-bottom:1px solid #eee; padding:4px 0; display:flex; justify-content:space-between; font-size:11px;">
                            <span style="color:#777;">Fecha de Registro:</span>
                            <span style="font-weight:600;">${dateStr}</span>
                        </div>
                    `;
                }


                pset.properties.forEach(p => {
                    const fieldId = `prop_${pset.id_pset}_${p.name.replace(/\s+/g, '')}`;
                    let val = savedData[p.name] !== undefined ? savedData[p.name] : '';
                    let inputHtml = '';

                    if (p.type === 'SINO') {
                        inputHtml = `<input type="checkbox" id="${fieldId}" ${val ? 'checked' : ''} onchange="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'FECHA') {
                        inputHtml = `<input type="date" id="${fieldId}" style="width:100%; font-size:11px; padding:0.2rem;" value="${val}" onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'ENTERO' || p.type === 'DECIMAL') {
                        inputHtml = `<input type="number" id="${fieldId}" style="width:100%; font-size:11px; padding:0.2rem;" value="${val}" ${p.type === 'DECIMAL' ? 'step="0.01"' : ''} onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'COLOR') {
                        inputHtml = `<input type="color" id="${fieldId}" style="width:100%; height:25px; padding:0;" value="${val || '#ffffff'}" onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'EMAIL') {
                        inputHtml = `<input type="email" id="${fieldId}" style="width:100%; font-size:11px; padding:0.2rem;" value="${val}" onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'TELEFONO') {
                        inputHtml = `<input type="tel" id="${fieldId}" style="width:100%; font-size:11px; padding:0.2rem;" value="${val}" onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'URL') {
                        inputHtml = `<input type="url" id="${fieldId}" style="width:100%; font-size:11px; padding:0.2rem;" value="${val}" placeholder="https://..." onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    } else if (p.type === 'IMAGEN') {
                        const imgPreview = val ? `<img src="${val}" style="max-width:100%; max-height:100px; display:block; margin-top:5px; border-radius:3px;">` : '';
                        inputHtml = `
                            <input type="file" accept="image/*" id="${fieldId}_file" style="font-size:10px; width:100%;" onchange="app.handleImageUpload(event, '${fieldId}', ${isEstatico}, '${id}', '${pset.id_pset}')">
                            <input type="hidden" id="${fieldId}" value="${val}">
                            <div id="${fieldId}_preview">${imgPreview}</div>
                        `;
                    } else {
                        inputHtml = `<input type="text" id="${fieldId}" style="width:100%; font-size:11px; padding:0.2rem;" value="${val}" onblur="${isEstatico ? `app.saveStaticProperty('${id}','${pset.id_pset}')` : ''}">`;
                    }

                    formHtml += `
                        <div style="margin-bottom: 0.4rem;">
                            <label style="display:block; font-size:10px; color:var(--text-muted); margin-bottom:1px;">${p.name} <span style="opacity:0.5; font-size:8px;">(${p.type})</span></label>
                            ${inputHtml}
                        </div>
                    `;
                });

                // History Table Preview for Dynamic
                if (!isEstatico) {
                    const history = this.psetHistoryDb.filter(h => h.id_entity === id && h.id_pset === pset.id_pset).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    if (history.length > 0) {
                        formHtml += `<div style="margin-top:0.8rem; border-top:1px solid #ddd; padding-top:0.5rem; font-size:9px; color:#666;">Últimos registros:</div>`;
                        history.slice(0, 3).forEach(h => {
                            const briefData = Object.entries(h.data).map(([k, v]) => `${k}:${v}`).join(', ');
                            formHtml += `<div style="font-size:9px; background:#fff; padding:2px; margin-top:2px; border:1px solid #eee;">${new Date(h.timestamp).toLocaleDateString()} - ${briefData}</div>`;
                        });
                    }
                }

                formHtml += `</div>`;

                html += `<div class="pset-grupo">
                            <div class="pset-header" onclick="app.toggleAccordion('pset-body-${pset.id_pset}', this)">
                                <span>[+]</span> ${title}
                            </div>
                            ${formHtml}
                        </div>`;
            });
        }

        content.innerHTML = html;
        // Auto open all accordions for better UX initially
        document.querySelectorAll('.pset-grupo [id^="pset-body-"]').forEach(el => el.style.display = 'block');
    },

    toggleSideAccordion(expand) {
        document.querySelectorAll('.pset-grupo [id^="pset-body-"]').forEach(el => {
            el.style.display = expand ? 'block' : 'none';
        });
    },

    toggleAccordion(id, headerEl) {
        const body = document.getElementById(id);
        if (body.style.display === 'none') {
            body.style.display = 'block';
            headerEl.querySelector('span').innerText = headerEl.querySelector('span').innerText.replace('[-]', '[+]'); // naive flip
        } else {
            body.style.display = 'none';
        }
    },

    handleImageUpload(e, hiddenFieldId, isEstatico, id_ent, id_pset) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const b64 = evt.target.result;
            document.getElementById(hiddenFieldId).value = b64;
            document.getElementById(hiddenFieldId + '_preview').innerHTML = `<img src="${b64}" style="max-width:100%; max-height:100px; display:block; margin-top:5px; border-radius:3px;">`;
            if (isEstatico) {
                this.saveStaticProperty(id_ent, id_pset);
            }
        };
        reader.readAsDataURL(file);
    },

    saveStaticProperty(id_ent, id_pset) {
        // Collect data
        const def = this.psets_def.find(d => d.id_pset === id_pset);
        const data = {};
        def.properties.forEach(p => {
            const fieldId = `prop_${id_pset}_${p.name.replace(/\s+/g, '')}`;
            const el = document.getElementById(fieldId);
            if (el) {
                data[p.name] = el.type === 'checkbox' ? el.checked : el.value;
            }
        });

        const key = `${id_ent}_${id_pset}`;
        this.psetValuesDb[key] = data;
        localStorage.setItem('psets_val_db', JSON.stringify(this.psetValuesDb));
    },

    saveDynamicProperty(id_ent, id_pset) {
        const def = this.psets_def.find(d => d.id_pset === id_pset);
        const data = {};
        def.properties.forEach(p => {
            const fieldId = `prop_${id_pset}_${p.name.replace(/\s+/g, '')}`;
            const el = document.getElementById(fieldId);
            if (el) {
                data[p.name] = el.type === 'checkbox' ? el.checked : el.value;
            }
        });

        this.psetHistoryDb.push({
            id_record: crypto.randomUUID ? 'PDN-' + crypto.randomUUID() : 'PDN-' + Date.now(),
            id_entity: id_ent,
            id_pset: id_pset,
            timestamp: new Date().toISOString(),
            data: data
        });
        localStorage.setItem('psets_dyn_db', JSON.stringify(this.psetHistoryDb));

        // Refresh panel to show new history items
        this.loadSideProperties(id_ent, 'DINAMICO');
    },

    showDynamicChart(id_ent, id_pset) {
        const modal = document.getElementById('chart-modal-backdrop');
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Add class to ensure it displays flex as in inline style

        const def = this.psets_def.find(d => d.id_pset === id_pset);
        const history = this.psetHistoryDb.filter(h => h.id_entity === id_ent && h.id_pset === id_pset).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Detect numerical properties to plot
        const numProps = def.properties.filter(p => p.type === 'ENTERO' || p.type === 'DECIMAL').map(p => p.name);

        const ctx = document.getElementById('propChart').getContext('2d');

        // Kill old chart instance if exists
        if (window.myChartInstance) {
            window.myChartInstance.destroy();
        }

        if (numProps.length === 0 || history.length === 0) {
            // Can't plot
            window.myChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels: ['Sin Datos Numéricos'], datasets: [] },
                options: { plugins: { title: { display: true, text: 'No hay datos numéricos o historial para graficar.' } } }
            });
            return;
        }

        const labels = history.map(h => new Date(h.timestamp).toLocaleDateString());
        const datasets = numProps.map((pName, idx) => {
            const colors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'];
            return {
                label: pName,
                data: history.map(h => parseFloat(h.data[pName]) || 0),
                borderColor: colors[idx % colors.length],
                backgroundColor: colors[idx % colors.length] + '40', // transparent
                tension: 0.1,
                fill: true
            };
        });

        window.myChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    // --- LOGICA MODAL PSETS ---
    openPSetModal(id = null) {
        document.getElementById('pset-modal-backdrop').classList.remove('hidden');
        document.getElementById('pset-modal-backdrop').classList.add('flex'); // for centering if needed
        const propsContainer = document.getElementById('pset-properties-container');
        propsContainer.innerHTML = ''; // reset

        let def = { appliesTo: [], properties: [], behavior: 'ESTATICO' };

        if (id) {
            document.getElementById('pset-modal-title').innerText = 'Editar Definición PSet';
            const record = this.db.find(r => r.id === id);
            def = this.psets_def.find(d => d.id_pset === id) || def;

            document.getElementById('pset-modal-code').value = record.code;
            document.getElementById('pset-modal-name').value = record.name;
            document.getElementById('pset-modal-id').value = id;
            document.getElementById('pset-modal-behavior').value = def.behavior;
            document.getElementById('pset-modal-active').checked = record.isActive;
        } else {
            document.getElementById('pset-modal-title').innerText = 'Nuevo PSet';
            document.getElementById('pset-modal-code').value = '';
            document.getElementById('pset-modal-name').value = '';
            document.getElementById('pset-modal-id').value = '';
            document.getElementById('pset-modal-behavior').value = 'ESTATICO'; // default
            document.getElementById('pset-modal-active').checked = true;
        }

        // -- Población dinámica de Checkboxes (Lugares vs Delegaciones) --
        const container = document.getElementById('pset-dynamic-applies-to');
        if(container) container.innerHTML = ''; 

        // Agrupar por Categoría/Subcategoría
        const groups = {};
        for (const [key, mod] of Object.entries(MODULES)) {
            if (key === 'PST') continue;
            
            let groupName = mod.category;
            if (mod.subCategory) groupName += ` - ${mod.subCategory}`;

            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push({ key, title: mod.title });
        }

        // Renderizar Grupos y Checkboxes
        for (const [groupName, items] of Object.entries(groups)) {
            const details = document.createElement('details');
            details.className = 'custom-dropdown';
            details.innerHTML = `<summary>${groupName}</summary><div class="dropdown-list"></div>`;
            const list = details.querySelector('.dropdown-list');

            items.forEach(item => {
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.gap = '4px';
                const isChecked = def && def.appliesTo && def.appliesTo.includes(item.key) ? 'checked' : '';
                label.innerHTML = `<input type="checkbox" value="${item.key}" ${isChecked}> ${item.title}`;
                list.appendChild(label);
            });

            if(container) container.appendChild(details);
        }

        // Poblar propiedades del PSet
        if (id && def.properties && def.properties.length > 0) {
            def.properties.forEach(p => this.addPSetRow(p.name, p.type));
        } else {
            // Requisito: Los PSets por defecto (nuevos) deben incluir estos 2 campos obligatorios
            this.addPSetRow('Fecha de Lectura', 'FECHA');
            this.addPSetRow('Código de Informe', 'TEXTO');
        }
    },
    closePSetModal() {
        document.getElementById('pset-modal-backdrop').classList.add('hidden');
    },
    addPSetRow(nameVal = '', typeVal = 'TEXTO') {
        const container = document.getElementById('pset-properties-container');
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '0.5rem';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `
            <input type="text" placeholder="Nombre de Propiedad (Ej: Código Postal)" style="flex:2; padding:0.3rem;" value="${nameVal}" class="pset-prop-name">
            <select style="flex:1; padding:0.3rem;" class="pset-prop-type">
                <option value="TEXTO" ${typeVal === 'TEXTO' ? 'selected' : ''}>Texto Corto</option>
                <option value="ENTERO" ${typeVal === 'ENTERO' ? 'selected' : ''}>Entero Numérico</option>
                <option value="DECIMAL" ${typeVal === 'DECIMAL' ? 'selected' : ''}>Decimal / Moneda</option>
                <option value="SINO" ${typeVal === 'SINO' ? 'selected' : ''}>Si / No (Toggle)</option>
                <option value="FECHA" ${typeVal === 'FECHA' ? 'selected' : ''}>Fecha</option>
                <option value="COLOR" ${typeVal === 'COLOR' ? 'selected' : ''}>Color (🎨)</option>
                <option value="EMAIL" ${typeVal === 'EMAIL' ? 'selected' : ''}>E-mail</option>
                <option value="TELEFONO" ${typeVal === 'TELEFONO' ? 'selected' : ''}>Teléfono</option>
                <option value="URL" ${typeVal === 'URL' ? 'selected' : ''}>URL / Enlace Web</option>
                <option value="IMAGEN" ${typeVal === 'IMAGEN' ? 'selected' : ''}>Imagen (Base64)</option>
            </select>
            <button class="btn btn-outline" style="color:var(--danger)" onclick="this.parentElement.remove()">🗑</button>
        `;
        container.appendChild(div);
    },
    savePSetRecord() {
        const id = document.getElementById('pset-modal-id').value;
        const code = document.getElementById('pset-modal-code').value.trim().toUpperCase();
        const name = document.getElementById('pset-modal-name').value.trim();
        const behavior = document.getElementById('pset-modal-behavior').value;
        const isActive = document.getElementById('pset-modal-active').checked;

        if (!code || !name) { alert("Código y Nombre son obligatorios"); return; }
        // Unicidad por Tipo (PST)
        if (!id && this.db.some(r => r.code === code && r.type === 'PST' && r.deletedAt === null)) { alert("Este código ya existe para otro PSet."); return; }
        if (id && this.db.some(r => r.code === code && r.type === 'PST' && r.id !== id && r.deletedAt === null)) { alert("Este código ya existe para otro PSet."); return; }

        // Extraer Checks (de ambos bloques)
        const appliesTo = Array.from(document.querySelectorAll('#pset-modal-backdrop input[type="checkbox"]:not(#pset-modal-active):checked')).map(cb => cb.value);
        if (appliesTo.length === 0) { alert("Debe seleccionar al menos una entidad a la que aplique este PSet"); return; }

        // Extraer Propiedades
        const properties = [];
        const rows = document.querySelectorAll('#pset-properties-container > div');
        let hasPropError = false;
        rows.forEach(r => {
            const pName = r.querySelector('.pset-prop-name').value.trim();
            const pType = r.querySelector('.pset-prop-type').value;
            if (!pName) hasPropError = true;
            properties.push({ name: pName, type: pType });
        });
        if (hasPropError) { alert("Debe definir propiedades válidas y sin nombres en blanco."); return; }

        if (properties.length === 0) {
            if (!id) {
                alert("Para crear un nuevo PSet es imprescindible definir al menos 1 propiedad.");
                return;
            } else {
                if (confirm("Ha quitado todas las propiedades de este PSet. Guardarlo vacío supone archivar del sistema el PSet completo y todas sus plantillas vinculadas. ¿Desea continuar?")) {
                    this.deleteRecord(id);
                    this.closePSetModal();
                    return;
                } else {
                    return; // abort
                }
            }
        }

        let activeId = id;

        // 1. Save in Master Table (PST)
        if (id) {
            const record = this.db.find(r => r.id === id);
            record.code = code;
            record.name = name;
            record.isActive = isActive;
            record.updatedAt = new Date().toISOString();
        } else {
            activeId = crypto.randomUUID ? 'PST-' + crypto.randomUUID() : 'PST-' + Date.now();
            this.db.push({
                id: activeId,
                type: 'PST',
                code,
                name,
                isActive,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
            });
        }

        // Guardar Propiedades como Entidades Independientes 'PRP' en Tabla Maestra
        properties.forEach(p => {
            const hasPrp = this.db.some(r => r.name === p.name && r.type === 'PRP' && r.deletedAt === null);
            if (!hasPrp) {
                this.db.push({
                    id: crypto.randomUUID ? 'PRP-' + crypto.randomUUID() : 'PRP-' + Date.now(),
                    type: 'PRP',
                    code: 'PRP-' + (Math.floor(Math.random() * 900000) + 100000), // Fake incremental code
                    name: p.name,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    deletedAt: null
                });
            }
        });

        this.saveDb();

        // 2. Save in PSet Definitions DB
        const defIndex = this.psets_def.findIndex(d => d.id_pset === activeId);
        const defPayload = { id_pset: activeId, behavior, appliesTo, properties };
        if (defIndex > -1) {
            this.psets_def[defIndex] = defPayload;
        } else {
            this.psets_def.push(defPayload);
        }
        this.saveDb();
        this.closePSetModal();
        this.filterTable();
    }
};

// Arrancar App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
