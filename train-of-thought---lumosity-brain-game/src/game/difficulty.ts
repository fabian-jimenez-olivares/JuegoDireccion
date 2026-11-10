/**
 * Train of Thought - Difficulty Level Data Structures & Presets
 * Defines progressive levels with clear difficulty parameters:
 * - Color palette size (2 to 6 colors)
 * - Number of switches and topology
 * - Train speed and spawn intervals
 * - Cognitive load factor
 */

import { LevelConfig, TrainColor } from './types';

export const DIFFICULTY_PRESETS: LevelConfig[] = [
  {
    id: 1,
    name: 'Nivel 1: Primeros Raíles',
    titleEs: 'Nivel 1: Primeros Raíles',
    descriptionEs: '2 colores y 1 desvío simple. Aprende a sincronizar el cambio de vía.',
    colors: ['red', 'blue'],
    trainsToDeliver: 10,
    spawnIntervalMs: 4200,
    minSpawnIntervalMs: 3800,
    trainSpeed: 1.0,
    maxSimultaneousTrains: 1,
    topologyPreset: 'simple_split_2',
    difficultyTier: 'Principiante',
  },
  {
    id: 2,
    name: 'Nivel 2: Bifurcación Triple',
    titleEs: 'Nivel 2: Bifurcación Triple',
    descriptionEs: '3 colores y 2 desvíos conectados. Entrena la anticipación espacial.',
    colors: ['red', 'blue', 'green'],
    trainsToDeliver: 14,
    spawnIntervalMs: 3600,
    minSpawnIntervalMs: 3200,
    trainSpeed: 1.15,
    maxSimultaneousTrains: 2,
    topologyPreset: 'fork_3',
    difficultyTier: 'Principiante',
  },
  {
    id: 3,
    name: 'Nivel 3: Cruce Cuádruple',
    titleEs: 'Nivel 3: Cruce Cuádruple',
    descriptionEs: '4 colores y 3 desvíos en árbol binario. Atención dividida en dos niveles.',
    colors: ['red', 'blue', 'green', 'yellow'],
    trainsToDeliver: 18,
    spawnIntervalMs: 3100,
    minSpawnIntervalMs: 2700,
    trainSpeed: 1.3,
    maxSimultaneousTrains: 2,
    topologyPreset: 'quad_4',
    difficultyTier: 'Intermedio',
  },
  {
    id: 4,
    name: 'Nivel 4: Ritmo Acelerado',
    titleEs: 'Nivel 4: Ritmo Acelerado',
    descriptionEs: '4 colores con menor separación entre trenes. Requiere reflejos y planificación rápida.',
    colors: ['red', 'blue', 'green', 'yellow'],
    trainsToDeliver: 22,
    spawnIntervalMs: 2600,
    minSpawnIntervalMs: 2200,
    trainSpeed: 1.45,
    maxSimultaneousTrains: 3,
    topologyPreset: 'quad_4',
    difficultyTier: 'Intermedio',
  },
  {
    id: 5,
    name: 'Nivel 5: Red Quíntuple',
    titleEs: 'Nivel 5: Red Quíntuple',
    descriptionEs: '5 colores y 4 desvíos asimétricos. Mayor carga en memoria de trabajo y conmutación de tareas.',
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    trainsToDeliver: 26,
    spawnIntervalMs: 2400,
    minSpawnIntervalMs: 2000,
    trainSpeed: 1.6,
    maxSimultaneousTrains: 3,
    topologyPreset: 'complex_5',
    difficultyTier: 'Avanzado',
  },
  {
    id: 6,
    name: 'Nivel 6: Terminal Hexagonal',
    titleEs: 'Nivel 6: Terminal Hexagonal',
    descriptionEs: '6 colores con 5 desvíos interconectados. Máxima demanda en atención dividida.',
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    trainsToDeliver: 30,
    spawnIntervalMs: 2100,
    minSpawnIntervalMs: 1800,
    trainSpeed: 1.75,
    maxSimultaneousTrains: 4,
    topologyPreset: 'master_6',
    difficultyTier: 'Experto',
  },
  {
    id: 7,
    name: 'Nivel 7: Modo Maestro Sin Fin',
    titleEs: 'Nivel 7: Modo Maestro Sin Fin',
    descriptionEs: 'Red generada procedimentalmente con velocidad adaptativa según tu precisión.',
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    trainsToDeliver: 50,
    spawnIntervalMs: 1900,
    minSpawnIntervalMs: 1500,
    trainSpeed: 1.9,
    maxSimultaneousTrains: 4,
    topologyPreset: 'master_6',
    difficultyTier: 'Maestro',
  },
];

/**
 * Helper to dynamically compute difficulty parameters when scaling endless mode
 */
export function calculateDynamicDifficulty(
  baseLevel: LevelConfig,
  currentStreak: number,
  deliveriesCount: number
): { speed: number; spawnInterval: number; maxTrains: number } {
  // Gentle speed scaling based on performance
  const streakBoost = Math.min(0.4, currentStreak * 0.025);
  const progressBoost = Math.min(0.3, deliveriesCount * 0.01);
  const speed = baseLevel.trainSpeed + streakBoost + progressBoost;

  const intervalReduction = Math.min(
    baseLevel.spawnIntervalMs - baseLevel.minSpawnIntervalMs,
    currentStreak * 60 + deliveriesCount * 25
  );
  const spawnInterval = Math.max(
    baseLevel.minSpawnIntervalMs,
    baseLevel.spawnIntervalMs - intervalReduction
  );

  const maxTrains = currentStreak >= 10
    ? Math.min(5, baseLevel.maxSimultaneousTrains + 1)
    : baseLevel.maxSimultaneousTrains;

  return { speed, spawnInterval, maxTrains };
}
