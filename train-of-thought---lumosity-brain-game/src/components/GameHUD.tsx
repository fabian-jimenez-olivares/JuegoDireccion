import React from 'react';
import { Pause, Volume2, VolumeX, Vibrate, Zap, FastForward } from 'lucide-react';
import { ScoreState, TrainColor, TRAIN_COLORS } from '../game/types';

interface GameHUDProps {
  scoreState: ScoreState;
  levelName: string;
  upcomingQueue: TrainColor[];
  trainsDelivered: number;
  totalTargetTrains: number;
  isMuted: boolean;
  hapticsEnabled: boolean;
  gameSpeedMultiplier: number;
  onPause: () => void;
  onToggleMute: () => void;
  onToggleHaptics: () => void;
  onToggleSpeed: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  scoreState,
  levelName,
  upcomingQueue,
  trainsDelivered,
  totalTargetTrains,
  isMuted,
  hapticsEnabled,
  gameSpeedMultiplier,
  onPause,
  onToggleMute,
  onToggleHaptics,
  onToggleSpeed,
}) => {
  const streak = scoreState.streak;
  let nextTier = 3;
  let prevTier = 0;
  if (streak >= 15) {
    prevTier = 15;
    nextTier = 20;
  } else if (streak >= 10) {
    prevTier = 10;
    nextTier = 15;
  } else if (streak >= 6) {
    prevTier = 6;
    nextTier = 10;
  } else if (streak >= 3) {
    prevTier = 3;
    nextTier = 6;
  }
  const progressRatio = Math.min(1, Math.max(0, (streak - prevTier) / (nextTier - prevTier)));

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex flex-col p-2 pointer-events-none select-none">
      {/* Top HUD Bar - Compact for mobile */}
      <div className="flex items-center justify-between gap-1 pointer-events-auto">
        {/* Left: Pause & Level */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPause}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700/60 shadow-md backdrop-blur-md active:scale-95 transition-transform"
            title="Pausar juego"
            aria-label="Pausa"
          >
            <Pause className="w-3 h-3 text-slate-200" />
          </button>

          <div className="px-1.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-md flex flex-col justify-center">
            <span className="text-[8px] uppercase font-bold tracking-wider text-teal-400">Nivel</span>
            <span className="text-[10px] font-semibold text-slate-100 truncate max-w-[80px]">{levelName}</span>
          </div>
        </div>

        {/* Center: Score & Multiplier */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold font-display text-white tabular-nums drop-shadow-sm leading-none">
              {scoreState.score.toLocaleString()}
            </span>
            <span className="text-[9px] font-semibold text-teal-300">pts</span>
          </div>

          {/* Multiplier Badge & Bar */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex items-center gap-0.5 text-[8.5px] font-bold text-amber-400">
              <Zap className="w-2.5 h-2.5 fill-amber-400" />
              <span>{scoreState.multiplier.toFixed(1)}x</span>
            </div>
            <div className="w-10 h-1 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right: Acceleration button & Audio controls */}
        <div className="flex items-center gap-1">
          {/* Speed-up / Fast Forward Toggle */}
          <button
            onClick={onToggleSpeed}
            className={`h-7 px-1.5 rounded-lg flex items-center gap-1 border shadow-md backdrop-blur-md active:scale-95 transition-all ${
              gameSpeedMultiplier > 1
                ? 'bg-amber-500/25 border-amber-400/90 text-amber-300 shadow-amber-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/60 text-slate-300'
            }`}
            title="Acelerar velocidad del juego"
            aria-label="Acelerar juego"
          >
            <FastForward className={`w-3 h-3 ${gameSpeedMultiplier > 1 ? 'fill-amber-300' : ''}`} />
            <span className="text-[9px] font-bold tabular-nums">{gameSpeedMultiplier.toFixed(1)}x</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700/60 shadow-md backdrop-blur-md active:scale-95 transition-transform"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-slate-200" />}
          </button>

          <button
            onClick={onToggleHaptics}
            className={`w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 flex items-center justify-center border border-slate-700/60 shadow-md backdrop-blur-md active:scale-95 transition-transform ${
              hapticsEnabled ? 'text-teal-400' : 'text-slate-500'
            }`}
            title={hapticsEnabled ? 'Vibración activa' : 'Vibración desactivada'}
          >
            <Vibrate className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Secondary Ribbon: Train Dispatch Queue & Progress Bar */}
      <div className="mt-1 flex items-center justify-between gap-2 px-2 py-0.5 rounded-lg bg-slate-950/75 border border-slate-800/80 backdrop-blur-md pointer-events-auto">
        {/* Train Queue Preview */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8.5px] uppercase font-bold text-slate-400">Próximos:</span>
          <div className="flex items-center gap-1">
            {upcomingQueue.slice(0, 3).map((color, idx) => {
              const meta = TRAIN_COLORS[color];
              return (
                <div
                  key={`${color}-${idx}`}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs border border-white/40"
                  style={{ backgroundColor: meta.hex }}
                  title={`Tren ${meta.nameEs}`}
                >
                  <div className="w-1 h-1 rounded-full bg-white/40"></div>
                </div>
              );
            })}
            {upcomingQueue.length === 0 && (
              <span className="text-[8.5px] text-slate-400 font-medium">Últimos</span>
            )}
          </div>
        </div>

        {/* Delivery Counter */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-slate-400 text-[9px]">Entregados:</span>
          <span className="font-bold text-slate-200 tabular-nums">
            {trainsDelivered} / {totalTargetTrains}
          </span>
        </div>
      </div>

      {/* Floating recent point notification if any */}
      {scoreState.recentPointsEarned && Date.now() - scoreState.recentPointsEarned.timestamp < 1200 && (
        <div className="self-center mt-1.5 animate-bounce px-2 py-0.5 rounded-full bg-teal-500/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-sm pointer-events-none">
          {scoreState.recentPointsEarned.points > 0 ? `+${scoreState.recentPointsEarned.points}` : scoreState.recentPointsEarned.points} pts
          {scoreState.recentPointsEarned.multiplier > 1 && ` (${scoreState.recentPointsEarned.multiplier}x)`}
        </div>
      )}
    </div>
  );
};
