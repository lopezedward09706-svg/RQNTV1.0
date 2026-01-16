
import React, { useState, useEffect } from 'react';
import { AppTab, SimulationMode, ValidationReport } from './types';
import Simulation3D from './components/Simulation3D';
import PaperView from './components/PaperView';
import GeminiAssistant from './components/GeminiAssistant';
import AutonomousResearcher from './components/AutonomousResearcher';
import ValidationHub from './components/ValidationHub';
import ExtensionNodes from './components/ExtensionNodes';
import PersistenceControls from './components/PersistenceControls';
import { onGlobalLoadingChange } from './services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SIMULATOR);
  const [simMode, setSimMode] = useState<SimulationMode>(SimulationMode.VIA_B);
  const [synthesisActive, setSynthesisActive] = useState(false);
  const [currentReport, setCurrentReport] = useState<ValidationReport | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('rqnt_active_session');
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.simMode) setSimMode(data.simMode);
        if (data.synthesisActive !== undefined) setSynthesisActive(data.synthesisActive);
        if (data.currentReport) setCurrentReport(data.currentReport);
      } catch (e) {
        console.error("Error recovering session:", e);
      }
    }

    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
    
    const unsubscribe = onGlobalLoadingChange(setIsGlobalLoading);
    
    window.addEventListener('focus', checkKey);
    return () => {
      window.removeEventListener('focus', checkKey);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sessionData = {
      activeTab,
      simMode,
      synthesisActive,
      currentReport
    };
    localStorage.setItem('rqnt_active_session', JSON.stringify(sessionData));
  }, [activeTab, simMode, synthesisActive, currentReport]);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to mitigate race condition
      setHasKey(true);
    }
  };

  const handleLoadSnapshot = (snapshot: any) => {
    setSimMode(snapshot.mode);
    setSynthesisActive(snapshot.synthesisActive);
    setCurrentReport(snapshot.report);
    setActiveTab(AppTab.SIMULATOR);
  };

  const handleNuclearReset = () => {
    if (window.confirm("Nuclear Reset? This will wipe all saved configurations.")) {
      localStorage.removeItem('rqnt_active_session');
      localStorage.removeItem('rqnt_lab_snapshots');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-black">
      <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md">
        {isGlobalLoading && (
          <div className="absolute bottom-0 left-0 h-[2px] overflow-hidden w-full">
            <div className="h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-loading-bar shadow-[0_0_10px_#f59e0b]"></div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center relative transition-all duration-500 ${isGlobalLoading ? 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''}`}>
            <i className={`fas fa-network-wired text-white text-xs ${isGlobalLoading ? 'animate-pulse' : ''}`}></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">R-QNT Lab Platform</h1>
            </div>
            <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-tighter">Relational Quantum Network v2.6 // API INTEGRATION</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button onClick={() => setActiveTab(AppTab.SIMULATOR)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.SIMULATOR ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-microscope"></i>Sim
          </button>
          <button onClick={() => setActiveTab(AppTab.RESEARCHER)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.RESEARCHER ? 'bg-amber-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-robot"></i>Researcher
          </button>
          <button onClick={() => setActiveTab(AppTab.EXTENSIONS)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.EXTENSIONS ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-plug"></i>Extensions
          </button>
          <button onClick={() => setActiveTab(AppTab.HUB)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.HUB ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-database"></i>Hub
          </button>
          <button onClick={() => setActiveTab(AppTab.ANOMALY_25D)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.ANOMALY_25D ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-satellite"></i>25-D Hunter
          </button>
          <button onClick={() => setActiveTab(AppTab.PAPER)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.PAPER ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-scroll"></i>Paper
          </button>
          <button onClick={() => setActiveTab(AppTab.ASSISTANT)} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === AppTab.ASSISTANT ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <i className="fas fa-brain"></i>Oracle
          </button>
        </nav>

        <div className="flex items-center gap-4">
           {!hasKey && (
             <span className="text-[9px] text-amber-500 font-bold animate-pulse hidden md:block">
               ACTION REQUIRED: SELECT KEY
             </span>
           )}
           <button onClick={handleSelectKey} className={`flex flex-col items-end px-3 py-1 rounded border transition-colors ${hasKey ? 'border-green-900/30 hover:bg-green-900/10' : 'border-amber-900/50 hover:bg-amber-900/10'}`}>
             <span className={`text-[10px] font-mono ${hasKey ? 'text-green-500' : 'text-amber-500'}`}>
               <i className={`fas ${hasKey ? 'fa-key' : 'fa-plug'} mr-1`}></i>
               {hasKey ? 'PRIVATE KEY ACTIVE' : 'CONNECT PRIVATE KEY'}
             </span>
             <span className="text-[9px] text-zinc-600 font-mono uppercase">API Connection</span>
           </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden ${activeTab === AppTab.SIMULATOR ? 'flex' : 'hidden'}`}>
            <aside className="w-full md:w-80 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">Global Constants</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase tracking-tighter font-mono">Sim Theory</label>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setSimMode(SimulationMode.VIA_A); setSynthesisActive(false); setCurrentReport(null); }} className={`text-left px-3 py-2 rounded border text-[10px] font-bold transition-all ${simMode === SimulationMode.VIA_A ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                        {SimulationMode.VIA_A}
                      </button>
                      <button onClick={() => setSimMode(SimulationMode.VIA_B)} className={`text-left px-3 py-2 rounded border text-[10px] font-bold transition-all ${simMode === SimulationMode.VIA_B ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                        {SimulationMode.VIA_B}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <PersistenceControls 
                  currentMode={simMode}
                  synthesisActive={synthesisActive}
                  currentReport={currentReport}
                  onLoad={handleLoadSnapshot}
                  onReset={handleNuclearReset}
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Physics Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-800/80 p-3 rounded-lg border border-zinc-700/50 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase">Cartan Torsion</p>
                    <p className="text-sm font-mono text-white">{synthesisActive ? '0.005' : '1.024'} τ</p>
                  </div>
                  <div className="bg-zinc-800/80 p-3 rounded-lg border border-zinc-700/50 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase">Resonancia</p>
                    <p className="text-sm font-mono text-amber-500">Phase+</p>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-h-[400px]">
              <Simulation3D mode={simMode} synthesisActive={synthesisActive} status={currentReport?.status} />
            </div>
        </div>

        {activeTab === AppTab.RESEARCHER && (
          <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            <AutonomousResearcher mode={simMode} synthesisActive={synthesisActive} setSynthesisActive={setSynthesisActive} onReportUpdate={setCurrentReport} />
          </div>
        )}

        {activeTab === AppTab.EXTENSIONS && (
          <div className="flex-1 overflow-y-auto bg-black">
            <ExtensionNodes />
          </div>
        )}

        {activeTab === AppTab.ANOMALY_25D && (
          <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
            <AutonomousResearcher mode={simMode} synthesisActive={synthesisActive} setSynthesisActive={setSynthesisActive} onReportUpdate={setCurrentReport} forceAnomalyView={true} />
          </div>
        )}

        {activeTab === AppTab.HUB && (
          <div className="flex-1 overflow-hidden">
            <ValidationHub currentReport={currentReport} mode={simMode} />
          </div>
        )}

        {activeTab === AppTab.PAPER && (
          <div className="flex-1 overflow-y-auto bg-zinc-950">
            <PaperView />
          </div>
        )}

        {activeTab === AppTab.ASSISTANT && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            <div className="w-full h-full max-h-[700px]">
                <GeminiAssistant />
            </div>
          </div>
        )}
      </main>

      <footer className="h-8 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 text-[10px] text-zinc-600 font-mono">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> NETWORK ACTIVE</span>
          <span className="flex items-center gap-1 uppercase">EXTENSIONS READY // JSON PROTOCOL v2.6</span>
        </div>
        <div>© 2025 EDWARD PÉREZ LÓPEZ // R-QNT RESEARCH</div>
      </footer>
    </div>
  );
};

export default App;
