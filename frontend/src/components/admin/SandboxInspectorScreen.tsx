import React, { useState } from 'react';
import { SafeImage } from '../SafeImage';
import { PSetZone9, PSetZone10 } from '../generics/PSetInspector';

interface SandboxInspectorScreenProps {
  onBack: () => void;
}

export const SandboxInspectorScreen: React.FC<SandboxInspectorScreenProps> = ({ onBack }) => {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

  // MOCK DE ENTIDADES PARA SELECCIONAR (Zona 6)
  const mockEntities = [
    { id: 'ENT-EMP-001', codigo: 'CL-001', nombre: 'Dragados S.A.', typeLabel: 'Agentes' },
    { id: 'ENT-EMP-002', codigo: 'PR-452', nombre: 'Hilti España', typeLabel: 'Agentes' },
    { id: 'ENT-EMP-003', codigo: 'UTE-01', nombre: 'UTE Túneles Norte', typeLabel: 'Agentes' },
    { id: 'ENT-SED-001', codigo: 'SED-001', nombre: 'Sede Central', typeLabel: 'Delegaciones' }
  ];

  const mockPhases = [
    { id: 'PHASE-01', name: 'Licitación' },
    { id: 'PHASE-02', name: 'Ejecución' },
    { id: 'PHASE-03', name: 'Garantía' }
  ];

  const mockDepts = [
    { id: 'DEPT-01', name: 'Gerencia' },
    { id: 'DEPT-02', name: 'Topografía' },
    { id: 'DEPT-03', name: 'RRHH' }
  ];

  // MOCKS DE DICCIONARIOS Y VALORES PARA EL MODO SANDBOX (Independiente del backend real)
  const mockPsetsDef = [
    {
      id_pset: 1,
      schema_alias: 'DATOS FISCALES',
      pset_behavior_type: 'ESTATICO',
      json_shape_definition: {
        DataSchema: {
          'Razón Social': { type: 'string' },
          'CIF / NIF': { type: 'string' },
          'Dirección Fiscal': { type: 'string' },
          'Código Postal': { type: 'string' },
          'País': { type: 'string' }
        }
      }
    },
    {
      id_pset: 2,
      schema_alias: 'CONTACTO PRINCIPAL',
      pset_behavior_type: 'ESTATICO',
      json_shape_definition: {
        DataSchema: {
          'Nombre Completo': { type: 'string' },
          'Cargo': { type: 'string' },
          'Teléfono Directo': { type: 'string' },
          'Email': { type: 'string' }
        }
      }
    }
  ];

  const mockPsetValues = [
    { fk_pset: 1, l4_instance_id: 'ENT-EMP-001', json_payload: { 'Razón Social': 'Dragados S.A.', 'CIF / NIF': 'A-12345678', 'Dirección Fiscal': 'Av. Camino de Santiago 50', 'Código Postal': '28050', 'País': 'ESPAÑA' } },
    { fk_pset: 2, l4_instance_id: 'ENT-EMP-001', json_payload: { 'Nombre Completo': 'Carlos López', 'Cargo': 'Director', 'Teléfono Directo': '913334444', 'Email': 'clopez@dragados.com' } },
    
    { fk_pset: 1, l4_instance_id: 'ENT-EMP-002', json_payload: { 'Razón Social': 'Hilti España S.A.', 'CIF / NIF': 'A-87654321', 'Dirección Fiscal': 'Fuente de la Mora 1', 'Código Postal': '28050', 'País': 'ESPAÑA' } },
    { fk_pset: 2, l4_instance_id: 'ENT-EMP-002', json_payload: { 'Nombre Completo': 'Ana Martínez', 'Cargo': 'Comercial', 'Teléfono Directo': '914445555', 'Email': 'amartinez@hilti.com' } },
    
    { fk_pset: 1, l4_instance_id: 'ENT-EMP-003', json_payload: { 'Razón Social': 'UTE Túneles Norte', 'CIF / NIF': 'U-11223344', 'Dirección Fiscal': 'Calle Obras 2', 'Código Postal': '28050', 'País': 'ESPAÑA' } },

    { fk_pset: 1, l4_instance_id: 'ENT-SED-001', json_payload: { 'Razón Social': 'NORTUNEL S.A.', 'CIF / NIF': 'A-39988776', 'Dirección Fiscal': 'PCTCAN', 'Código Postal': '39011', 'País': 'ESPAÑA' } }
  ];

  const handleEntityClick = (id: string, list: string[], setter: any) => {
    setter((prev: string[]) => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  // =========================================================================
  // ALGORITMO GENERADOR DEL "JSON INTERNO TEMPORAL" (PSetContextPayload)
  // Simula el cálculo que hace el HierarchicalGrid al clicar pestañas
  // =========================================================================
  const contextPayloadGroups: Record<string, { label: string, entityIds: string[], isChild: boolean }> = {};
  
  selectedEntities.forEach(id => {
      const e = mockEntities.find(m => m.id === id);
      if (e) {
          if (!contextPayloadGroups[e.typeLabel]) {
              contextPayloadGroups[e.typeLabel] = { label: e.typeLabel, entityIds: [], isChild: e.isChild || false };
          }
          contextPayloadGroups[e.typeLabel].entityIds.push(e.id);
      }
  });
  
  const displayGroups = Object.values(contextPayloadGroups).sort((a, b) => {
      // 1. Mostrar primero el Padre, y debajo el Hijo
      if (a.isChild !== b.isChild) return a.isChild ? 1 : -1;
      // 2. Orden alfabético
      return a.label.localeCompare(b.label);
  });

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_diccionario.svg" fallbackType="svg" wrapperClassName="w-8 h-8 filter hue-rotate-[270deg]" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Sandbox: PSet Inspector (Solo Lectura)
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">SIMULADOR WYSIWYG PARAMETRIZADO</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             INICIO
           </button>
         </div>
      </header>

      {/* CONTENT DATAGRID */}
      <main className="flex-1 flex w-full p-6 bg-[#eaeef4] overflow-hidden relative">
          <div className="w-full h-full flex gap-12 min-w-0 min-h-0 relative max-w-[1600px] mx-auto justify-center">
              
              {/* LEFT PANE: ENTORNO CONTEXTUAL (Z1, Z3, Z6) */}
              <div className="w-[300px] flex flex-col gap-4 shrink-0 overflow-y-auto pr-2 pb-12">
                 
                 {/* ZONA 1 MOCK */}
                 <div className="flex flex-col shadow bg-white border border-[#c1ccdb] rounded overflow-hidden shrink-0">
                    <div className="bg-[#eef2f6] border-b border-[#c1ccdb] p-2 flex items-center justify-between">
                       <h3 className="text-[10px] font-bold text-[#334155] uppercase tracking-widest">Zona 1: Fase Activa</h3>
                       {selectedPhases.length > 0 && <button onClick={() => setSelectedPhases([])} className="text-[9px] text-[#7f1d1d] hover:underline font-bold">LIMPIAR</button>}
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                       {mockPhases.map(ph => (
                          <div 
                            key={ph.id} onClick={() => handleEntityClick(ph.id, selectedPhases, setSelectedPhases)}
                            className={`p-2 rounded cursor-pointer transition-all text-[11px] font-semibold border ${selectedPhases.includes(ph.id) ? 'bg-[#fff1fa] border-[#fbcfe8] text-[#7f1d1d]' : 'bg-white border-transparent hover:bg-gray-50 text-gray-600'}`}
                          >
                             {ph.name}
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* ZONA 3 MOCK */}
                 <div className="flex flex-col shadow bg-white border border-[#c1ccdb] rounded overflow-hidden shrink-0">
                    <div className="bg-[#eef2f6] border-b border-[#c1ccdb] p-2 flex items-center justify-between">
                       <h3 className="text-[10px] font-bold text-[#334155] uppercase tracking-widest">Zona 3: Departamento</h3>
                       {selectedDepts.length > 0 && <button onClick={() => setSelectedDepts([])} className="text-[9px] text-[#7f1d1d] hover:underline font-bold">LIMPIAR</button>}
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                       {mockDepts.map(dp => (
                          <div 
                            key={dp.id} onClick={() => handleEntityClick(dp.id, selectedDepts, setSelectedDepts)}
                            className={`p-2 rounded cursor-pointer transition-all text-[11px] font-semibold border ${selectedDepts.includes(dp.id) ? 'bg-[#fff1fa] border-[#fbcfe8] text-[#7f1d1d]' : 'bg-white border-transparent hover:bg-gray-50 text-gray-600'}`}
                          >
                             {dp.name}
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* ZONA 6 MOCK */}
                 <div className="flex flex-col shadow bg-white border border-[#c1ccdb] rounded overflow-hidden shrink-0">
                    <div className="bg-[#eef2f6] border-b border-[#c1ccdb] p-2 flex items-center justify-between">
                       <h3 className="text-[10px] font-bold text-[#334155] uppercase tracking-widest">Zona 6: Selección</h3>
                       {selectedEntities.length > 0 && <button onClick={() => setSelectedEntities([])} className="text-[9px] text-[#7f1d1d] hover:underline font-bold">LIMPIAR</button>}
                    </div>
                    <div className="p-2 flex flex-col gap-1.5">
                       {mockEntities.map(ent => (
                          <div 
                            key={ent.id}
                            onClick={() => handleEntityClick(ent.id, selectedEntities, setSelectedEntities)}
                            className={`p-2 border rounded cursor-pointer transition-all ${selectedEntities.includes(ent.id) ? 'bg-[#f1f5f9] border-[#cbd5e1] shadow-sm' : 'bg-white border-transparent hover:border-gray-200'}`}
                          >
                             <div className="text-[9px] font-mono text-gray-400 leading-none mb-1">{ent.id}</div>
                             <div className="font-bold text-[11px] text-gray-800 leading-tight">{ent.codigo} - {ent.nombre}</div>
                          </div>
                       ))}
                    </div>
                 </div>

              </div>

              {/* RIGHT PANE: EL EXTIRPABLE - ANCHO PARAMETRIZADO WYSIWYG */}
              {/* Se simula la anchura fija estipulada por la base de datos (e.g. 350px) para el visor PSet */}
              <div className="flex flex-col bg-transparent shrink-0" style={{ width: '400px' }}>
                  <div className="text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-widest text-center animate-pulse">
                     {'<--'} Anchura Ficha WYSIWYG (400px) {'-->'}
                  </div>
                  <div className="flex-1 flex flex-col shadow-lg border border-[#c1ccdb] rounded overflow-hidden bg-white">
                      {/* ZONA 9 (CABECERA Y LENTE) */}
                      <div className="shrink-0 z-10" style={{ minHeight: '80px' }}>
                          <PSetZone9 
                             screenId="sandbox"
                             contextPayload={displayGroups} 
                             phaseIds={selectedPhases}
                             deptIds={selectedDepts}
                          />
                      </div>
                      
                      <div className="h-1.5 w-full bg-slate-300 shrink-0"></div>

                      {/* ZONA 10 (PROPIEDADES RECIPIENTE) */}
                      <div className="flex-1 min-h-0 relative z-0 flex flex-col bg-white">
                          <PSetZone10 
                             screenId="sandbox"
                             contextPayload={displayGroups} 
                             phaseIds={selectedPhases}
                             deptIds={selectedDepts}
                             mockPsetsDef={mockPsetsDef}
                             mockPsetValues={mockPsetValues}
                          />
                      </div>
                  </div>
              </div>

          </div>
      </main>
    </div>
  );
};

