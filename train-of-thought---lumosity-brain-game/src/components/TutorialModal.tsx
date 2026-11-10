import React from 'react';
import { X, Check, HelpCircle, GitFork, Zap, Clock, ShieldCheck } from 'lucide-react';
import { TRAIN_COLORS } from '../game/types';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold font-display text-white">Cómo Jugar: Train of Thought</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Guide Content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-slate-300 text-xs leading-relaxed">
        {/* Step 1: Matching colors */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">1. Empareja los Colores</h3>
            <p className="text-slate-400">
              Cada tren tiene un color específico. Tu objetivo es conducirlo por las vías hasta la estación terminal con su mismo color.
            </p>
            <div className="flex items-center gap-2 mt-2">
              {(['red', 'blue', 'green', 'yellow'] as const).map((c) => (
                <div
                  key={c}
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: TRAIN_COLORS[c].hex }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Switches */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
            <GitFork className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">2. Cambia los Desvíos</h3>
            <p className="text-slate-400">
              Toca o haz clic sobre los desvíos circulares en las intersecciones. La flecha luminosa te mostrará el camino activo (izquierda o derecha).
            </p>
          </div>
        </div>

        {/* Step 3: Train Queue & Planning */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">3. Anticípate a la Cola</h3>
            <p className="text-slate-400">
              En la parte superior verás qué trenes están a punto de salir. Planifica los desvíos con antelación para no tener que actuar en el último segundo.
            </p>
          </div>
        </div>

        {/* Step 4: Multiplier and LPI */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">4. Puntuación y Multiplicador</h3>
            <p className="text-slate-400">
              Entregar trenes seguidos sin errores eleva tu multiplicador hasta <strong className="text-amber-400">3.5x</strong> y tu índice cognitivo LPI. Si un tren llega a la estación errónea, la racha se reinicia.
            </p>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="pt-2 shrink-0">
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-transform"
        >
          <Check className="w-4 h-4" />
          <span>¡Entendido! A Jugar</span>
        </button>
      </div>
    </div>
  );
};
