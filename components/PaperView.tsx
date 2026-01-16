
import React from 'react';

const PaperView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-zinc-950 text-zinc-300 leading-relaxed font-light">
      <div className="border-b border-zinc-800 pb-8 mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Theory of Relational Quantum Networks (R-QNT)</h1>
        <p className="text-amber-500 font-mono text-sm uppercase tracking-widest">A Cartan Torsion & Borromean Stability Model for Geometric Unification</p>
        <p className="mt-4 text-zinc-500 italic">Author: Edward Pérez López</p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">I</span>
          The Triada Postulate
        </h2>
        <p className="mb-4">
          R-QNT posits that the fabric of the universe is not a passive vacuum, but an active network of three fundamental energy flows interconnected as a single manifold. We denote these flows as <span className="text-red-400 font-bold">A</span>, <span className="text-green-400 font-bold">B</span>, and <span className="text-blue-400 font-bold">C</span>.
        </p>
        <ul className="space-y-3 list-disc pl-6">
          <li><strong>Matter:</strong> The result of the "consumption" of network length to form stable topological knots.</li>
          <li><strong>Gravity:</strong> Defined as the elastic restoration tension of the network seeking a flat equilibrium ($\tau = 0$).</li>
          <li><strong>Time:</strong> Local rotation frequency of the knots, modulated by the torsion density of the environment.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">II</span>
          Geometric Basis: The Borromean Knot
        </h2>
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 font-mono text-sm overflow-x-auto mb-6">
          <pre className="text-blue-400">
{`GEOMETRY_TYPE: BORROMEAN_TRIPLE_LINK
COMPONENTS: 3 Closed Loops (A, B, C)
INTERLOCK_STATE: If any link is removed, all links separate.
TORSION_MAPPING:
  - Node_Center: [x, y, z]
  - Vector_A: Rotation_Plane_XY (Right-Handed for Proton)
  - Vector_B: Rotation_Plane_YZ
  - Vector_C: Rotation_Plane_ZX
DENSITY_MAP: High_Convergence_At_Center (Mass)`}
          </pre>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">III</span>
          Mathematical Foundation
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-amber-500 mb-2 underline">1. Coherence Potential ($\Psi$)</h3>
            <p className="mb-2 italic text-zinc-400">The metric of stability for a network node:</p>
            {/* Fix: Wrapped LaTeX in string to avoid JSX brace interpretation errors and doubled backslashes for JS escaping */}
            <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-center text-2xl font-serif py-6">
              {"$$\\Psi = \\sum_{i \\in \\{A,B,C\\}} \\cos(\\theta_i + \\Delta\\phi)$$" }
            </div>
            <p className="mt-2 text-sm">Where $\theta$ is the cumulative torsion angle. If $\Psi = 0$, the node is "invisible" (Vacuum).</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-amber-500 mb-2 underline">2. Relational Mass ($M_R$)</h3>
            <p className="mb-2 italic text-zinc-400">Mass is the integral of the "wound" string in the volume of node $V$:</p>
            {/* Consistency fix: string literal with escaped backslashes for LaTeX integrity in JSX */}
            <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-center text-2xl font-serif py-6">
              {"$$M_R = \\oint_V \\tau \\, dV$$"}
            </div>
            <p className="mt-2 text-sm">Where $\tau$ represents the Cartan torsion tensor.</p>
          </div>
        </div>
      </section>

      <div className="mt-24 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-xs">
        &copy; 2025 R-QNT RESEARCH CONSORTIUM. CONFIDENTIAL TOPOLOGICAL DATA.
      </div>
    </div>
  );
};

export default PaperView;
