
import React, { useState, useEffect } from 'react';
import { SimulationMode, ValidationReport } from '../types';

interface LabSnapshot {
  id: string;
  name: string;
  timestamp: string;
  mode: SimulationMode;
  synthesisActive: boolean;
  report: ValidationReport | null;
}

interface PersistenceControlsProps {
  currentMode: SimulationMode;
  synthesisActive: boolean;
  currentReport: ValidationReport | null;
  onLoad: (snapshot: LabSnapshot) => void;
  onReset: () => void;
}

const PersistenceControls: React.FC<PersistenceControlsProps> = ({ 
  currentMode, 
  synthesisActive, 
  currentReport, 
  onLoad,
  onReset
}) => {
  const [snapshots, setSnapshots] = useState<LabSnapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState('');

  // Cargar instantáneas guardadas al inicio
  useEffect(() => {
    const saved = localStorage.getItem('rqnt_lab_snapshots');
    if (saved) {
      setSnapshots(JSON.parse(saved));
    }
  }, []);

  const saveSnapshot = () => {
    const name = snapshotName.trim() || `Config_${new Date().toLocaleTimeString()}`;
    const newSnapshot: LabSnapshot = {
      id: crypto.randomUUID(),
      name,
      timestamp: new Date().toLocaleString(),
      mode: currentMode,
      synthesisActive,
      report: currentReport
    };

    const updated = [newSnapshot, ...snapshots].slice(0, 5); // Limitar a 5 slots
    setSnapshots(updated);
    localStorage.setItem('rqnt_lab_snapshots', JSON.stringify(updated));
    setSnapshotName('');
  };

  const deleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem('rqnt_lab_snapshots', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Lab Profile Manager</h3>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={snapshotName}
          onChange={(e) => setSnapshotName(e.target.value)}
          placeholder="Nombre del Snapshot..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
        />
        <button 
          onClick={saveSnapshot}
          className="bg-amber-600 hover:bg-amber-500 text-white p-1 rounded transition-colors"
          title="Guardar Estado Actual"
        >
          <i className="fas fa-save text-[10px]"></i>
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-1">
        {snapshots.length === 0 && (
          <p className="text-[9px] text-zinc-600 italic text-center py-2">Sin perfiles guardados.</p>
        )}
        {snapshots.map(s => (
          <div key={s.id} className="bg-zinc-800/50 border border-zinc-700 rounded p-2 group hover:border-zinc-500 transition-all">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-300 truncate max-w-[120px]">{s.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onLoad(s)} className="text-emerald-500 hover:text-emerald-400">
                  <i className="fas fa-upload text-[9px]"></i>
                </button>
                <button onClick={() => deleteSnapshot(s.id)} className="text-red-500 hover:text-red-400">
                  <i className="fas fa-trash text-[9px]"></i>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-[8px] text-zinc-500 font-mono">
              <span>{s.mode.split(':')[0]}</span>
              <span>{s.timestamp.split(',')[1]}</span>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onReset}
        className="w-full py-1.5 border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded text-[9px] font-bold uppercase transition-all"
      >
        <i className="fas fa-trash-alt mr-2"></i> Nuclear Reset
      </button>
    </div>
  );
};

export default PersistenceControls;
