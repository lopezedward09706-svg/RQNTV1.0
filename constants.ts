
import { RQNTConfig } from './types';

export const DEFAULT_CONFIG: RQNTConfig = {
  elasticity: 100.0,
  torsion: 50.0,
  density: 1.0,
  interactionStrength: 5.0,
  maxInteractionDist: 1.5,
  dt: 0.01
};

export const COLORS = {
  STRING_A: '#ff4d4d', // Red
  STRING_B: '#4ade80', // Green
  STRING_C: '#60a5fa', // Blue
  NEUTRON: '#fb923c',  // Orange (Synthesized State)
  NEUTRON_GOLD: '#FFD700', // Pure Gold (Stable Materia)
  CRYSTAL: '#f8fafc',    // Baryonic Lattice White
  STABLE_KNOT: '#00FFCC', // Electric Cyan (Matter)
  RADIANT_FLOW: '#FF00FF', // Magenta (Pure Energy)
  LINK_COHERENT: '#FFFFFF', // White (Pure Coherence)
  REPULSION: '#FF4444',   // Alert Red
  ACCENT: '#fbbf24',   // Gold/Amber
  BACKGROUND: '#050505'
};

export const INITIAL_POSITIONS = {
  A: { x: -0.5, y: 0, z: 0 },
  B: { x: 0, y: 0.5, z: 0 },
  C: { x: 0.5, y: -0.5, z: 0 }
};

export const NUM_NODES = 40;
export const SEGMENT_LENGTH = 0.12;
