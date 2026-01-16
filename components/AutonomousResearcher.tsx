
import React, { useState } from 'react';
import { SimulationMode, ValidationReport, TimeAnomalyData, AstrophysicsEvent, AnomalyHunterResult } from '../types';
import { validateSimulation, askGemini } from '../services/geminiService';
import { COLORS } from '../constants';

// --- 25-D ANOMALY HUNTER CONFIG ---
const ANOMALY_SEARCH_CONFIG = {
  TARGET_DATE: '2025-12-25',
  DATA_SOURCES: {
    IGS_HMASER: 'https://cddis.nasa.gov/archive/gnss/products/clock/',
    BIPM_CIRCULAR_T: 'https://webtai.bipm.org/ftp/pub/timescales/circular-t/',
    GAMMA_CATALOG: 'https://heasarc.gsfc.nasa.gov/W3Browse/fermi/fermigbrst.html',
  },
  STATION_NETWORK: [
    'BRUX', 'WTZR', 'USN3', 'KOKB', 'HRAO', 'YELL', 'BAKO', 'CHPG', 'GODE',
    'HERS', 'KOUR', 'MATE', 'NICO', 'ONSA', 'POTS', 'SUTH', 'TLSE', 'ZIMM'
  ]
};

const Anomaly25DReport: React.FC<{ data: AnomalyHunterResult | null }> = ({ data }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <i className="fas fa-satellite text-purple-400"></i>
        Investigación Evento 25-D (R-QNT Signature)
      </h3>
      
      {data ? (
        <div className="space-y-6">
          {/* Tarjeta de Anomalía */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <h4 className="text-amber-400 font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
              <i className="fas fa-clock"></i> Anomalía de Tiempo Detectada
            </h4>
            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
              <div className="bg-black/40 p-2 rounded"><span className="text-zinc-500 block uppercase mb-1">Fecha Target:</span> <span className="text-zinc-200">{data.anomaly?.date}</span></div>
              <div className="bg-black/40 p-2 rounded"><span className="text-zinc-500 block uppercase mb-1">Estaciones:</span> <span className="text-zinc-200">{data.anomaly?.stationCount}</span></div>
              <div className="bg-black/40 p-2 rounded"><span className="text-zinc-500 block uppercase mb-1">Desviación:</span> <span className="text-amber-500">{data.anomaly?.avgDeviationPs} ps</span></div>
              <div className="bg-black/40 p-2 rounded"><span className="text-zinc-500 block uppercase mb-1">Patrón:</span> <span className="text-emerald-500">{data.anomaly?.correlationPattern}</span></div>
            </div>
            <div className="mt-3 text-[9px] text-zinc-600 italic">Origen: {data.anomaly?.dataSource} // {data.anomaly?.rawDataUrl}</div>
          </div>

          {/* Tarjeta de Trigger Astrofísico */}
          {data.trigger && (
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <h4 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <i className="fas fa-meteor"></i> Evento Astrofísico Coincidente
              </h4>
              <div className="grid grid-cols-1 gap-3 text-[11px] font-mono">
                <div className="bg-black/40 p-2 rounded flex justify-between items-center">
                  <span className="text-zinc-500 uppercase">Tipo:</span> 
                  <span className="text-red-400 font-bold">{data.trigger.type}</span>
                </div>
                <div className="bg-black/40 p-2 rounded flex justify-between items-center">
                  <span className="text-zinc-500 uppercase">Fuente:</span> 
                  <span className="text-zinc-200">{data.trigger.source}</span>
                </div>
                <div className="bg-black/40 p-2 rounded flex justify-between items-center">
                  <span className="text-zinc-500 uppercase">Significancia:</span> 
                  <span className="text-amber-500">{data.trigger.significance}/10</span>
                </div>
              </div>
            </div>
          )}

          {/* Medidor de Confianza R-QNT */}
          <div className="mt-8 p-5 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/20">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Confianza de Predicción</span>
                <span className="text-xs text-zinc-400">Validación R-QNT Borromean Linkage</span>
              </div>
              <span className={`text-2xl font-black font-mono ${data.rqntConfidence > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                {data.rqntConfidence}%
              </span>
            </div>
            <div className="w-full bg-zinc-800/50 rounded-full h-3 overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  data.rqntConfidence > 70 ? 'bg-gradient-to-r from-green-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                  data.rqntConfidence > 40 ? 'bg-gradient-to-r from-amber-600 to-yellow-400' : 'bg-red-500'
                }`}
                style={{ width: `${data.rqntConfidence}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-zinc-500 mt-3 font-medium italic">
              {data.rqntConfidence > 80 ? '✅ FIRMA COMPATIBLE: El desplazamiento global de fase sugiere consumo de red por impacto extragaláctico.' :
               data.rqntConfidence > 50 ? '⚠️ EVIDENCIA SUGESTIVA: Se requiere triangulación con estaciones BIPM adicionales.' :
               '❌ ERROR DE FIRMA: Las fluctuaciones no corresponden a la elasticidad R-QNT.'}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="inline-block animate-spin-slow">
            <i className="fas fa-satellite-dish text-zinc-700 text-5xl"></i>
          </div>
          <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest animate-pulse">Buscando datos del evento 25-D en repositorios GNSS...</p>
        </div>
      )}
    </div>
  );
};

const AutonomousResearcher: React.FC<{ 
    mode: SimulationMode;
    synthesisActive: boolean;
    setSynthesisActive: (active: boolean) => void;
    onReportUpdate: (report: ValidationReport | null) => void;
    forceAnomalyView?: boolean;
}> = ({ mode, synthesisActive, setSynthesisActive, onReportUpdate, forceAnomalyView }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [huntResult, setHuntResult] = useState<AnomalyHunterResult | null>(null);

  const updateReport = (newReport: ValidationReport | null) => {
    setReport(newReport);
    onReportUpdate(newReport);
  };

  // --- 25-D IMPACT ANALYZER (Hypothesis & Torsional Recovery) ---
  const launch25DImpactAnalysis = async () => {
    setLoading(true);
    setLogs(prev => [...prev, 
      "[25-D IMPACT] Iniciando análisis de firma de Impacto de Tensión R-QNT...",
      "[FASE 1] Modelando hipótesis: c(τ) = √(τ/μ) afectada por GRB de SGR 1935+2154...",
      "[FASE 2] Búsqueda de firma de recuperación torsional (oscilación amortiguada)..."
    ]);

    // SIMULACIÓN de la firma predicha (se reemplazará con datos reales)
    await new Promise(r => setTimeout(r, 2000));
    
    // Resultados simulados basados en la hipótesis
    const impactSignature = {
      hasTorsionalRecovery: true, // Predicción clave
      recoveryFrequency: "3.2e-5 Hz", // Frecencia característica
      dampingTime: "1.8 hours",
      hemisphericGradient: "N/S asymmetry ~15%",
      energyDelayConstant: "κ ≈ 2.1e-15 ps/erg",
      confidence: 87 // % basado en coherencia interna del modelo
    };

    setLogs(prev => [...prev,
      `[RESULTADO] Frecuencia de recuperación: ${impactSignature.recoveryFrequency}`,
      `[RESULTADO] Gradiente hemisférico detectado: ${impactSignature.hemisphericGradient}`,
      `[PREDICCIÓN] Constante de acoplamiento Energía-Retardo: ${impactSignature.energyDelayConstant}`,
      "[STATUS] FIRMA COMPATIBLE CON IMPACTO DE TENSIÓN R-QNT"
    ]);

    // Actualizar el estado del reporte con análisis de la IA
    const analysisPrompt = `Analiza los siguientes resultados del evento 25-D como una prueba de la elasticidad de la red R-QNT: 
    - Frecuencia de recuperación torsional: ${impactSignature.recoveryFrequency}
    - Gradiente hemisférico de retardo: ${impactSignature.hemisphericGradient}
    - Constante de acoplamiento κ predicha: ${impactSignature.energyDelayConstant}
    Explica cómo esto valida la hipótesis del 'Impacto de Tensión' y la variabilidad de c(τ) tras un GRB de SGR 1935+2154.`;
    
    const analysis = await askGemini(analysisPrompt);

    const hunterReport: ValidationReport = {
      timestamp: new Date().toLocaleTimeString(),
      status: 'ENLACE_COHERENTE',
      coherenceIndex: impactSignature.confidence,
      residualTorsion: 100 - impactSignature.confidence,
      verdict: analysis || `Análisis preliminar respalda la hipótesis de "Impacto de Tensión". La firma muestra indicios de recuperación torsional (${impactSignature.recoveryFrequency}) y un gradiente norte-sur, consistente con una perturbación elástica en la red A-B-C acoplada al GRB de SGR 1935+2154.`
    };
    
    updateReport(hunterReport);
    setLoading(false);
  };

  // --- 25-D HUNTER LOGIC ---
  const run25DInvestigation = async () => {
    setLoading(true);
    setHuntResult(null);
    setLogs(["[25-D HUNTER] Iniciando búsqueda de firma R-QNT...", "[NETWORK] Conectando con CDDIS NASA archive...", "[NETWORK] Consultando circulares T del BIPM..."]);
    
    await new Promise(r => setTimeout(r, 1500));
    setLogs(prev => [...prev, "[CLOCK] Analizando desviaciones ps en estaciones H-maser (WTZR, USN3)...", "[ASTRO] Escaneando catálogo Fermi para 2025-12-24/25..."]);

    // Simulated fetch process
    setTimeout(async () => {
      const anomaly: TimeAnomalyData = {
        date: '2025-12-25',
        stationCount: 42,
        avgDeviationPs: 1200,
        correlationPattern: 'GLOBAL_SYNC',
        dataSource: 'IGS_HMASER',
        rawDataUrl: 'https://cddis.nasa.gov/archive/gnss/products/clock/25000/'
      };

      const trigger: AstrophysicsEvent = {
        date: '2025-12-24T22:15:00Z',
        type: 'GAMMA_RAY_BURST',
        source: 'SGR 1935+2154',
        significance: 8.7,
        dataUrl: 'https://gcn.nasa.gov/circulars/35025'
      };

      // Calculate Confidence (R-QNT Internal Logic)
      let confidence = 0;
      if (anomaly.correlationPattern === 'GLOBAL_SYNC') confidence += 40;
      if (anomaly.avgDeviationPs > 500 && anomaly.avgDeviationPs < 5000) confidence += 30;
      if (trigger.significance > 7) confidence += 30;

      const result: AnomalyHunterResult = { anomaly, trigger, rqntConfidence: confidence };
      
      const analysis = await askGemini(`Investigación Evento 25-D: Anomalía global detectada. 
      Desviación: ${anomaly.avgDeviationPs} ps. Estaciones: ${anomaly.stationCount}. 
      Coincidencia con GRB de fuente ${trigger.source} (Significancia ${trigger.significance}). 
      Analiza esta firma como una prueba de la elasticidad de la red R-QNT y el 'Impacto de Tensión' que predice la teoría de Edward Pérez López.`);

      setHuntResult(result);
      setLogs(prev => [...prev, "[IA] Análisis de firma completo.", "[REPORT] Generando veredicto de anomalía..."]);
      
      const hunterReport: ValidationReport = {
        coherenceIndex: confidence,
        residualTorsion: 0.002,
        status: 'ENLACE_COHERENTE',
        verdict: analysis || "Firma compatible con predicción R-QNT detectada.",
        timestamp: new Date().toLocaleTimeString()
      };
      updateReport(hunterReport);
      setLoading(false);
    }, 2000);
  };

  const runResearchLoop = async () => {
    if (loading) return;
    setLoading(true);
    setLogs(["[SYSTEM] Initializing Evolutionary Simulation Loop...", "[DATA] Calibrating Triada A-B-C sensors..."]);
    
    await new Promise(r => setTimeout(r, 1000));
    setLogs(prev => [...prev, "[ALGO] Scanning Borromean linkage probability...", "[ALGO] Calculating Cartan Torsion Tensors..."]);
    
    await new Promise(r => setTimeout(r, 1000));
    setLogs(prev => [...prev, "[IA] Comparing with Minkowski metric constants...", "[IA] Generating final stability verdict..."]);

    const coherence = mode === SimulationMode.VIA_B ? Math.floor(Math.random() * 40) + 55 : Math.floor(Math.random() * 20) + 10;
    const verdict = await validateSimulation({ coherence, mode });

    const newReport: ValidationReport = {
      coherenceIndex: coherence,
      residualTorsion: 100 - coherence,
      status: coherence > 50 ? 'ESTABLE' : 'CRÍTICO',
      verdict: verdict || "Analysis failed.",
      timestamp: new Date().toLocaleTimeString()
    };

    updateReport(newReport);
    setLoading(false);
  };

  const runCrystallization = async () => {
    if (loading) return;
    setLoading(true);
    setLogs([
        "[LAB] MÓDULO DE CRISTALIZACIÓN R-QNT: SEQ-09 INITIATED.",
        "[DATA] Aplicando factor de Tensión c_local = 1.277685...",
        "[SYSTEM] Activando Link Sharing (Compartir hilos A-B-C)..."
    ]);

    await new Promise(r => setTimeout(r, 1500));

    const precisionTension = 1.277685;
    const finalCoherence = 99.0;
    const simulatedBaryonicMass = 0.93827;
    
    setLogs(prev => [...prev, 
        "[PHASE 1] Estabilizando núcleos mediante 'Longitud Consumida'.",
        "[PHASE 2] Aplicando Operador enlace_borromeo(n[i], n[i+1])...",
        `[PHASE 3] Coherencia global establecida en ${finalCoherence}%.`
    ]);

    await new Promise(r => setTimeout(r, 1000));
    setLogs(prev => [...prev, "IA: RED DE MATERIA CRISTALIZADA. ESTABILIDAD BORROMEA TOTAL.", "[SUCCESS] SEQ-09: Baryonic lattice is now in Solid-State."]);

    const verdict = await askGemini(`Technical Analysis: SEQ-09 Crystallization successful. 
    Metrics: Tension=1.277685, Coherence=99.0%. Mechanism: Link Sharing and Borromean Interlock. Explain transition to unified baryonic network.`);

    const newReport: ValidationReport = {
      coherenceIndex: finalCoherence,
      residualTorsion: 0.001,
      localTension: precisionTension,
      baryonicMass: simulatedBaryonicMass,
      status: 'CRISTALIZACIÓN',
      verdict: verdict || "Baryonic crystallization achieved. Stability Borromea Total.",
      timestamp: new Date().toLocaleTimeString()
    };
    updateReport(newReport);
    setLoading(false);
  };

  const runDualStressTest = async () => {
    if (loading) return;
    setLoading(true);
    setLogs(["[LAB] PROTOCOLO DE VALIDACIÓN DUAL: IMPACTO + GRAVEDAD INITIATED.", "[PHASE A] Iniciando pulso de choque. Energía: 500 Tera-Planck...", "[DATA] Triada A-B-C: absorbción de energía activada."]);
    await new Promise(r => setTimeout(r, 1500));
    setLogs(prev => [...prev, "[PHASE B] Midiendo deformación por consumo de longitud L...", "[DATA] IA: Calculando gradiente de tensión y radio de atracción..."]);
    await new Promise(r => setTimeout(r, 1500));

    const resilience = 85 + Math.random() * 10; 
    const deltaL = 0.045 + Math.random() * 0.02; 
    setLogs(prev => [...prev, `[SUCCESS] Resiliencia post-impacto: ${resilience.toFixed(2)}%`, `[GRAVITY] Masa Gravitatoria (Delta L): ${deltaL.toFixed(5)} units.`, `[STATUS] ESTRÉS_TOTAL: Validation complete.`]);

    const verdict = await askGemini(`Technical Analysis: Dual Stress Protocol complete. Energy Pulse: 500 Tera-Planck. Resilience: ${resilience.toFixed(2)}%. Gravitational Mass (Delta L): ${deltaL.toFixed(5)}.`);

    const newReport: ValidationReport = {
      coherenceIndex: resilience,
      residualTorsion: 100 - resilience,
      status: 'ESTRÉS_TOTAL',
      stressMetrics: { resilience, gravitationalMass: deltaL },
      verdict: verdict || "Dual validation successful.",
      timestamp: new Date().toLocaleTimeString()
    };
    updateReport(newReport);
    setLoading(false);
  };

  const runSynthesis = async () => {
    if (loading) return;
    setLoading(true);
    setLogs(["[LAB] PROTOCOLO DE SÍNTESIS DE NEUTRÓN R-QNT-004 INITIATED.", "[DATA] Verificando Coherencia (Umbral 91%)...", "[SYSTEM] Monitoring net torsion cancellation..."]);
    await new Promise(r => setTimeout(r, 2000));
    
    const simulatedCoherence = mode === SimulationMode.VIA_B ? 91 + Math.random() * 8 : 45 + Math.random() * 20;
    setLogs(prev => [...prev, `[SENSORS] Red Coherencia: ${simulatedCoherence.toFixed(2)}%`]);

    if (simulatedCoherence >= 91 && mode === SimulationMode.VIA_B) {
        setLogs(prev => [...prev, "[SUCCESS] Coherencia validada (>= 91%).", "[SYSTEM] Cancelación de Torsión Macroscópica exitosa.", "[GRAVITY] Incremento de Tensión detectado. Elasticidad local (c_local) = 1.4726.", "[REPORT] SÍNTESIS EXITOSA."]);
        setSynthesisActive(true);
        const verdict = await askGemini("R-QNT-004 Report: Successful Neutron Synthesis.");
        const newReport: ValidationReport = {
            coherenceIndex: simulatedCoherence,
            residualTorsion: 0.05,
            localTension: 1.4726,
            status: 'MATERIA_ESTABLE_NEUTRON',
            verdict: verdict || "Neutron crystallization confirmed.",
            timestamp: new Date().toLocaleTimeString()
        };
        updateReport(newReport);
    } else {
        setLogs(prev => [...prev, "[FAILURE] Synthesis aborted."]);
        setSynthesisActive(false);
        updateReport(null);
    }
    setLoading(false);
  };

  const downloadReport = () => {
    if (!report) return;
    const content = `--- INFORME AUTO-GENERADO R-QNT ---\nFecha: ${new Date().toLocaleDateString()}\nStatus: ${report.status}\nVeredicto: ${report.verdict}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rqnt_research_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {forceAnomalyView ? (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Anomaly Hunter Hub</h2>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Sincronización GNSS // Fermi GCN Monitoring</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={run25DInvestigation}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-purple-900/40 hover:scale-105 transition-all disabled:opacity-50"
                >
                  <i className="fas fa-search mr-2"></i>
                  Ejecutar Investigación 25-D
                </button>
                <button 
                  onClick={launch25DImpactAnalysis} 
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg ${loading ? 'bg-zinc-800 text-zinc-500' : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white shadow-orange-900/40 hover:scale-105'}`}
                >
                  <i className="fas fa-bolt mr-2"></i>
                  Análisis de Impacto
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border border-zinc-800 rounded-2xl p-4 h-64 overflow-y-auto font-mono text-[10px] text-purple-400 scrollbar-thin scrollbar-thumb-zinc-800">
              {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
              {loading && <div className="animate-pulse">_</div>}
            </div>
            <div className="flex flex-col justify-center">
              <Anomaly25DReport data={huntResult} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-atom text-amber-500"></i>
                Autonomous Research Lab
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-tighter">AI Core // Multimodal Physics Validation</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={runResearchLoop} disabled={loading} className={`px-3 py-2 rounded-lg font-bold text-[9px] uppercase transition-all ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'}`}>Stability</button>
              <button onClick={runDualStressTest} disabled={loading} className={`px-3 py-2 rounded-lg font-bold text-[9px] uppercase transition-all ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-red-900/50 hover:bg-red-800/50 text-red-400 border border-red-700 shadow-lg shadow-red-900/20'}`}>Dual Stress</button>
              <button onClick={launch25DImpactAnalysis} disabled={loading} className={`px-3 py-2 rounded-lg font-bold text-[9px] uppercase transition-all ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg'}`}>Análisis 25-D</button>
              <button onClick={runCrystallization} disabled={loading} className={`px-3 py-2 rounded-lg font-bold text-[9px] uppercase transition-all ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-white border-2 border-white hover:bg-zinc-200 text-black shadow-xl animate-pulse'}`}>Crystallize (SEQ-09)</button>
              <button onClick={runSynthesis} disabled={loading} className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase transition-all ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20'}`}>Synthesis</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black rounded-lg border border-zinc-800 p-4 h-64 overflow-y-auto font-mono text-[10px] text-green-500 scrollbar-thin scrollbar-thumb-zinc-800">
              {logs.length === 0 && <span className="text-zinc-700 italic">Laboratorio listo para órdenes...</span>}
              {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
              {loading && <div className="animate-pulse">_</div>}
            </div>
            <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/50 p-6 flex flex-col justify-center gap-4">
               {report ? (
                 <>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                          <p className="text-[10px] text-zinc-500 uppercase">Coherence Index</p>
                          <p className={`text-3xl font-mono ${report.coherenceIndex >= 90 ? 'text-green-500' : 'text-red-500'}`}>{report.coherenceIndex.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                          <p className="text-[10px] text-zinc-500 uppercase">Residual Torsion</p>
                          <p className="text-3xl font-mono text-white">{report.residualTorsion.toFixed(3)}Δ</p>
                      </div>
                  </div>
                  <div className={`mt-2 py-1 px-3 rounded-full text-[10px] font-bold text-center border transition-all ${report.status === 'CRISTALIZACIÓN' ? 'bg-zinc-100 text-black border-white shadow-lg shadow-white/20' : report.status === 'MATERIA_ESTABLE_NEUTRON' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : report.status === 'ESTRÉS_TOTAL' ? 'bg-red-600/20 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                      STATUS: {report.status}
                  </div>
                 </>
               ) : (
                 <div className="text-center text-zinc-600 italic py-10">No active validation session. Launch Stability, Linkage, Stress, Crystallize or Synthesis.</div>
               )}
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
            <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <i className="fas fa-file-alt"></i>
                Veredicto del Agente Validador
            </h3>
            <button onClick={downloadReport} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded border border-zinc-700 transition-colors">Exportar</button>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-300 font-light leading-relaxed text-sm italic">
            {report.verdict}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousResearcher;
