import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse';
import { useDataStore } from '../../store/useDataStore';
import { generateCSVTemplate, downloadCSV } from '../../hooks/useCSVTemplateGenerator';
import { validateImportData } from '../../hooks/useCSVValidator';
import type { ValidationErrorTree, ValidationResult } from '../../hooks/useCSVValidator';
import { ErrorTreeViewer } from './ErrorTreeViewer';
import type { Entity } from '../../types';

interface ImportWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMoldeId: string | null;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({ isOpen, onClose, initialMoldeId }) => {
    const db = useDataStore(state => state.db);
    const tiposEntidadDb = useDataStore(state => state.tiposEntidadDb);
    const psets_def = useDataStore(state => state.psets_def);
    const addEntities = useDataStore(state => state.addEntities);

    const [step, setStep] = useState(1);

    // Step 1 State
    const [selectedMoldeId, setSelectedMoldeId] = useState<string>('');
    const [selectedStaticPsets, setSelectedStaticPsets] = useState<string[]>([]);
    const [selectedDynamicPsets, setSelectedDynamicPsets] = useState<string[]>([]);

    // Step 3 State
    const [fileName, setFileName] = useState<string | null>(null);

    // Step 4 State
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Sync
    useEffect(() => {
        if (isOpen) {
            setSelectedMoldeId(initialMoldeId || tiposEntidadDb[0]?.id_tipo || '');
            setStep(1);
            setSelectedStaticPsets([]);
            setSelectedDynamicPsets([]);
            setFileName(null);
            setValidationResult(null);
        }
    }, [isOpen, initialMoldeId, tiposEntidadDb]);

    if (!isOpen) return null;

