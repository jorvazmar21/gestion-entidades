/**
 * @file IngestionWizard.tsx
 * @description Translucent Mobile-Sized Wizard for L-Matrix Data Injection.
 * 
 * =========================================================================
 * 🚨 DIRECTIVA CRÍTICA PARA INTELIGENCIAS ARTIFICIALES FUTURAS 🚨
 * =========================================================================
 * 1. [AGNOSTIC_DESIGN]: This UI component is entity-agnostic. DO NOT hardcode
 *    SQLite entity insertions here. If you need a new shape, alter the generic
 *    state or the backend PSet logic. 
 * 2. [ATOMIC_TRANSACTIONS]: The mass ingestion heavily relies on the CSV file
 *    upload matching the `schema_code` perfectly. NEVER slice the CSV or send
 *    instances one-by-one. Send the whole array to `/api/instances/bulk` so
 *    NodeJS manages the SQL BEGIN/COMMIT wrapper. "All or Nothing".
 * 3. [TRANSACCIÓN_UTE]: The Phase 4 (Sub-Wizard) iterates over the newly created L4
 *    entities if they are 'UTE'. It sends the compositional arrays in a separate API call
 *    AFTER the Bulk API confirms success.
 * =========================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDataStore } from '../../store/useDataStore';

interface WizardProps {
    onClose: () => void;
    onSuccess: () => void;
}

type WizardStep = 'SELECT_ENTITY' | 'SELECT_MODE' | 'MASSIVE_INPUT' | 'INDIVIDUAL_INPUT' | 'UTE_PROMPT' | 'UTE_LINKING';
type EntityType = 'L1_EMP' | 'L1_OBR' | null;
type InitMode = 'MASSIVE' | 'INDIVIDUAL' | null;

export const IngestionWizard: React.FC<WizardProps> = ({ onClose, onSuccess }) => {
    // ---- Zustand Store ----
    const l1_categories = useDataStore((s: any) => s.l1_categories) || [];
    const db = useDataStore((s: any) => s.db) || [];
    const initStore = useDataStore((s: any) => s.init);

    // ---- Step & Context ----
    const [step, setStep] = useState<WizardStep>('SELECT_ENTITY');
    const [entityTarget, setEntityTarget] = useState<EntityType>(null);
    const [mode, setMode] = useState<InitMode>(null);

    // ---- Status Feedback ----
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---- MASSIVE STATE ----
    const [pastedText, setPastedText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ---- INDIVIDUAL STATE ----
    const [indCode, setIndCode] = useState('');
    const [indName, setIndName] = useState('');
    const [indCif, setIndCif] = useState('');
    const [indIsUte, setIndIsUte] = useState(false);

    // ---- UTE LINKING STATE ----
    const [newUtesToLink, setNewUtesToLink] = useState<{ l4_id: string, name: string }[]>([]);
    const [currentUteIndex, setCurrentUteIndex] = useState(0);
    // Ute Composition transient state
    const [uteComposition, setUteComposition] = useState<{ fk_empresa: string, percentage: number, textRaw: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const proceedToMode = (ent: EntityType) => {
        setEntityTarget(ent);
        setStep('SELECT_MODE');
    };

    const downloadTemplate = async () => {
        try {
            window.open(`http://localhost:3000/api/templates/download?schema_code=${entityTarget}`, '_blank');
        } catch (e: any) {
            setError("No hay plantilla definida para esta entidad.");
        }
    };

    // --- INGESTION API LOGIC ---
    const executeBulkInjection = async (instances: any[], closeAfter: boolean = true) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Endpoint Bulk Transaccional (Todo o Nada)
            const resp = await fetch('http://localhost:3000/api/instances/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entityType: entityTarget,
                    instances: instances
                })
            });

            const respData = await resp.json();
            if (!resp.ok) {
                throw new Error(respData.error || "Transacción fallida.");
            }

            // Exito Total! Buscar si alguna de estas era UTE utilizando las respuestas inyectadas.
            const serverInstances = respData.instances || instances;
            // Evaluamos la trazabilidad segura desde Backend (fk_l3 o inference param) o la local
            const insertedUtes = serverInstances.filter((i: any) => String(i.assigned_fk_l3) === '1' || i.esUte === true || String(i.esUte) === 'true')
                .map((i: any) => ({ l4_id: i.l4_id, name: i.instance_name }));

            await initStore(); // Reload Grids instantly
            setIsSubmitting(false);

            if (insertedUtes.length > 0) {
                setNewUtesToLink(insertedUtes);
                setStep('UTE_PROMPT');
            } else {
                setSuccessMsg(`Registro inyectado correctamente en SQLite.`);
                if (closeAfter) {
                    setTimeout(onClose, 2000);
                } else {
                    // Guardar y Nuevo: Vaciamos el estado para el siguiente alta estática
                    setIndCode('');
                    setIndName('');
                    setIndCif('');
                    setIndIsUte(false);
                    // Fade out the success message silently after 3 seconds
                    setTimeout(() => setSuccessMsg(null), 3000);
                }
            }
        } catch (err: any) {
            setIsSubmitting(false);
            setError(`Error de Arquitectura: ${err.message}`);
        }
    };

    const commitMassive = async () => {
        try {
            let csvBody = pastedText.trim();
            if (!csvBody) throw new Error("Debes pegar texto CSV delimitado por punto y coma.");

            const rows = csvBody.split('\n').filter(r => r.trim().length > 0);
            if (rows.length < 2) throw new Error("Asegúrate de pegar al menos las cabeceras y una línea de datos.");

            const headers = rows[0].split(';');
            const instances = rows.slice(1).map(rowStr => {
                const cols = rowStr.split(';');
                let obj: any = {};
                headers.forEach((h, i) => obj[h.trim()] = cols[i] ? cols[i].trim() : "");
                return obj;
            });

            await executeBulkInjection(instances, true);
        } catch (err: any) {
            setError(`Error de Arquitectura: ${err.message}`);
        }
    };

    const commitIndividual = async (closeAfter: boolean) => {
        if (!indCode || !indName) {
            setError("Identificador y Razón Social son obligatorios.");
            return;
        }

        const instances = [{
            l4_id: "", // Delega al Backend auto-gen
            unique_human_code: indCode,
            instance_name: indName,
            esUte: indIsUte ? true : false,
            cif: indCif || ""
        }];

        await executeBulkInjection(instances, closeAfter);
    };

    // --- UTE LINKING (SUB-WIZARD) ---
    const attachUteComposition = async () => {
        const currentUte = newUtesToLink[currentUteIndex];
        const payloadJson = {
            socios: uteComposition.map(u => ({ fk_empresa: u.fk_empresa, porcentaje: u.percentage })),
            avisoUte: true
        };

        try {
            // Guardar Composition en PSet 5
            const resp = await fetch('http://localhost:3000/api/instances/put', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    l4_instance_id: currentUte.l4_id,
                    fk_pset: 5,
                    json_payload: payloadJson,
                    __v: 1
                })
            });

            // Pasamos a la siguiente UTE del lote
            if (currentUteIndex + 1 < newUtesToLink.length) {
                setCurrentUteIndex(currentUteIndex + 1);
                setUteComposition([]);
                setSearchTerm('');
            } else {
                setSuccessMsg('Configuración UTEs de Lote Ingestado Finalizada.');
                setTimeout(onClose, 2000);
            }
        } catch (e: any) {
            setError(`Error Guardando Socios: ${e.message}`);
        }
    };

    // --- Renderizado UI: The Sovereign Analyst Mobile Design ---
    const totalSteps = 4;
    let currentStepNum = 1;
    if (step === 'SELECT_MODE') currentStepNum = 2;
    if (step === 'MASSIVE_INPUT' || step === 'INDIVIDUAL_INPUT' || step === 'UTE_PROMPT') currentStepNum = 3;
    if (step === 'UTE_LINKING') currentStepNum = 4;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-slate-900/40 p-4 transition-all overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* The Floating Canvas (Strict Mobile Aspect Ratio ~ 400x800) */}
            <div className="relative bg-[#ffffff] dark:bg-[#191c20] shadow-[0_24px_60px_-15px_rgba(95,3,10,0.15)] rounded-2xl flex flex-col w-full max-w-[400px] h-[85vh] max-h-[850px] overflow-hidden">

                {/* Header Navbar - No borders, just tonal shift */}
                <div className="bg-[#f2f3f9] dark:bg-[#2e3135] px-6 py-5 flex flex-col justify-between shrink-0 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-[0.05em] text-[#5f030a] dark:text-[#ffb3ad]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            Ingestion Wizard
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-[#5f030a] dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
                    </div>
                    {/* Progress Indicator (Step X of 4) */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map(idx => (
                            <div key={idx} className={`h-1 flex-1 rounded-full ${idx <= currentStepNum ? 'bg-[#5f030a] dark:bg-[#ea6c66]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        ))}
                    </div>
                    <p className="text-[10px] mt-2 uppercase tracking-widest text-slate-500 font-bold">Paso {currentStepNum} de {totalSteps}</p>
                </div>

                {/* Body Content - Overflow Scroll */}
                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6 text-[#191c20] dark:text-[#f8f9ff]">

                    {error && <div className="bg-[#ffdad6]/20 border-l-2 border-[#ba1a1a] text-[#ba1a1a] dark:text-[#ffb3ad] text-xs p-3 rounded-none font-mono">⚠ {error}</div>}
                    {successMsg && <div className="bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 text-xs p-3 rounded-none font-mono">✓ {successMsg}</div>}

                    {step === 'SELECT_ENTITY' && (
                        <div className="flex flex-col gap-5 animate-fade-in flex-1">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Tipo de Entidad</h3>
                                <p className="text-sm text-[#574240] dark:text-[#bdc7d9] mt-1">Seleccione el dataset objetivo.</p>
                            </div>

                            {/* Giant Primary Button - Crimson Gradient */}
                            <div className="flex-1 flex items-center justify-center min-h-[160px]">
                                <button
                                    onClick={() => proceedToMode('L1_EMP')}
                                    className="w-full h-full rounded-2xl bg-gradient-to-br from-[#5f030a] to-[#390003] shadow-[0_4px_20px_0_rgba(95,3,10,0.3)] hover:shadow-[0_8px_30px_0_rgba(95,3,10,0.5)] transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-4xl">🏢</span>
                                    <span className="text-white font-bold tracking-widest uppercase text-2xl" style={{ fontFamily: "'Manrope', sans-serif" }}>Empresas</span>
                                    <span className="text-[#ffdad7] text-xs font-medium tracking-wide">Constructoras y Socios</span>
                                </button>
                            </div>

                            <button disabled className="p-5 rounded-xl bg-[#f2f3f9] dark:bg-[#2e3135] opacity-50 flex items-center gap-4 cursor-not-allowed">
                                <span className="text-2xl grayscale">🚧</span>
                                <div className="text-left"><p className="font-bold text-sm">Centros de Coste (Obras)</p><p className="text-[11px] uppercase tracking-wider mt-1">Bloqueado</p></div>
                            </button>
                        </div>
                    )}

                    {step === 'SELECT_MODE' && (
                        <div className="flex flex-col gap-6 animate-fade-in flex-1">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Método de Carga</h3>
                                    <p className="text-sm text-[#574240] dark:text-[#bdc7d9]">Selecciona canal volumétrico.</p>
                                </div>
                                <button onClick={() => setStep('SELECT_ENTITY')} className="text-xs font-bold text-[#5f030a] dark:text-[#ea6c66] uppercase tracking-wide">Volver</button>
                            </div>

                            <button onClick={() => { setMode('INDIVIDUAL'); setStep('INDIVIDUAL_INPUT'); }} className="p-6 rounded-2xl bg-[#ffffff] dark:bg-[#191c20] shadow-[0_4px_20px_rgba(25,28,32,0.06)] hover:shadow-[0_8px_25px_rgba(25,28,32,0.12)] border border-slate-100 dark:border-slate-800 transition-all text-left group flex flex-col gap-2">
                                <p className="font-bold text-lg group-hover:text-[#5f030a] dark:group-hover:text-[#ea6c66] transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>Carga Individual</p>
                                <p className="text-xs text-[#574240] dark:text-slate-400 leading-relaxed">Entrada manual formulario-a-formulario. Ideal para altas singulares ultra-supervisadas.</p>
                            </button>

                            <button onClick={() => { setMode('MASSIVE'); setStep('MASSIVE_INPUT'); }} className="p-6 rounded-2xl bg-[#f2f3f9] dark:bg-[#2e3135] hover:bg-[#eceef3] dark:hover:bg-[#3d4756] transition-all text-left flex flex-col gap-2 border border-transparent">
                                <p className="font-bold text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>Carga Masiva (CSV)</p>
                                <p className="text-xs text-[#574240] dark:text-slate-400 leading-relaxed">Inserción atómica. Pega la matriz delimitada por punto y coma y forja el diccionario de golpe.</p>
                            </button>
                        </div>
                    )}

                    {step === 'MASSIVE_INPUT' && (
                        <div className="flex flex-col gap-4 animate-fade-in flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Carga Masiva</h3>
                                <button onClick={() => setStep('SELECT_MODE')} className="text-xs font-bold text-[#5f030a] dark:text-[#ea6c66] uppercase tracking-wide">Volver</button>
                            </div>

                            <button onClick={downloadTemplate} className="w-full text-[10px] font-bold uppercase tracking-widest bg-[#f2f3f9] dark:bg-[#2e3135] hover:bg-[#eceef3] dark:hover:bg-slate-700 py-3 rounded-xl text-[#390003] dark:text-[#ffdad7] transition-colors flex justify-center items-center gap-2">
                                <span>Descargar Plantilla CSV</span>
                            </button>

                            <div className="flex-1 min-h-[150px] relative rounded-xl overflow-hidden shadow-inner bg-[#f8f9ff] dark:bg-[#121c29]">
                                <textarea
                                    className="w-full h-full bg-transparent p-4 text-[11px] font-mono text-[#191c20] dark:text-[#bdc7d9] placeholder:text-slate-400 focus:outline-none resize-none"
                                    placeholder="unique_human_code;instance_name;es_ute;cif&#10;EMP-99;Mi Empresa S.L;NO;ES12345&#10;EMP-100;UTE Acero y Piedra;SI;ES00000"
                                    value={pastedText}
                                    onChange={(e) => setPastedText(e.target.value)}
                                ></textarea>
                            </div>

                            <button onClick={commitMassive} disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#5f030a] to-[#390003] hover:from-[#390003] hover:to-[#5f030a] disabled:opacity-50 text-white font-bold py-4 mt-auto rounded-xl uppercase tracking-[0.1em] text-sm transition-all shadow-[0_4px_15px_rgba(95,3,10,0.4)]">
                                {isSubmitting ? 'INYECTANDO...' : 'PROCESAR MATRIZ'}
                            </button>
                        </div>
                    )}

                    {step === 'INDIVIDUAL_INPUT' && (
                        <div className="flex flex-col gap-5 animate-fade-in flex-1 pb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Forjar Entidad</h3>
                                <button onClick={() => setStep('SELECT_MODE')} className="text-xs font-bold text-[#5f030a] dark:text-[#ea6c66] uppercase tracking-wide">Volver</button>
                            </div>

                            {/* Minimalist Bottom-Accent Inputs */}
                            <div className="flex flex-col gap-1 relative pt-2">
                                <label className="text-[9px] uppercase font-bold tracking-[0.1em] text-[#5b6575] dark:text-slate-400">Identificador Único</label>
                                <input value={indCode} onChange={(e) => setIndCode(e.target.value)} placeholder="Ej: EMP-999" className="bg-transparent border-0 border-b-2 border-[#dec0bd] dark:border-slate-700/50 rounded-none px-0 py-2 text-sm text-[#191c20] dark:text-white focus:ring-0 focus:border-[#5f030a] dark:focus:border-[#ea6c66] transition-colors" />
                            </div>
                            <div className="flex flex-col gap-1 relative pt-2">
                                <label className="text-[9px] uppercase font-bold tracking-[0.1em] text-[#5b6575] dark:text-slate-400">Nombre / Razón Social</label>
                                <input value={indName} onChange={(e) => setIndName(e.target.value)} placeholder="Ej: Acero y Raíl S.A" className="bg-transparent border-0 border-b-2 border-[#dec0bd] dark:border-slate-700/50 rounded-none px-0 py-2 text-sm text-[#191c20] dark:text-white focus:ring-0 focus:border-[#5f030a] dark:focus:border-[#ea6c66] transition-colors" />
                            </div>
                            <div className="flex flex-col gap-1 relative pt-2">
                                <label className="text-[9px] uppercase font-bold tracking-[0.1em] text-[#5b6575] dark:text-slate-400">C.I.F Fiscal</label>
                                <input value={indCif} onChange={(e) => setIndCif(e.target.value)} placeholder="A-1234567" className="bg-transparent border-0 border-b-2 border-[#dec0bd] dark:border-slate-700/50 rounded-none px-0 py-2 text-sm text-[#191c20] dark:text-white focus:ring-0 focus:border-[#5f030a] dark:focus:border-[#ea6c66] transition-colors" />
                            </div>

                            {/* UTE Stylized Switch Area */}
                            <div className="mt-4 bg-[#f2f3f9] dark:bg-[#2e3135] rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="pr-4">
                                    <p className="text-sm font-bold text-[#191c20] dark:text-white">Agrupación UTE</p>
                                    <p className="text-[10px] text-[#574240] dark:text-slate-400 mt-1 leading-tight">Requiere asignación porcentual post-inserción.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" checked={indIsUte} onChange={e => setIndIsUte(e.target.checked)} />
                                    <div className="w-11 h-6 bg-[#dec0bd] peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5f030a] dark:peer-checked:bg-[#ea6c66]"></div>
                                </label>
                            </div>
                            {indIsUte ? (
                                <div className="mt-auto pt-4 relative group perspective-1000">
                                    <button onClick={() => commitIndividual(true)} disabled={isSubmitting || !indCode || !indName} className="w-full bg-gradient-to-r from-[#5f030a] to-[#390003] hover:from-[#6a050e] hover:to-[#4a0206] disabled:opacity-30 disabled:grayscale text-white font-bold py-4 rounded-xl uppercase tracking-[0.1em] text-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_4px_15px_rgba(95,3,10,0.3)] hover:shadow-[0_12px_30px_rgba(95,3,10,0.5)] flex justify-center items-center gap-3 active:scale-95 hover:-translate-y-1">
                                        {isSubmitting ? 'PROCESANDO...' : 'SOCIOS UTE ➡️'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 mt-auto pt-4 relative">
                                    <button onClick={() => commitIndividual(false)} disabled={isSubmitting || !indCode || !indName} className="w-full bg-transparent border-[1.5px] border-[#5f030a]/20 dark:border-[#ea6c66]/20 hover:border-[#5f030a]/60 dark:hover:border-[#ea6c66]/60 hover:bg-[#5f030a]/5 dark:hover:bg-[#ea6c66]/10 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-transparent text-[#5f030a] dark:text-[#ea6c66] font-bold py-[15px] rounded-xl uppercase tracking-[0.1em] text-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_8px_20px_rgba(95,3,10,0.1)] flex justify-center items-center active:scale-95 hover:-translate-y-[2px]">
                                        {isSubmitting ? '...' : 'Guardar y Nuevo'}
                                    </button>
                                    <button onClick={() => commitIndividual(true)} disabled={isSubmitting || !indCode || !indName} className="w-full bg-gradient-to-r from-[#5f030a] to-[#390003] hover:from-[#6a050e] hover:to-[#4a0206] disabled:opacity-30 disabled:grayscale text-white font-bold py-4 rounded-xl uppercase tracking-[0.1em] text-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_4px_15px_rgba(95,3,10,0.3)] hover:shadow-[0_12px_30px_rgba(95,3,10,0.5)] flex justify-center items-center active:scale-95 hover:-translate-y-1">
                                        {isSubmitting ? '...' : 'Guardar y Salir'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'UTE_PROMPT' && (
                        <div className="flex flex-col items-center justify-center gap-4 animate-fade-in flex-1 text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-[#f2f3f9] dark:bg-[#2e3135] flex items-center justify-center text-3xl shadow-inner mb-2">🖇️</div>
                            <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Nodos Compuestos</h3>
                            <p className="text-sm text-[#574240] dark:text-[#bdc7d9] px-2 leading-relaxed">
                                Se requiere desglosar el capital social para <strong>{newUtesToLink.length} UTEs</strong> atadas en el bloque inicial.
                            </p>

                            <button onClick={() => setStep('UTE_LINKING')} className="w-full bg-[#191c20] dark:bg-[#f8f9ff] text-white dark:text-[#191c20] font-bold py-4 rounded-xl mt-6 uppercase tracking-[0.1em] text-sm shadow-xl transition-transform hover:scale-[1.02]">
                                DEFINIR COMPOSICIÓN
                            </button>
                            <button onClick={onClose} className="text-[10px] text-[#8a716f] dark:text-slate-500 hover:text-black dark:hover:text-white uppercase font-bold tracking-wide mt-2 transition-colors">
                                IGNORAR (NO RECOMENDADO)
                            </button>
                        </div>
                    )}

                    {step === 'UTE_LINKING' && newUtesToLink.length > 0 && (
                        <div className="flex flex-col gap-4 animate-fade-in flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>Sociología UTE</h3>
                                <span className="bg-[#f2f3f9] dark:bg-[#2e3135] text-[#5f030a] dark:text-[#ea6c66] text-[10px] font-bold py-1 px-3 rounded-full">
                                    {currentUteIndex + 1} / {newUtesToLink.length}
                                </span>
                            </div>

                            <div className="bg-[#f2f3f9] dark:bg-[#2e3135] p-5 rounded-2xl shadow-sm relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f030a] dark:bg-[#ea6c66]" />
                                <p className="text-[9px] text-[#5b6575] dark:text-slate-400 uppercase tracking-widest font-bold">Matriz Destino</p>
                                <p className="font-bold text-lg text-[#191c20] dark:text-white mt-1 leading-tight">{newUtesToLink[currentUteIndex].name}</p>
                            </div>

                            {/* Arrays Socios - Tonal Depth List */}
                            <div className="flex flex-col gap-2 flex-1 mt-2">
                                {uteComposition.map((socio, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-[#ffffff] dark:bg-[#121c29] px-4 py-3 rounded-xl border border-[#eceef3] dark:border-slate-800/60 shadow-[0_2px_8px_rgba(25,28,32,0.04)] text-sm">
                                        <span className="truncate max-w-[200px] font-medium text-[#191c20] dark:text-slate-200">{socio.textRaw}</span>
                                        <div className="bg-[#f2f3f9] dark:bg-[#2e3135] px-2 py-1 rounded-md text-[#5f030a] dark:text-[#ea6c66] font-bold font-mono text-[11px]">
                                            {socio.percentage}%
                                        </div>
                                    </div>
                                ))}
                                {uteComposition.length === 0 && <p className="text-center text-[11px] text-[#5b6575] dark:text-slate-500 py-6 italic">Sin socios definidos</p>}
                            </div>

                            {/* Buscador y Adición */}
                            <div className="flex gap-2 relative mt-auto">
                                <input
                                    className="flex-1 bg-[#f2f3f9] dark:bg-[#121c29] border-none rounded-xl px-4 py-3 text-sm text-[#191c20] dark:text-white focus:ring-1 focus:ring-[#5f030a] dark:focus:ring-[#ea6c66]"
                                    placeholder="Buscar socia..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="w-[60px] bg-[#f2f3f9] dark:bg-[#121c29] border-none rounded-xl px-2 text-center text-sm font-bold font-mono focus:ring-1 focus:ring-[#5f030a] dark:focus:ring-[#ea6c66]"
                                    placeholder="%"
                                    id="tmpPerc"
                                />
                                <button
                                    className="bg-[#191c20] dark:bg-white text-white dark:text-black w-12 rounded-xl font-bold flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                                    onClick={() => {
                                        const perc = Number((document.getElementById('tmpPerc') as HTMLInputElement).value || 0);
                                        const found = db.find((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
                                        if (found && perc > 0) {
                                            setUteComposition([...uteComposition, { fk_empresa: found.id, percentage: perc, textRaw: found.name }]);
                                            setSearchTerm('');
                                            (document.getElementById('tmpPerc') as HTMLInputElement).value = '';
                                        } else {
                                            setError("Empresa no encontrada o porcentaje 0.");
                                        }
                                    }}
                                >+</button>
                            </div>

                            <button onClick={attachUteComposition} className="w-full bg-gradient-to-r from-[#5f030a] to-[#390003] text-white font-bold py-4 mt-2 rounded-xl uppercase tracking-[0.1em] text-sm shadow-[0_4px_15px_rgba(95,3,10,0.4)] hover:from-[#390003] hover:to-[#5f030a] transition-all">
                                ATAR {uteComposition.length} SOCIETARIO(S)
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default IngestionWizard;
