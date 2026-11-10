import React from 'react';
import { X, Play, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { DIFFICULTY_PRESETS } from '../game/difficulty';
import { LevelConfig, TRAIN_COLORS } from '../game/types';

interface LevelSelectModalProps {
  currentLevelId: number;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold font-display text-white">Selección de Niveles</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Level List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
        {DIFFICULTY_PRESETS.map((level) => {
          const isSelected = level.id === currentLevelId;

          const tierColor =
            level.difficultyTier === 'Principiante'
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
              : level.difficultyTier === 'Intermedio'
              ? 'text-teal-400 border-teal-500/30 bg-teal-950/20'
              : level.difficultyTier === 'Avanzado'
              ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
              : level.difficultyTier === 'Experto'
              ? 'text-rose-400 border-rose-500/30 bg-rose-950/20'
              : 'text-purple-400 border-purple-500/30 bg-purple-950/20';

          return (
            <div
              key={level.id}
              onClick={() => onSelectLevel(level)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                isSelected
                  ? 'bg-slate-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold font-display text-white border border-slate-700">
                    {level.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{level.titleEs}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${tierColor}`}>
                        {level.difficultyTier}
                      </span>
                      <span className="text-[11px] text-slate-400">{level.trainsToDeliver} trenes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
                  <button className="w-8 h-8 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 flex items-center justify-center transition-colors">
                    <Play className="w-3.5 h-3.5 fill-teal-400" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-snug">{level.descriptionEs}</p>

              {/* Color dots preview */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Colores:</span>
                  <div className="flex items-center gap-1">
                    {level.colors.map((color) => {
                      const meta = TRAIN_COLORS[color];
                      return (
                        <div
                          key={color}
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: meta.hex }}
                          title={meta.nameEs}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Velocidad: {level.trainSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