    // Computed Options for Step 1
    const availableStaticPsets = psets_def.filter((p: any) => p.tipo !== 'DINAMICO');
    const availableDynamicPsets = psets_def.filter((p: any) => p.tipo === 'DINAMICO');

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleDownloadTemplate = () => {
        const csvContent = generateCSVTemplate(selectedMoldeId, selectedStaticPsets, selectedDynamicPsets);
        downloadCSV(`Plantilla_${selectedMoldeId}.csv`, csvContent);
        handleNext(); // Move to Step 3 automatically
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {

                // Trigger Validation
                const result = validateImportData(results.data, selectedMoldeId, db);
                setValidationResult(result);
                setStep(4);
            },
            error: (err: any) => {
                alert("Error crítico parseando el CSV: " + err.message);
            }
        });
    };

    const handleImportSubmit = () => {
        if (validationResult && validationResult.isValid) {
            // Re-map the raw parsed JSONs into real Entities
            const newEntities: Entity[] = validationResult.parsedEntities.map(pe => ({
                id: pe.data.id_entidad || `NEW-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                level: tiposEntidadDb.find(t => t.id_tipo === selectedMoldeId)?.nivel || 'L1',
                category: tiposEntidadDb.find(t => t.id_tipo === selectedMoldeId)?.categoria || 'General',
                subCategory: '',
                type: selectedMoldeId,
                code: pe.data.codigo,
                name: pe.data.nombre,
                location: '',
                canal: 'ESTUDIO',
                parentId: pe.data.id_padre || null,
                isActive: true,
                deletedAt: null,
                deletedBy: '',
                createdAt: new Date().toISOString(),
                createdBy: 'IMPORT',
                updatedAt: new Date().toISOString(),
                updatedBy: 'IMPORT'
            }));

            // TODO: Also map PSet data into useDataStore (for now, just entities)
            addEntities(newEntities);

            // Close the wizard
            onClose();
            alert(`¡Importación exitosa! Se han cargado ${newEntities.length} registros en la memoria caché RAM. Recuerde pulsar 'Guardar Base de Datos' para consolidarlos.`);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col overflow-hidden font-['Inter']">

                {/* Header */}
                <div className="bg-[#1e293b] text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold uppercase tracking-wider">Asistente de Carga Masiva de Datos (CSV)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex bg-gray-100 border-b border-gray-200 shrink-0">
                    {[
                        { id: 1, label: '1. Objetivo' },
                        { id: 2, label: '2. Plantilla' },
                        { id: 3, label: '3. Carga' },
                        { id: 4, label: '4. Validación' }
                    ].map(st => (
                        <div key={st.id} className={`flex-1 py-3 text-center text-[11px] font-bold uppercase tracking-widest ${step === st.id ? 'bg-white text-[#7f1d1d] border-b-2 border-[#7f1d1d]' : step > st.id ? 'text-gray-500' : 'text-gray-400'}`}>
                            {st.label}
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col">

                    {/* STEP 1: TARGET */}
                    {step === 1 && (
                        <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">1. Entidad Principal (Molde base)</label>
                                <select
                                    value={selectedMoldeId}
                                    onChange={e => setSelectedMoldeId(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#7f1d1d] outline-none"
                                >
                                    {tiposEntidadDb.map(t => (
                                        <option key={t.id_tipo} value={t.id_tipo}>{t.nombre} ({t.id_tipo})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">Selecciona en qué caja estructural quieres volcar estos datos. Esto determinará las columnas troncales obligatorias.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Static PSets Block */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center justify-between border-b pb-2">
                                        PSets Estáticos
                                        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">Opcional</span>
                                    </h3>
                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                                        {availableStaticPsets.map(p => (
                                            <label key={p.id_pset} className="flex items-start gap-2 text-sm cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 cursor-pointer accent-[#7f1d1d]"
                                                    checked={selectedStaticPsets.includes(p.id_pset)}
                                                    onChange={e => {
                                                        if (e.target.checked) setSelectedStaticPsets(prev => [...prev, p.id_pset]);
                                                        else setSelectedStaticPsets(prev => prev.filter(x => x !== p.id_pset));
                                                    }}
                                                />
                                                <span className="text-gray-700 group-hover:text-black">{(p as any).nombre}</span>
                                            </label>
                                        ))}
                                        {availableStaticPsets.length === 0 && <span className="text-xs text-gray-400 italic">No hay PSets estáticos disponibles.</span>}
                                    </div>
                                </div>

                                {/* Dynamic PSets Block */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center justify-between border-b pb-2">
                                        PSets Dinámicos
                                        <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full">Histórico</span>
                                    </h3>
                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                                        {availableDynamicPsets.map(p => (
                                            <label key={p.id_pset} className="flex items-start gap-2 text-sm cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 flex-shrink-0 cursor-pointer accent-[#7f1d1d]"
                                                    checked={selectedDynamicPsets.includes(p.id_pset)}
                                                    onChange={e => {
                                                        if (e.target.checked) setSelectedDynamicPsets(prev => [...prev, p.id_pset]);
                                                        else setSelectedDynamicPsets(prev => prev.filter(x => x !== p.id_pset));
                                                    }}
                                                />
                                                <span className="text-gray-700 group-hover:text-black">{(p as any).nombre}</span>
                                            </label>
                                        ))}
                                        {availableDynamicPsets.length === 0 && <span className="text-xs text-gray-400 italic">No hay PSets dinámicos.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: TEMPLATE GENERATOR */}
                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center flex-1 h-full gap-5 animate-[fadeIn_0.3s_ease-out] py-10">
                            <div className="w-16 h-16 bg-[#f1f5f9] text-[#475569] rounded-2xl flex items-center justify-center border-2 border-[#cbd5e1]">
                                <span className="text-3xl">📄</span>
                            </div>
                            <div className="text-center max-w-md">
                                <h3 className="text-lg font-bold text-gray-800">Plantilla CSV a medida</h3>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                    Hemos generado una estructura exacta con cabeceras estrictas para soportar el Molde <strong>{selectedMoldeId}</strong>
                                    {selectedStaticPsets.length > 0 && ` y ${selectedStaticPsets.length} PSets estáticos`}
                                    {selectedDynamicPsets.length > 0 && ` y ${selectedDynamicPsets.length} dinámicos`}.
                                </p>
                            </div>
                            <button
                                onClick={handleDownloadTemplate}
                                className="mt-4 bg-[#1e293b] hover:bg-[#0f172a] text-white px-8 py-3 rounded-lg font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
                            >
                                <span>⬇️</span> DESCARGAR PLANTILLA VACÍA
                            </button>
                            <button onClick={() => setStep(3)} className="text-xs text-[#7f1d1d] hover:underline mt-2">
                                Ya tengo mi archivo rellenado, saltar este paso
                            </button>
                        </div>
                    )}

                    {/* STEP 3: UPLOAD */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center flex-1 h-full gap-5 animate-[fadeIn_0.3s_ease-out] py-10">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-200">
                                <span className="text-3xl">📤</span>
                            </div>
                            <div className="text-center max-w-md mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Sube tu archivo .CSV</h3>
                                <p className="text-sm text-gray-600 mt-2">Asegúrate de haber guardado el Excel en formato "CSV (delimitado por comas o punto y coma)" y que la codificación sea preferiblemente UTF-8.</p>
                            </div>

                            <input
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white px-8 py-3 rounded-lg font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
                            >
                                <span>📁</span> SELECCIONAR ARCHIVO CSV
                            </button>

                            {fileName && <p className="text-sm font-medium mt-4 text-gray-800">Archivo seleccionado: {fileName}</p>}
                        </div>
                    )}

                    {/* STEP 4: VALIDATION */}
                    {step === 4 && validationResult && (
                        <div className="flex flex-col w-full h-full animate-[fadeIn_0.3s_ease-out]">
                            <ErrorTreeViewer errors={validationResult.errors} />
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="bg-white border-t border-gray-200 p-4 flex justify-between shrink-0">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || step === 4}
                        className="px-6 py-2 border border-gray-300 rounded font-bold text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Atrás
                    </button>

                    {step === 4 ? (
                        <button
                            onClick={handleImportSubmit}
                            disabled={!validationResult?.isValid}
                            className={`px-8 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm transition-all ${validationResult?.isValid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            PROCEDER CON LA IMPORTACIÓN
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={step === 2 || step === 3} // Next manually explicitly blocked on 2 and 3
                            className="px-6 py-2 bg-[#1e293b] text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-[#0f172a] disabled:opacity-30 disabled:cursor-not-allowed hidden"
                        >
                            Siguiente
                        </button>
                    )}
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
