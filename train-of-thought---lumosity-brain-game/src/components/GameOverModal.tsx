import React from 'react';
import { RotateCcw, ArrowRight, Home, Award, Brain, Target, Zap, TrendingUp, Star } from 'lucide-react';
import { ScoreState } from '../game/types';

interface GameOverModalProps {
  scoreState: ScoreState;
  levelTitle: string;
  isVictory: boolean;
  onRetry: () => void;
  onNextLevel?: () => void;
  onHome: () => void;
  onOpenDevSpec: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  scoreState,
  levelTitle,
  isVictory,
  onRetry,
  onNextLevel,
  onHome,
  onOpenDevSpec,
}) => {
  // Compute stars (1 to 3) based on accuracy
  const stars = scoreState.accuracy >= 90 ? 3 : scoreState.accuracy >= 70 ? 2 : 1;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[96dvh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center text-center">
        {/* Top Badge */}
        <div className="w-11 h-11 xs:w-12 xs:h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 mb-2 flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            {isVictory ? (
              <Award className="w-6 h-6 text-teal-400" />
            ) : (
              <Brain className="w-6 h-6 text-amber-400" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg xs:text-xl font-bold font-display text-white">
          {isVictory ? '¡Misión Completada!' : 'Sesión Finalizada'}
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">{levelTitle}</p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 my-2">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-5 h-5 transition-all ${
                starIdx <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Cognitive Index Banner (Lumosity LPI) */}
        <div className="w-full p-2.5 bg-gradient-to-r from-teal-950/60 via-slate-800/80 to-teal-950/60 rounded-2xl border border-teal-500/30 mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <Brain className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <span className="text-[9px] uppercase font-bold text-teal-300 tracking-wider">Índice Cognitivo</span>
              <p className="text-[11px] text-slate-300">Lumosity Performance (LPI)</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-display text-white tabular-nums">
              {scoreState.lumosityLpi}
            </span>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="w-full grid grid-cols-2 gap-1.5 mb-3">
          {/* Puntuación */}
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <TrendingUp className="w-3 h-3 text-teal-400" />
              <span>Puntuación</span>
            </div>
            <span className="text-base font-bold text-white tabular-nums">
              {scoreState.score.toLocaleString()}
            </span>
          </div>

          {/* Precisión */}
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Precisión</span>
            </div>
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              {scoreState.accuracy}%
            </span>
          </div>

          {/* Racha Máxima */}
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Racha Máx</span>
            </div>
            <span className="text-base font-bold text-white tabular-nums">
              {scoreState.maxStreak} trenes
            </span>
          </div>

          {/* Entregas Correctas */}
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <Award className="w-3 h-3 text-purple-400" />
              <span>Entregas</span>
            </div>
            <span className="text-base font-bold text-white tabular-nums">
              {scoreState.correctDeliveries} / {scoreState.correctDeliveries + scoreState.wrongDeliveries}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {isVictory && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-transform"
            >
              <span>Siguiente Nivel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRetry}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-4 h-4 text-teal-400" />
            <span>Volver a Jugar</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={onHome}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menú</span>
            </button>

            <button
              onClick={onOpenDevSpec}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-teal-800/40 transition-colors"
            >
              <span>Ver Lógica / Datos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
