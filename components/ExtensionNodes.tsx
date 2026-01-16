
import React, { useState } from 'react';
import { askGemini } from '../services/geminiService';

const ExtensionNodes: React.FC = () => {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  const extensions = [
    {
      id: 'node_1',
      name: 'Torsion Topology Mapper',
      description: 'Extensión de análisis diferencial para curvaturas de Cartan no-euclidianas.',
      url: 'https://topology-mapper.research.org/rqnt-bridge',
      icon: 'fa-project-diagram',
      color: 'text-blue-400'
    },
    {
      id: 'node_2',
      name: 'Global Sincronicity Monitor',
      description: 'Nodo externo de monitoreo de relojes atómicos y derivas ps globales.',
      url: 'https://bipm-monitor.net/rqnt-integration',
      icon: 'fa-stopwatch-20',
      color: 'text-emerald-400'
    }
  ];

  const handleAnalyze = async (extId: string, name: string) => {
    setAnalyzing(extId);
    const prompt = `Actúa como el enlace R-QNT entre la plataforma principal y la extensión externa: ${name}. 
    Simula la obtención de datos críticos (Métrica de Torsión local, Coeficiente de Red) de este nodo y explica cómo refuerzan la teoría de Edward Pérez López sobre la estabilidad Borromea.`;
    
    const analysis = await askGemini(prompt);
    setResults(prev => ({ ...prev, [extId]: analysis || 'Error en conexión de datos.' }));
    setAnalyzing(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Nodos de Extensión Externa</h2>
        <p className="text-zinc-500 max-w-2xl mx-auto text-sm">
          Expande el núcleo R-QNT conectando con herramientas externas de validación científica. Estos nodos proporcionan metadatos adicionales para la síntesis de materia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {extensions.map(ext => (
          <div key={ext.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-all group relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 text-8xl opacity-5 ${ext.color}`}>
              <i className={`fas ${ext.icon}`}></i>
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl ${ext.color}`}>
                  <i className={`fas ${ext.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-white">{ext.name}</h3>
              </div>
              
              <p className="text-zinc-400 text-sm leading-relaxed">{ext.description}</p>
              
              <div className="flex gap-3">
                <a 
                  href={ext.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-2"
                >
                  <i className="fas fa-external-link-alt"></i> Ejecutar App
                </a>
                <button 
                  onClick={() => handleAnalyze(ext.id, ext.name)}
                  disabled={analyzing === ext.id}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold uppercase transition disabled:opacity-50"
                >
                  {analyzing === ext.id ? 'Sincronizando...' : 'Analizar Datos de Extensión'}
                </button>
              </div>

              {results[ext.id] && (
                <div className="mt-6 p-5 bg-black/40 border border-zinc-800 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-amber-500 text-[9px] font-black uppercase tracking-widest mb-3">
                    <i className="fas fa-brain"></i> Análisis del Oracle
                  </div>
                  <p className="text-xs text-zinc-300 font-light italic leading-relaxed">
                    {results[ext.id]}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-amber-600/10 to-transparent p-6 rounded-2xl border border-amber-600/20 text-center">
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
          Info: Estas extensiones utilizan protocolos de seguridad R-QNT v2.6 para intercambio de hilos de datos.
        </p>
      </div>
    </div>
  );
};

export default ExtensionNodes;
