/**
 * Train of Thought - Dynamic Scoring & Lumosity Performance Index (LPI)
 * Evaluates player precision, reaction speed, anticipation planning, and streak momentum.
 */

import { ScoreState } from './types';

export const INITIAL_SCORE_STATE: ScoreState = {
  score: 0,
  streak: 0,
  maxStreak: 0,
  multiplier: 1.0,
  correctDeliveries: 0,
  wrongDeliveries: 0,
  totalDispatched: 0,
  totalRemaining: 0,
  accuracy: 100,
  averageReactionSpeed: 850,
  lumosityLpi: 800,
};

/**
 * Computes the streak multiplier dynamically
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 20) return 3.5;
  if (streak >= 15) return 3.0;
  if (streak >= 10) return 2.5;
  if (streak >= 6) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

/**
 * Evaluates points earned on successful delivery based on speed and planning
 */
export function calculateDeliveryPoints(
  streak: number,
  timeToReachStationMs: number,
  switchesPreAligned: number = 0
): { basePoints: number; speedBonus: number; totalEarned: number; multiplier: number } {
  const basePoints = 100;
  const multiplier = getStreakMultiplier(streak);

  // Speed & Planning anticipation bonus
  // If player pre-aligned switches in advance without panic
  const planningBonus = Math.min(60, switchesPreAligned * 20);
  const quickDeliveryBonus = Math.max(10, Math.min(40, Math.round(40000 / Math.max(1500, timeToReachStationMs))));
  const speedBonus = planningBonus + quickDeliveryBonus;

  const totalEarned = Math.round((basePoints + speedBonus) * multiplier);

  return {
    basePoints,
    speedBonus,
    totalEarned,
    multiplier,
  };
}

/**
 * Calculates Lumosity-style Performance Index (LPI)
 * Measures Attention, Speed, and Planning capacity.
 */
export function computeLumosityLpi(
  correctDeliveries: number,
  wrongDeliveries: number,
  maxStreak: number,
  levelNumber: number,
  avgSpeedBonus: number
): number {
  const total = correctDeliveries + wrongDeliveries;
  if (total === 0) return 750;

  const accuracy = (correctDeliveries / total) * 100;

  // Lumosity scale typically ranges from 600 (novice) to 1800+ (top percentile)
  const baseLpi = 650;
  const accuracyComponent = (accuracy / 100) * 450;
  const streakComponent = Math.min(300, maxStreak * 22);
  const levelComponent = Math.min(350, levelNumber * 50);
  const speedComponent = Math.min(200, avgSpeedBonus * 2.5);

  const rawLpi = baseLpi + accuracyComponent + streakComponent + levelComponent + speedComponent;
  return Math.min(1950, Math.max(500, Math.round(rawLpi)));
}

/**
 * Updates score state on successful delivery
 */
export function recordSuccessDelivery(
  current: ScoreState,
  timeToReachStationMs: number,
  switchesPreAligned: number,
  levelNumber: number
): ScoreState {
  const newStreak = current.streak + 1;
  const newMaxStreak = Math.max(current.maxStreak, newStreak);
  const newMultiplier = getStreakMultiplier(newStreak);

  const { speedBonus, totalEarned } = calculateDeliveryPoints(newStreak, timeToReachStationMs, switchesPreAligned);

  const correctDeliveries = current.correctDeliveries + 1;
  const totalProcessed = correctDeliveries + current.wrongDeliveries;
  const accuracy = Math.round((correctDeliveries / totalProcessed) * 100);

  const lpi = computeLumosityLpi(correctDeliveries, current.wrongDeliveries, newMaxStreak, levelNumber, speedBonus);

  return {
    ...current,
    score: current.score + totalEarned,
    streak: newStreak,
    maxStreak: newMaxStreak,
    multiplier: newMultiplier,
    correctDeliveries,
    accuracy,
    lumosityLpi: lpi,
    recentPointsEarned: {
      points: totalEarned,
      multiplier: newMultiplier,
      timestamp: Date.now(),
    },
  };
}

/**
 * Updates score state on wrong delivery
 */
export function recordWrongDelivery(current: ScoreState, levelNumber: number): ScoreState {
  const wrongDeliveries = current.wrongDeliveries + 1;
  const totalProcessed = current.correctDeliveries + wrongDeliveries;
  const accuracy = Math.round((current.correctDeliveries / totalProcessed) * 100);

  const penalty = 50;
  const newScore = Math.max(0, current.score - penalty);

  const lpi = computeLumosityLpi(current.correctDeliveries, wrongDeliveries, current.maxStreak, levelNumber, 10);

  return {
    ...current,
    score: newScore,
    streak: 0,
    multiplier: 1.0,
    wrongDeliveries,
    accuracy,
    lumosityLpi: lpi,
    recentPointsEarned: {
      points: -penalty,
      multiplier: 1.0,
      timestamp: Date.now(),
    },
  };
}
