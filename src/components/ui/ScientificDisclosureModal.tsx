import React from 'react';
import { X, ExternalLink, ShieldCheck, Scale, Compass, Orbit } from 'lucide-react';
import { SCIENTIFIC_DISCLOSURES } from '../../utils/astronomicalUnits';

interface ScientificDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificDisclosureModal: React.FC<ScientificDisclosureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-space-950 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_16px_64px_rgba(0,245,212,0.2)] text-white font-body">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-tech font-bold text-lg text-white tracking-wide">
              SCIENTIFIC METHODOLOGY & DISCLOSURES
            </h2>
            <p className="text-xs font-mono text-cyan-300/80">
              Astronomical Standards, Coordinate Systems & Visualization Scaling
            </p>
          </div>
        </div>

        {/* Content Disclosures */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
          {SCIENTIFIC_DISCLOSURES.map((item, index) => (
            <div key={index} className="p-3.5 rounded-xl bg-space-900/60 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-tech font-bold text-cyan-200 text-sm tracking-wide">
                  {item.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {item.category}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-[12px]">
                {item.description}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                <span className="text-amber-400 font-bold">SOURCE:</span> {item.source}
              </div>
            </div>
          ))}

          {/* Reference Citation */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed font-mono">
            <strong>DATA PROVENANCE:</strong> Physical orbital and atmospheric parameters originate from NASA JPL Solar System Dynamics (SSD), IAU Division I Astrometry, and the Goddard Space Flight Center Planetary Fact Sheets. Simulation models are implemented with Keplerian physics and real-time GPU compute.
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-400">
          <span>IAU 2012 / 2015 Ephemeris Compliant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-tech font-bold hover:bg-cyan-400 transition-all shadow-[0_0_16px_rgba(0,245,212,0.4)]"
          >
            ACKNOWLEDGE & PROCEED
          </button>
        </div>
      </div>
    </div>
  );
};
