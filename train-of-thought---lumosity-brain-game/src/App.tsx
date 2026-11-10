import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Compass, HelpCircle, Code2, RotateCcw } from 'lucide-react';
import {
  GameState,
  LevelConfig,
  Particle,
  ScoreState,
  Station,
  TrackEdge,
  TrackNode,
  TrackSwitch,
  Train,
  TrainColor,
} from './game/types';
import { DIFFICULTY_PRESETS, calculateDynamicDifficulty } from './game/difficulty';
import {
  generateTrackTopology,
  generateTrainSequence,
  GeneratedTrackLayout,
} from './game/puzzleGenerator';
import { INITIAL_SCORE_STATE, recordSuccessDelivery, recordWrongDelivery } from './game/scoring';
import { RenderEngine } from './game/renderEngine';
import { soundEngine } from './game/audio';
import { AndroidFrame } from './components/AndroidFrame';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { TutorialModal } from './components/TutorialModal';
import { DevSpecModal } from './components/DevSpecModal';

export default function App() {
  // Navigation & Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(DIFFICULTY_PRESETS[0]);
  const [isFramed, setIsFramed] = useState<boolean>(true);

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showDevSpec, setShowDevSpec] = useState<boolean>(false);

  // Audio / Haptics / Speed
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [gameSpeedMultiplier, setGameSpeedMultiplier] = useState<number>(1.0);
  const gameSpeedMultiplierRef = useRef<number>(1.0);

  // Keep ref in sync with state for instantaneous loop updates
  useEffect(() => {
    gameSpeedMultiplierRef.current = gameSpeedMultiplier;
  }, [gameSpeedMultiplier]);

  const handleToggleSpeed = () => {
    setGameSpeedMultiplier((prev) => {
      const next = prev === 1.0 ? 1.8 : prev === 1.8 ? 2.5 : 1.0;
      soundEngine.triggerHaptic(25);
      return next;
    });
  };

  // Score
  const [scoreState, setScoreState] = useState<ScoreState>(INITIAL_SCORE_STATE);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Active Layout & Simulation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderEngineRef = useRef<RenderEngine | null>(null);

  const layoutRef = useRef<GeneratedTrackLayout | null>(null);
  const trainQueueRef = useRef<TrainColor[]>([]);
  const activeTrainsRef = useRef<Train[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // UI state for reactive HUD
  const [upcomingQueueUI, setUpcomingQueueUI] = useState<TrainColor[]>([]);
  const [trainsDeliveredCount, setTrainsDeliveredCount] = useState<number>(0);

  // Setup sound engine preferences
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    soundEngine.setHaptics(next);
  };

  /**
   * Initializes or resets a level session
   */
  const startLevel = useCallback((level: LevelConfig) => {
    setCurrentLevel(level);

    // Generate topology & sequence
    const layout = generateTrackTopology(level);
    layoutRef.current = layout;

    const sequence = generateTrainSequence(level);
    trainQueueRef.current = [...sequence];
    setUpcomingQueueUI([...sequence]);

    activeTrainsRef.current = [];
    particlesRef.current = [];
    lastSpawnTimeRef.current = Date.now() + 400; // Small delay before first train
    setTrainsDeliveredCount(0);

    setScoreState({
      ...INITIAL_SCORE_STATE,
      totalRemaining: sequence.length,
    });

    setGameState('PLAYING');
    soundEngine.playWhistle();
  }, []);

  /**
   * Spawns smoke particles from a train's chimney
   */
  const addTrainSmoke = (x: number, y: number) => {
    particlesRef.current.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 4 - 2),
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.6 - Math.random() * 0.5,
      size: 3 + Math.random() * 2.5,
      color: '#FFFFFF',
      alpha: 0.7,
      life: 0,
      maxLife: 35,
      type: 'smoke',
    });
  };

  /**
   * Spawns celebration confetti on correct station delivery
   */
  const addCelebrationConfetti = (x: number, y: number, colorHex: string) => {
    const palette = [colorHex, '#F59E0B', '#10B981', '#38BDF8', '#F43F5E'];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 3 + Math.random() * 3,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1.0,
        life: 0,
        maxLife: 45 + Math.random() * 20,
        type: 'confetti',
      });
    }
  };

  /**
   * Spawns switch spark particles on switch toggle
   */
  const addSwitchSparks = (x: number, y: number) => {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(2, 9),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 1.5,
        color: '#38BDF8',
        alpha: 0.9,
        life: 0,
        maxLife: 20,
        type: 'spark',
      });
    }
  };

  /**
   * Main game physics & animation loop
   */
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let isMounted = true;
    lastFrameTimeRef.current = performance.now();

    const loop = (timestamp: number) => {
      if (!isMounted) return;

      const rawDelta = timestamp - lastFrameTimeRef.current;
      const deltaTime = Math.min(64, rawDelta); // Cap delta to prevent teleports
      lastFrameTimeRef.current = timestamp;

      const layout = layoutRef.current;
      const engine = renderEngineRef.current;
      const now = Date.now();

      if (layout && engine) {
        const { nodes, edges, switches, stations, spawnNodeId } = layout;

        // Dynamic difficulty calculation based on streak
        const { speed: adjustedSpeed, spawnInterval: adjustedInterval, maxTrains } = calculateDynamicDifficulty(
          currentLevel,
          scoreState.streak,
          scoreState.correctDeliveries
        );

        const speedMult = gameSpeedMultiplierRef.current;
        const effectiveInterval = adjustedInterval / speedMult;

        // 1. Train Dispatcher
        if (
          trainQueueRef.current.length > 0 &&
          activeTrainsRef.current.length < maxTrains &&
          now - lastSpawnTimeRef.current >= effectiveInterval
        ) {
          const nextColor = trainQueueRef.current.shift()!;
          setUpcomingQueueUI([...trainQueueRef.current]);

          // Find first outgoing edge from spawn node
          const initialEdge = Array.from(edges.values()).find((e) => e.fromNodeId === spawnNodeId);
          if (initialEdge) {
            const newTrain: Train = {
              id: Math.random().toString(36).substring(2, 9),
              color: nextColor,
              currentEdgeId: initialEdge.id,
              progress: 0,
              speed: 0.00032 * adjustedSpeed, // Base speed
              spawnTime: now,
              carriages: [],
              state: 'active',
              totalDistanceTraveled: 0,
              switchesEncountered: 0,
            };
            activeTrainsRef.current.push(newTrain);
            lastSpawnTimeRef.current = now;
            soundEngine.playTrainChug();
          }
        }

        // 2. Train Physics & Rail Traversal (scaled by speedMult)
        for (let i = activeTrainsRef.current.length - 1; i >= 0; i--) {
          const train = activeTrainsRef.current[i];
          if (train.state !== 'active') continue;

          const currentEdge = edges.get(train.currentEdgeId);
          if (!currentEdge) continue;

          const edgeLength = currentEdge.length || 0.4;
          // Progress increments smoothly proportional to edge length & speed multiplier
          train.progress += (train.speed * deltaTime * speedMult) / (edgeLength * 2.2);

          // Spawn occasional smoke
          if (Math.random() < 0.2) {
            const fromNode = nodes.get(currentEdge.fromNodeId);
            if (fromNode) {
              const sx = engine.toScreenX(fromNode.x);
              const sy = engine.toScreenY(fromNode.y);
              addTrainSmoke(sx, sy);
            }
          }

          // Train reached end of current edge
          if (train.progress >= 1.0) {
            const reachedNode = nodes.get(currentEdge.toNodeId);

            if (reachedNode?.type === 'junction') {
              // Node is a track switch: Look up which switch controls this junction
              const sw = Array.from(switches.values()).find((s) => s.nodeId === reachedNode.id);
              if (sw) {
                train.switchesEncountered++;
                const nextBranchEdgeId = sw.outgoingEdgeIds[sw.currentBranchIndex];
                train.currentEdgeId = nextBranchEdgeId;
                train.progress = 0.0;
              } else {
                // Default fallback
                train.state = 'delivered';
              }
            } else if (reachedNode?.type === 'station') {
              // Train has arrived at terminal station!
              const targetStation = Array.from(stations.values()).find((s) => s.nodeId === reachedNode.id);
              const isCorrect = targetStation && targetStation.color === train.color;

              const stationScreenX = engine.toScreenX(targetStation ? targetStation.x : 0.5);
              const stationScreenY = engine.toScreenY(targetStation ? targetStation.y : 0.85);

              if (isCorrect && targetStation) {
                targetStation.deliveredCount++;
                targetStation.lastArrivalStatus = 'success';
                targetStation.lastArrivalTimestamp = now;

                addCelebrationConfetti(stationScreenX, stationScreenY, '#10B981');
                soundEngine.playSuccessDelivery(scoreState.streak + 1);

                setScoreState((prev) => {
                  const updated = recordSuccessDelivery(
                    prev,
                    now - train.spawnTime,
                    train.switchesEncountered,
                    currentLevel.id
                  );
                  return updated;
                });
              } else if (targetStation) {
                targetStation.lastArrivalStatus = 'fail';
                targetStation.lastArrivalTimestamp = now;

                soundEngine.playWrongDelivery();

                setScoreState((prev) => {
                  const updated = recordWrongDelivery(prev, currentLevel.id);
                  return updated;
                });
              }

              train.state = 'delivered';
              activeTrainsRef.current.splice(i, 1);
              setTrainsDeliveredCount((c) => c + 1);

              // Check if level session is completed
              if (trainQueueRef.current.length === 0 && activeTrainsRef.current.length === 0) {
                setIsVictory(true);
                setGameState('SUMMARY');
                return;
              }
            }
          }
        }

        // 3. Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.life >= p.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // 4. Render Frame
        engine.render(nodes, edges, switches, stations, activeTrainsRef.current, particlesRef.current, now);
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameState, currentLevel, scoreState.streak, scoreState.correctDeliveries]);

  const lastInteractionTimeRef = useRef<number>(0);

  /**
   * Handle Canvas Clicks & Touches: Toggles switches instantly
   */
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const now = Date.now();
    if (now - lastInteractionTimeRef.current < 120) return;
    lastInteractionTimeRef.current = now;

    const canvas = canvasRef.current;
    const engine = renderEngineRef.current;
    const layout = layoutRef.current;
    if (!canvas || !engine || !layout) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const hitSwitch = engine.hitTestSwitch(screenX, screenY, layout.switches, layout.nodes);

    if (hitSwitch) {
      // Toggle the branch (0 -> 1, or 1 -> 0)
      hitSwitch.currentBranchIndex = hitSwitch.currentBranchIndex === 0 ? 1 : 0;
      hitSwitch.lastToggledAt = Date.now();

      soundEngine.playSwitchClick();
      addSwitchSparks(screenX, screenY);
    }
  };

  /**
   * Attach canvas resize observer
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new RenderEngine(canvas);
    renderEngineRef.current = engine;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        engine.resize(width, height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [gameState]);

  return (
    <AndroidFrame isFramed={isFramed} onToggleFrame={() => setIsFramed(!isFramed)}>
      <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
        {/* Title Screen / Menu View */}
        {gameState === 'MENU' && (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden">
            {/* Top decorative branding */}
            <header className="w-full flex items-center justify-between pt-1 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>Lumosity Android Edition</span>
              </div>
              <button
                onClick={() => setShowDevSpec(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-teal-300 rounded-lg text-[11px] border border-slate-700/80 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Datos & Lógica</span>
              </button>
            </header>

            {/* Hero Artwork & Title - Centered & Scalable */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-1 min-h-0">
              <div className="relative w-20 h-20 xs:w-28 xs:h-28 sm:w-32 sm:h-32 rounded-2xl xs:rounded-3xl overflow-hidden shadow-2xl border-2 border-teal-500/40 p-0.5 mb-2 xs:mb-3 shrink-0 group">
                <img
                  src="/src/assets/images/train_game_icon_1794096632608.jpg"
                  alt="Train of Thought"
                  className="w-full h-full object-cover rounded-[14px] xs:rounded-[22px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h1 className="text-2xl xs:text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
                Train of Thought
              </h1>
              <p className="text-xs xs:text-sm text-teal-300 font-medium mt-0.5">Tren del Pensamiento</p>
              <p className="text-[11px] xs:text-xs text-slate-400 max-w-[280px] mt-1.5 leading-relaxed">
                Entrena tu <strong>atención dividida</strong> y <strong>planificación espacial</strong> guiando cada tren a la estación de su mismo color.
              </p>

              {/* Current Level Pill */}
              <div className="mt-2.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] xs:text-xs text-slate-300 flex items-center gap-2">
                <span className="text-teal-400 font-semibold">{currentLevel.titleEs}</span>
                <span className="text-slate-600">·</span>
                <span>{currentLevel.colors.length} Colores</span>
              </div>
            </div>

            {/* Bottom Actions - Fixed at bottom of container without scrolling */}
            <div className="w-full max-w-[320px] flex flex-col gap-2 pb-1 shrink-0">
              <button
                onClick={() => startLevel(currentLevel)}
                className="w-full h-11 xs:h-12 rounded-xl xs:rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm xs:text-base flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 active:scale-[0.98] transition-transform"
              >
                <Play className="w-4 h-4 xs:w-5 xs:h-5 fill-slate-950" />
                <span>Jugar Ahora</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowLevelSelect(true)}
                  className="h-9 xs:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>Niveles</span>
                </button>

                <button
                  onClick={() => setShowTutorial(true)}
                  className="h-9 xs:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cómo Jugar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Playing View */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <div className="relative w-full h-full flex flex-col">
            {/* Top Lumosity HUD with Speed-up button */}
            <GameHUD
              scoreState={scoreState}
              levelName={currentLevel.titleEs}
              upcomingQueue={upcomingQueueUI}
              trainsDelivered={trainsDeliveredCount}
              totalTargetTrains={currentLevel.trainsToDeliver}
              isMuted={isMuted}
              hapticsEnabled={hapticsEnabled}
              gameSpeedMultiplier={gameSpeedMultiplier}
              onPause={() => setGameState(gameState === 'PLAYING' ? 'PAUSED' : 'PLAYING')}
              onToggleMute={handleToggleMute}
              onToggleHaptics={handleToggleHaptics}
              onToggleSpeed={handleToggleSpeed}
            />

            {/* Interactive Rail Canvas */}
            <div className="relative flex-1 w-full h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-pointer touch-none"
                onClick={(e) => handleCanvasInteraction(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  if (touch) {
                    handleCanvasInteraction(touch.clientX, touch.clientY);
                  }
                }}
              />
            </div>

            {/* Pause Overlay */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 text-teal-400 fill-teal-400 translate-x-0.5" />
                </div>
                <h2 className="text-xl font-bold font-display text-white">Juego Pausado</h2>
                <p className="text-xs text-slate-400 mt-1 mb-5">Tómate un respiro antes de continuar la ruta</p>

                <div className="w-full max-w-[240px] flex flex-col gap-2">
                  <button
                    onClick={() => setGameState('PLAYING')}
                    className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Reanudar</span>
                  </button>
                  <button
                    onClick={() => startLevel(currentLevel)}
                    className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                    <span>Reiniciar Nivel</span>
                  </button>
                  <button
                    onClick={() => setGameState('MENU')}
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-medium text-xs transition-colors"
                  >
                    <span>Volver al Menú</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Over / Victory Summary */}
        {gameState === 'SUMMARY' && (
          <GameOverModal
            scoreState={scoreState}
            levelTitle={currentLevel.titleEs}
            isVictory={isVictory}
            onRetry={() => startLevel(currentLevel)}
            onNextLevel={() => {
              const nextId = currentLevel.id + 1;
              const nextLevel = DIFFICULTY_PRESETS.find((l) => l.id === nextId) || DIFFICULTY_PRESETS[0];
              startLevel(nextLevel);
            }}
            onHome={() => setGameState('MENU')}
            onOpenDevSpec={() => setShowDevSpec(true)}
          />
        )}

        {/* Level Select Modal */}
        {showLevelSelect && (
          <LevelSelectModal
            currentLevelId={currentLevel.id}
            onSelectLevel={(level) => {
              setCurrentLevel(level);
              setShowLevelSelect(false);
              startLevel(level);
            }}
            onClose={() => setShowLevelSelect(false)}
          />
        )}

        {/* Tutorial Modal */}
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

        {/* Dev Spec & Architecture Modal */}
        {showDevSpec && <DevSpecModal onClose={() => setShowDevSpec(false)} />}
      </div>
    </AndroidFrame>
  );
}
