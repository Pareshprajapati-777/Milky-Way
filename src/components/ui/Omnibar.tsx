import React, { useState, useEffect, useRef } from 'react';
import { CELESTIAL_BODIES, CelestialBodyData, MoonData } from '../../data/astronomy';
import { Search, Compass, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

interface OmnibarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBody: (body: CelestialBodyData) => void;
  onSelectMoon: (body: CelestialBodyData, moon: MoonData) => void;
  onSelectGalaxy: () => void;
}

export const Omnibar: React.FC<OmnibarProps> = ({
  isOpen,
  onClose,
  onSelectBody,
  onSelectMoon,
  onSelectGalaxy
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten all celestial search targets
  const allResults: {
    type: 'galaxy' | 'planet' | 'moon';
    id: string;
    title: string;
    subtitle: string;
    bodyData?: CelestialBodyData;
    moonData?: MoonData;
    color: string;
  }[] = [
    {
      type: 'galaxy',
      id: 'milkyway',
      title: 'Milky Way Galaxy',
      subtitle: 'Barred Spiral Galaxy // 100,000 Light-Years // Home Galaxy',
      color: '#38BDF8'
    },
    ...Object.values(CELESTIAL_BODIES).map(body => ({
      type: 'planet' as const,
      id: body.id,
      title: body.name,
      subtitle: `${body.category.toUpperCase().replace('_', ' ')} // ${body.tagline}`,
      bodyData: body,
      color: body.accentColor
    })),
    ...Object.values(CELESTIAL_BODIES).flatMap(body =>
      body.moons.map(moon => ({
        type: 'moon' as const,
        id: moon.id,
        title: `${moon.name} (Moon of ${body.name.split(' ')[0]})`,
        subtitle: `NATURAL SATELLITE // Radius: ${moon.radiusKm} km // ${moon.description}`,
        bodyData: body,
        moonData: moon,
        color: moon.color
      }))
    )
  ];

  const filtered = allResults.filter(
    item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl bg-space-950/95 border border-cyber-cyan/40 shadow-glass-glow overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-space-900/60">
          <Search className="w-5 h-5 text-cyber-cyan" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any celestial body, planet, moon or galaxy (e.g. Earth, Europa, Jupiter, Sun)..."
            className="w-full bg-transparent text-white placeholder-gray-400 font-sans text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="font-mono text-[10px] text-gray-400 px-2 py-0.5 rounded bg-space-850 border border-white/10">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playUiClick();
                  if (item.type === 'galaxy') {
                    onSelectGalaxy();
                  } else if (item.type === 'planet' && item.bodyData) {
                    onSelectBody(item.bodyData);
                  } else if (item.type === 'moon' && item.bodyData && item.moonData) {
                    onSelectMoon(item.bodyData, item.moonData);
                  }
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-space-900 border border-transparent hover:border-white/10 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="font-tech text-sm font-bold text-white group-hover:text-cyber-cyan block">
                      {item.title}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400 block line-clamp-1">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <span className="font-tech text-xs text-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <span>TELEPORT</span>
                  <span>➔</span>
                </span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 font-mono text-xs">
              No celestial bodies matching "{query}" found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
