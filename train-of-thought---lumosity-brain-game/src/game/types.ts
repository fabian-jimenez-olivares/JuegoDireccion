/**
 * Train of Thought - Game Data Types
 * Comprehensive data structures for levels, track topologies, switches, trains, and dynamic scoring.
 */

export type TrainColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface ColorMeta {
  id: TrainColor;
  name: string;
  nameEs: string;
  hex: string;
  darkHex: string;
  lightHex: string;
  accentHex: string;
  glowHex: string;
}

export const TRAIN_COLORS: Record<TrainColor, ColorMeta> = {
  red: {
    id: 'red',
    name: 'Red',
    nameEs: 'Rojo',
    hex: '#EF4444',
    darkHex: '#991B1B',
    lightHex: '#FCA5A5',
    accentHex: '#DC2626',
    glowHex: 'rgba(239, 68, 68, 0.4)',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    nameEs: 'Azul',
    hex: '#3B82F6',
    darkHex: '#1E40AF',
    lightHex: '#93C5FD',
    accentHex: '#2563EB',
    glowHex: 'rgba(59, 130, 246, 0.4)',
  },
  green: {
    id: 'green',
    name: 'Green',
    nameEs: 'Verde',
    hex: '#10B981',
    darkHex: '#065F46',
    lightHex: '#6EE7B7',
    accentHex: '#059669',
    glowHex: 'rgba(16, 185, 129, 0.4)',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    nameEs: 'Amarillo',
    hex: '#F59E0B',
    darkHex: '#92400E',
    lightHex: '#FDE68A',
    accentHex: '#D97706',
    glowHex: 'rgba(245, 158, 11, 0.4)',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    nameEs: 'Morado',
    hex: '#8B5CF6',
    darkHex: '#5B21B6',
    lightHex: '#C4B5FD',
    accentHex: '#7C3AED',
    glowHex: 'rgba(139, 92, 246, 0.4)',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    nameEs: 'Naranja',
    hex: '#F97316',
    darkHex: '#9A3412',
    lightHex: '#FDBA74',
    accentHex: '#EA580C',
    glowHex: 'rgba(249, 115, 22, 0.4)',
  },
};

export interface Point2D {
  x: number; // 0 to 1 normalized coordinate
  y: number; // 0 to 1 normalized coordinate
}

export interface TrackNode {
  id: string;
  x: number; // Normalized 0..1
  y: number; // Normalized 0..1
  type: 'spawn' | 'junction' | 'station';
  stationColor?: TrainColor;
  stationName?: string;
}

export interface TrackEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  // Control points for cubic or quadratic bezier curves
  cp1?: Point2D;
  cp2?: Point2D;
  length?: number;
}

export interface TrackSwitch {
  id: string;
  nodeId: string; // The junction node
  incomingEdgeId: string;
  outgoingEdgeIds: [string, string]; // [primary, alternate] (e.g. left / right)
  currentBranchIndex: 0 | 1;
  label?: string;
  tapRadius?: number; // Hitbox radius
  lastToggledAt?: number;
}

export interface Station {
  id: string;
  nodeId: string;
  color: TrainColor;
  x: number;
  y: number;
  deliveredCount: number;
  lastArrivalStatus?: 'success' | 'fail';
  lastArrivalTimestamp?: number;
}

export interface TrainCarriage {
  distanceBehind: number; // Distance in pixels behind engine
  x: number;
  y: number;
  angle: number;
}

export interface Train {
  id: string;
  color: TrainColor;
  currentEdgeId: string;
  progress: number; // 0.0 to 1.0 along the currentEdge
  speed: number; // Progress speed per millisecond
  spawnTime: number;
  carriages: TrainCarriage[];
  state: 'active' | 'delivered' | 'wrong_station';
  destinationStationId?: string;
  totalDistanceTraveled: number;
  switchesEncountered: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'smoke' | 'spark' | 'confetti';
}

export interface ScoreState {
  score: number;
  streak: number;
  maxStreak: number;
  multiplier: number; // e.g. 1.0x to 4.0x
  correctDeliveries: number;
  wrongDeliveries: number;
  totalDispatched: number;
  totalRemaining: number;
  accuracy: number; // 0 - 100%
  averageReactionSpeed: number; // ms
  lumosityLpi: number; // Cognitive score (like Lumosity Performance Index 600 - 1800)
  recentPointsEarned?: { points: number; multiplier: number; timestamp: number };
}

export interface LevelConfig {
  id: number;
  name: string;
  titleEs: string;
  descriptionEs: string;
  colors: TrainColor[];
  trainsToDeliver: number;
  spawnIntervalMs: number;
  minSpawnIntervalMs: number;
  trainSpeed: number; // speed multiplier
  maxSimultaneousTrains: number;
  topologyPreset: 'simple_split_2' | 'fork_3' | 'quad_4' | 'complex_5' | 'master_6';
  difficultyTier: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto' | 'Maestro';
}

export interface ProceduralPuzzleConfig {
  seed?: number;
  level: number;
  availableColors: TrainColor[];
  trainCount: number;
  speed: number;
  spawnInterval: number;
  switchesCount: number;
  branchesPerSwitch: number;
  patternType: 'balanced' | 'alternating' | 'burst_clusters' | 'high_entropy';
}

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'SUMMARY';
