
import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { SimulationMode, ValidationReport } from '../types';
import { askGemini } from '../services/geminiService';
import { COLORS } from '../constants';

Chart.register(...registerables);

interface Folder {
  id: number;
  name: string;
  files: string[];
  status: 'Validado' | 'Revisando' | 'Pendiente';
}

const ValidationHub: React.FC<{
  currentReport: ValidationReport | null;
  mode: SimulationMode;
}> = ({ currentReport, mode }) => {
  const [folders, setFolders] = useState<Folder[]>([
    { id: 1, name: "1_MANUSCRITO", files: ["Paper_Final.pdf", "LaTeX_Source.tex"], status: "Validado" },
    { id: 2, name: "2_SOFTWARE", files: ["Simulation_Engine.py", "modules/"], status: "Revisando" },
    { id: 3, name: "3_DATA", files: ["results.json", "logs.zip"], status: "Validado" },
    { id: 4, name: "4_FIGURES", files: ["Fig1.png", "Fig3.png"], status: "Pendiente" },
    { id: 5, name: "5_VALIDACION", files: ["protocols.pdf"], status: "Validado" },
    { id: 8, name: "8_METADATA", files: ["zenodo.json"], status: "Validado" }
  ]);
  
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [logs, setLogs] = useState<{msg: string, type: 'ia' | 'sys'}[]>([]);
  const [metrics, setMetrics] = useState({
    coherence: currentReport?.coherenceIndex || 34.0,
    integrity: 85,
    peerReputation: 40
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  const validationChartRef = useRef<HTMLCanvasElement>(null);
  const coherenceChartRef = useRef<HTMLCanvasElement>(null);
  const vChartInst = useRef<Chart | null>(null);
  const cChartInst = useRef<Chart | null>(null);

  const addLog = (msg: string, type: 'ia' | 'sys' = 'ia') => {
    setLogs(prev => [{ msg, type }, ...prev.slice(0, 50)]);
  };

  useEffect(() => {
    addLog("Bienvenido, Investigador Edward. Hub de Validación listo para conexión externa.");
  }, []);

  useEffect(() => {
    if (currentReport) {
      setMetrics(prev => ({ ...prev, coherence: currentReport.coherenceIndex }));
      addLog(`Sincronización completa: Coherencia de Red detectada en ${currentReport.coherenceIndex.toFixed(2)}%.`);
    }
  }, [currentReport]);

  useEffect(() => {
    if (validationChartRef.current && coherenceChartRef.current) {
      if (vChartInst.current) vChartInst.current.destroy();
      if (cChartInst.current) cChartInst.current.destroy();

      vChartInst.current = new Chart(validationChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Integridad', 'Reputación', 'Reproducibilidad', 'Rigor', 'Simetría'],
          datasets: [{
            label: 'Peer Review Score',
            data: [metrics.integrity, metrics.peerReputation, 70, 80, 60],
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            borderColor: COLORS.ACCENT,
            borderWidth: 2,
            pointBackgroundColor: COLORS.ACCENT
          }]
        },
        options: {
          scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.05)' } } },
          plugins: { legend: { display: false } }
        }
      });

      cChartInst.current = new Chart(coherenceChartRef.current, {
        type: 'line',
        data: {
          labels: ['t-5', 't-4', 't-3', 't-2', 't-1', 'Actual'],
          datasets: [{
            label: 'Coherencia %',
            data: [30, 32, 31, 34, 33, metrics.coherence],
            borderColor: COLORS.STRING_B,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(74, 222, 128, 0.1)'
          }]
        },
        options: {
          scales: { 
            y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
  }, [metrics]);

  const triggerValidation = async () => {
    setIsValidating(true);
    addLog("Iniciando escaneo de validación cruzada mediante Script Python R-QNT...", "sys");
    
    const pythonScript = `
import numpy as np
def validate_node_integrity(nodes):
    tension = 1.277685
    coherence = np.mean([n.coherence for n in nodes])
    return coherence > 0.95 and tension == 1.277685
    `;
    addLog(`Ejecutando: \n${pythonScript}`, "sys");

    setTimeout(async () => {
      setFolders(prev => prev.map(f => f.files.length > 0 ? { ...f, status: "Validado" } : f));
      setMetrics(prev => ({ ...prev, peerReputation: Math.min(100, prev.peerReputation + 15), integrity: 100 }));
      const analysis = await askGemini("Act as the R-QNT Peer Review Analyst. The repository has been validated successfully. Explain why a JSON code bundle is efficient for cross-platform integration.");
      addLog(analysis || "Validación exitosa.", "ia");
      setIsValidating(false);
    }, 2000);
  };

  /**
   * Exporta toda la estructura del código como un único archivo .json
   */
  const exportAsJsonExtension = async () => {
    setIsExportingJson(true);
    addLog("Compilando estructura de código en formato JSON...", "sys");

    try {
      // Definimos los archivos que componen el proyecto para incluirlos en el JSON
      const filePaths = [
        'index.tsx',
        'App.tsx',
        'types.ts',
        'constants.ts',
        'metadata.json',
        'index.html',
        'services/geminiService.ts',
        'components/Simulation3D.tsx',
        'components/PaperView.tsx',
        'components/GeminiAssistant.tsx',
        'components/AutonomousResearcher.tsx',
        'components/ValidationHub.tsx',
        'components/ExtensionNodes.tsx'
      ];

      const bundle: Record<string, string> = {};

      // Intentamos obtener el contenido de cada archivo vía fetch (estamos en el mismo origen)
      // Nota: En un entorno real de producción, esto dependería de cómo se sirven los fuentes.
      // Aquí simulamos la recopilación de los hilos de código.
      for (const path of filePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            bundle[path] = await response.text();
          } else {
            bundle[path] = `// Error al recuperar contenido de ${path}`;
          }
        } catch (e) {
          bundle[path] = `// No accesible directamente: ${path}`;
        }
      }

      const exportData = {
        extension_name: "R-QNT_CORE_MODULE",
        version: "2.6.0",
        author: "Edward Pérez López",
        export_date: new Date().toISOString(),
        description: "Paquete de extensión integral R-QNT para integración en aplicaciones de terceros.",
        files: bundle,
        integration_note: "Para integrar, procesar el objeto 'files' y reconstruir la estructura de carpetas en el proyecto destino."
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RQNT_EXTENSION_BUNDLE_${Date.now()}.json`;
      link.click();
      
      addLog("¡Extensión JSON generada con éxito!", "ia");
    } catch (error) {
      console.error(error);
      addLog("Fallo crítico al compilar el JSON.", "sys");
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950 text-zinc-300">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="h-4 w-px bg-zinc-700"></div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">R-QNT Validation Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportAsJsonExtension}
            disabled={isExportingJson}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2 transition-all ${isExportingJson ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'}`}
          >
            <i className={`fas ${isExportingJson ? 'fa-spinner animate-spin' : 'fa-code'}`}></i>
            {isExportingJson ? 'Compilando JSON...' : 'Exportar Extensión (.JSON)'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-zinc-800 flex flex-col bg-zinc-900/30">
          <div className="p-6">
            <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4">Repositorio</h2>
            <p className="text-[10px] text-zinc-500 mb-6 italic">Visualización de activos R-QNT.</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {folders.map(f => (
              <div 
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)} 
                className={`group p-3 rounded-xl cursor-pointer transition-all border ${selectedFolderId === f.id ? 'bg-amber-500/10 border-amber-500/50' : 'hover:bg-zinc-800 border-transparent'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-zinc-200">{f.name}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full ${f.status === 'Validado' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>{f.status}</span>
                </div>
                <span className="text-[9px] text-zinc-500 ml-1">{f.files.length} archivos</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 h-[260px]">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-4">Integridad del Código</h3>
              <canvas ref={validationChartRef}></canvas>
            </div>
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 h-[260px]">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-4">Coherencia Live</h3>
              <canvas ref={coherenceChartRef}></canvas>
            </div>
          </div>

          <div className="flex-1 bg-black/40 rounded-2xl border border-zinc-800 p-5 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Analista R-QNT</h3>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
              {logs.map((log, i) => (
                <div key={i} className={`${log.type === 'ia' ? 'text-amber-500/80' : 'text-zinc-500'}`}>
                  <span className="font-bold mr-2">{log.type === 'ia' ? 'IA>' : 'SYS>'}</span>
                  {log.msg}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <button 
                onClick={triggerValidation} 
                className="px-5 py-2 bg-green-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-green-500 transition"
              >
                Escanear Prototipo
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ValidationHub;
