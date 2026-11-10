import React, { useState } from 'react';
import { X, Code2, Image as ImageIcon, Cpu, FileText, Check, Copy } from 'lucide-react';
import { TRAIN_COLORS } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/difficulty';

interface DevSpecModalProps {
  onClose: () => void;
}

export const DevSpecModal: React.FC<DevSpecModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'graphics' | 'data' | 'procedural'>('graphics');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 select-none animate-fadeIn text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-teal-400" />
          <div>
            <h2 className="text-base font-bold font-display text-white">Especificación Técnica & Gráficos</h2>
            <p className="text-[11px] text-slate-400">Estructuras de datos, lógica procedimental y assets</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl my-3 border border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('graphics')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'graphics' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Gráficos y Assets</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'data' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Estructura de Datos</span>
        </button>

        <button
          onClick={() => setActiveTab('procedural')}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'procedural' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Lógica Procedimental</span>
        </button>
      </div>

      {/* Tab 1: Graphics & Sprites */}
      {activeTab === 'graphics' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* AI Generated Game Assets */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-white mb-2 block">1. Imágenes Generadas para el Juego</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Suelo / Terreno Suave</span>
                <img
                  src="/src/assets/images/train_game_terrain_1794096632172.jpg"
                  alt="Suelo minimalista de trenes"
                  className="w-full h-24 object-cover rounded-xl border border-slate-700 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Banner & Icono App</span>
                <img
                  src="/src/assets/images/train_game_banner_1794096632523.jpg"
                  alt="Banner Lumosity Train of Thought"
                  className="w-full h-24 object-cover rounded-xl border border-slate-700 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Minimalist Vector Sprites */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">2. Sprites Minimalistas Renderizados en Canvas</span>

            {/* Locomotive & Carriage */}
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Locomotora & Vagón</p>
                <p className="text-[11px] text-slate-400">Chasis redondeado, foco delantero, chimenea y enganche articulado</p>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
                <div className="w-6 h-4 bg-red-500 rounded-sm border border-red-700 relative">
                  <div className="absolute right-0.5 top-1 w-1.5 h-2 bg-slate-900 rounded-xs"></div>
                  <div className="absolute left-0.5 top-1 w-2 h-1 bg-yellow-200"></div>
                </div>
                <div className="w-1 h-0.5 bg-slate-600"></div>
                <div className="w-5 h-3.5 bg-red-500 rounded-xs border border-red-700"></div>
              </div>
            </div>

            {/* Track Switch */}
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Desvío de Vía con Palanca</p>
                <p className="text-[11px] text-slate-400">Hitbox táctil de 48px, flecha de dirección LED y palanca mecánica</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-sky-400 flex items-center justify-center relative shadow-sm">
                <div className="w-3.5 h-0.5 bg-sky-400 -rotate-45"></div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"></div>
              </div>
            </div>

            {/* Track Rails & Sleepers */}
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Carril Doble & Traviesas de Madera</p>
                <p className="text-[11px] text-slate-400">Balasto de grava con líneas paralelas y traviesas ortogonales a la curva Bézier</p>
              </div>
              <div className="w-16 h-8 bg-slate-800 rounded-md border border-slate-700 flex items-center justify-around px-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-1 h-6 bg-slate-600"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Color Palette Specification */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">3. Paleta Cromática Funcional (Contraste Lumosity)</span>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TRAIN_COLORS).map((c) => (
                <div key={c.id} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: c.hex }}></div>
                  <div className="truncate">
                    <p className="font-semibold text-white text-[11px] truncate">{c.nameEs}</p>
                    <p className="font-mono text-[9px] text-slate-400">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data Structures */}
      {activeTab === 'data' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 font-mono">interface LevelConfig</span>
              <button
                onClick={() =>
                  handleCopy(
                    `export interface LevelConfig {\n  id: number;\n  name: string;\n  colors: TrainColor[];\n  trainsToDeliver: number;\n  spawnIntervalMs: number;\n  trainSpeed: number;\n  maxSimultaneousTrains: number;\n  topologyPreset: string;\n}`,
                    'levelConfig'
                  )
                }
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
              >
                {copied === 'levelConfig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copiar</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-teal-300 overflow-x-auto leading-snug">
{`export interface LevelConfig {
  id: number;
  name: string;
  colors: TrainColor[];
  trainsToDeliver: number;
  spawnIntervalMs: number;
  minSpawnIntervalMs: number;
  trainSpeed: number;
  maxSimultaneousTrains: number;
  topologyPreset: 'simple_split_2' | 'fork_3' | 'quad_4' | 'complex_5' | 'master_6';
  difficultyTier: string;
}`}
            </pre>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-sky-400 font-mono">interface TrackGraph & Switch</span>
            <pre className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-sky-300 overflow-x-auto leading-snug">
{`export interface TrackSwitch {
  id: string;
  nodeId: string;
  incomingEdgeId: string;
  outgoingEdgeIds: [string, string]; // [Left, Right]
  currentBranchIndex: 0 | 1;
}

export interface TrackEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  cp1?: Point2D; // Bézier control 1
  cp2?: Point2D; // Bézier control 2
  length: number;
}`}
            </pre>
          </div>

          {/* Presets Table */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-white mb-2 block">Niveles Configurados ({DIFFICULTY_PRESETS.length})</span>
            <div className="space-y-1.5 font-mono text-[10px]">
              {DIFFICULTY_PRESETS.map((p) => (
                <div key={p.id} className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{p.titleEs}</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>{p.colors.length} col</span>
                    <span>·</span>
                    <span>{p.trainSpeed}x vel</span>
                    <span>·</span>
                    <span className="text-teal-400">{p.difficultyTier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Procedural Logic */}
      {activeTab === 'procedural' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">1. Generador de Red Topológica (Bézier Tracks)</span>
            <p className="text-slate-400 leading-relaxed">
              Las vías se generan como un Grafo Dirigido Acíclico (DAG) con curvas cúbicas Bézier. Para cada nivel, la topología garantiza que <strong>todas las estaciones terminales sean alcanzables</strong> mediante una combinación binaria de desvíos ($2^N$ o red ramificada asimétrica).
            </p>
            <div className="p-2 bg-slate-950 rounded-xl font-mono text-[10px] text-amber-300">
              B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃<br />
              θ = atan2(B'(t).y, B'(t).x)
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">2. Generador de Secuencia Cognitiva</span>
            <p className="text-slate-400 leading-relaxed">
              El generador de trenes no es puramente aleatorio. Utiliza patrones de carga cognitiva:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li><strong>Alternancia Rápida (40%):</strong> Demanda cambios de dirección en ráfaga (conmutación de tareas).</li>
              <li><strong>Racha Homogénea (25%):</strong> Envía 2 trenes del mismo color seguidos (evalúa control inhibitorio).</li>
              <li><strong>Espaciado Dinámico:</strong> Calcula el tiempo mínimo de reacción (&Delta;t &ge; 1.4s) para evitar colisiones insolubles.</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">3. Ecuación de Puntuación Dinámica y LPI</span>
            <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[10px] text-teal-300 space-y-1">
              <p>Puntos = (Base 100 + Bonus Anticipación) × Multiplicador</p>
              <p>Multiplicador = 1.0x (racha &lt;3) ... 3.5x (racha &ge;20)</p>
              <p className="text-purple-300">LPI = 650 + (Precisión% × 4.5) + (RachaMáx × 22) + (Nivel × 50)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
