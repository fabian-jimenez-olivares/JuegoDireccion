/**
 * Train of Thought - Procedural Puzzle & Topology Generator
 * Generates solvable, balanced track networks and cognitive train dispatch sequences.
 */

import { LevelConfig, Point2D, Station, TrackEdge, TrackNode, TrackSwitch, TrainColor } from './types';

export interface GeneratedTrackLayout {
  nodes: Map<string, TrackNode>;
  edges: Map<string, TrackEdge>;
  switches: Map<string, TrackSwitch>;
  stations: Map<string, Station>;
  spawnNodeId: string;
}

/**
 * Helper to compute cubic Bézier point
 */
export function getBezierPoint(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): Point2D {
  const oneMinusT = 1 - t;
  const c0 = oneMinusT * oneMinusT * oneMinusT;
  const c1 = 3 * oneMinusT * oneMinusT * t;
  const c2 = 3 * oneMinusT * t * t;
  const c3 = t * t * t;

  return {
    x: c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
    y: c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y,
  };
}

/**
 * Helper to compute cubic Bézier tangent derivative and angle
 */
export function getBezierTangent(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): { dx: number; dy: number; angle: number } {
  const oneMinusT = 1 - t;
  const d0 = 3 * oneMinusT * oneMinusT;
  const d1 = 6 * oneMinusT * t;
  const d2 = 3 * t * t;

  const dx = d0 * (p1.x - p0.x) + d1 * (p2.x - p1.x) + d2 * (p3.x - p2.x);
  const dy = d0 * (p1.y - p0.y) + d1 * (p2.y - p1.y) + d2 * (p3.y - p2.y);
  const angle = Math.atan2(dy, dx);

  return { dx, dy, angle };
}

/**
 * Pre-computes approximate length of an edge for constant speed
 */
export function calculateEdgeLength(
  fromNode: Point2D,
  toNode: Point2D,
  cp1?: Point2D,
  cp2?: Point2D
): number {
  if (!cp1 || !cp2) {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 10-step numerical integration
  let length = 0;
  let prev = fromNode;
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const pt = getBezierPoint(fromNode, cp1, cp2, toNode, i / steps);
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    length += Math.sqrt(dx * dx + dy * dy);
    prev = pt;
  }
  return length;
}

/**
 * Generates the track topology network tailored for the specific level preset
 */
export function generateTrackTopology(level: LevelConfig): GeneratedTrackLayout {
  const nodes = new Map<string, TrackNode>();
  const edges = new Map<string, TrackEdge>();
  const switches = new Map<string, TrackSwitch>();
  const stations = new Map<string, Station>();

  const spawnNodeId = 'node_spawn';

  // Helper to add node
  const addNode = (id: string, x: number, y: number, type: TrackNode['type'], stationColor?: TrainColor): TrackNode => {
    const node: TrackNode = { id, x, y, type, stationColor };
    nodes.set(id, node);
    return node;
  };

  // Helper to add edge
  const addEdge = (id: string, fromId: string, toId: string, cp1Offset?: Point2D, cp2Offset?: Point2D): TrackEdge => {
    const fromNode = nodes.get(fromId)!;
    const toNode = nodes.get(toId)!;

    let cp1: Point2D | undefined;
    let cp2: Point2D | undefined;

    if (cp1Offset && cp2Offset) {
      cp1 = { x: fromNode.x + cp1Offset.x, y: fromNode.y + cp1Offset.y };
      cp2 = { x: toNode.x + cp2Offset.x, y: toNode.y + cp2Offset.y };
    } else {
      // Natural smooth vertical flow curve
      const dy = toNode.y - fromNode.y;
      cp1 = { x: fromNode.x, y: fromNode.y + dy * 0.45 };
      cp2 = { x: toNode.x, y: toNode.y - dy * 0.45 };
    }

    const length = calculateEdgeLength(fromNode, toNode, cp1, cp2);
    const edge: TrackEdge = { id, fromNodeId: fromId, toNodeId: toId, cp1, cp2, length };
    edges.set(id, edge);
    return edge;
  };

  // Helper to add switch
  const addSwitch = (
    id: string,
    nodeId: string,
    incomingEdgeId: string,
    leftEdgeId: string,
    rightEdgeId: string,
    initialIndex: 0 | 1 = 0
  ): TrackSwitch => {
    const trackSwitch: TrackSwitch = {
      id,
      nodeId,
      incomingEdgeId,
      outgoingEdgeIds: [leftEdgeId, rightEdgeId],
      currentBranchIndex: initialIndex,
    };
    switches.set(id, trackSwitch);
    return trackSwitch;
  };

  // Helper to add station
  const addStation = (id: string, nodeId: string, color: TrainColor, x: number, y: number): Station => {
    const station: Station = {
      id,
      nodeId,
      color,
      x,
      y,
      deliveredCount: 0,
    };
    stations.set(id, station);
    return station;
  };

  // Common spawn node at top center
  addNode(spawnNodeId, 0.5, 0.08, 'spawn');

  switch (level.topologyPreset) {
    case 'simple_split_2': {
      // 2 colors: Red (Left), Blue (Right)
      // Switch at center
      addNode('junc_1', 0.5, 0.38, 'junction');
      addNode('station_node_0', 0.28, 0.84, 'station', level.colors[0]);
      addNode('station_node_1', 0.72, 0.84, 'station', level.colors[1]);

      addEdge('e_spawn_j1', spawnNodeId, 'junc_1');
      addEdge('e_j1_left', 'junc_1', 'station_node_0');
      addEdge('e_j1_right', 'junc_1', 'station_node_1');

      addSwitch('switch_1', 'junc_1', 'e_spawn_j1', 'e_j1_left', 'e_j1_right', 0);

      addStation('st_0', 'station_node_0', level.colors[0], 0.28, 0.84);
      addStation('st_1', 'station_node_1', level.colors[1], 0.72, 0.84);
      break;
    }

    case 'fork_3': {
      // 3 colors: Root switch forks to Station 0 (Left), and Switch 2 (Right) which forks to Station 1 & 2
      addNode('junc_1', 0.5, 0.30, 'junction');
      addNode('station_node_0', 0.20, 0.84, 'station', level.colors[0]);

      addNode('junc_2', 0.68, 0.54, 'junction');
      addNode('station_node_1', 0.52, 0.84, 'station', level.colors[1]);
      addNode('station_node_2', 0.84, 0.84, 'station', level.colors[2]);

      addEdge('e_spawn_j1', spawnNodeId, 'junc_1');
      addEdge('e_j1_left', 'junc_1', 'station_node_0');
      addEdge('e_j1_right', 'junc_1', 'junc_2');

      addEdge('e_j2_left', 'junc_2', 'station_node_1');
      addEdge('e_j2_right', 'junc_2', 'station_node_2');

      addSwitch('switch_1', 'junc_1', 'e_spawn_j1', 'e_j1_left', 'e_j1_right', 0);
      addSwitch('switch_2', 'junc_2', 'e_j1_right', 'e_j2_left', 'e_j2_right', 0);

      addStation('st_0', 'station_node_0', level.colors[0], 0.20, 0.84);
      addStation('st_1', 'station_node_1', level.colors[1], 0.52, 0.84);
      addStation('st_2', 'station_node_2', level.colors[2], 0.84, 0.84);
      break;
    }

    case 'quad_4': {
      // Full binary tree: Root switch at top -> Left switch & Right switch -> 4 Stations
      addNode('junc_root', 0.5, 0.26, 'junction');

      addNode('junc_left', 0.30, 0.52, 'junction');
      addNode('junc_right', 0.70, 0.52, 'junction');

      addNode('station_node_0', 0.16, 0.85, 'station', level.colors[0]);
      addNode('station_node_1', 0.38, 0.85, 'station', level.colors[1]);
      addNode('station_node_2', 0.62, 0.85, 'station', level.colors[2]);
      addNode('station_node_3', 0.84, 0.85, 'station', level.colors[3]);

      addEdge('e_spawn_root', spawnNodeId, 'junc_root');

      addEdge('e_root_left', 'junc_root', 'junc_left');
      addEdge('e_root_right', 'junc_root', 'junc_right');

      addEdge('e_jl_s0', 'junc_left', 'station_node_0');
      addEdge('e_jl_s1', 'junc_left', 'station_node_1');

      addEdge('e_jr_s2', 'junc_right', 'station_node_2');
      addEdge('e_jr_s3', 'junc_right', 'station_node_3');

      addSwitch('switch_root', 'junc_root', 'e_spawn_root', 'e_root_left', 'e_root_right', 0);
      addSwitch('switch_left', 'junc_left', 'e_root_left', 'e_jl_s0', 'e_jl_s1', 0);
      addSwitch('switch_right', 'junc_right', 'e_root_right', 'e_jr_s2', 'e_jr_s3', 1);

      addStation('st_0', 'station_node_0', level.colors[0], 0.16, 0.85);
      addStation('st_1', 'station_node_1', level.colors[1], 0.38, 0.85);
      addStation('st_2', 'station_node_2', level.colors[2], 0.62, 0.85);
      addStation('st_3', 'station_node_3', level.colors[3], 0.84, 0.85);
      break;
    }

    case 'complex_5': {
      // 5 colors: 4 switches
      addNode('junc_1', 0.5, 0.23, 'junction');
      addNode('junc_2', 0.32, 0.45, 'junction');
      addNode('junc_3', 0.68, 0.45, 'junction');
      addNode('junc_4', 0.78, 0.66, 'junction');

      addNode('station_node_0', 0.14, 0.85, 'station', level.colors[0]);
      addNode('station_node_1', 0.34, 0.85, 'station', level.colors[1]);
      addNode('station_node_2', 0.54, 0.85, 'station', level.colors[2]);
      addNode('station_node_3', 0.74, 0.85, 'station', level.colors[3]);
      addNode('station_node_4', 0.90, 0.85, 'station', level.colors[4]);

      addEdge('e_spawn_j1', spawnNodeId, 'junc_1');
      addEdge('e_j1_j2', 'junc_1', 'junc_2');
      addEdge('e_j1_j3', 'junc_1', 'junc_3');

      addEdge('e_j2_s0', 'junc_2', 'station_node_0');
      addEdge('e_j2_s1', 'junc_2', 'station_node_1');

      addEdge('e_j3_s2', 'junc_3', 'station_node_2');
      addEdge('e_j3_j4', 'junc_3', 'junc_4');

      addEdge('e_j4_s3', 'junc_4', 'station_node_3');
      addEdge('e_j4_s4', 'junc_4', 'station_node_4');

      addSwitch('switch_1', 'junc_1', 'e_spawn_j1', 'e_j1_j2', 'e_j1_j3', 0);
      addSwitch('switch_2', 'junc_2', 'e_j1_j2', 'e_j2_s0', 'e_j2_s1', 0);
      addSwitch('switch_3', 'junc_3', 'e_j1_j3', 'e_j3_s2', 'e_j3_j4', 0);
      addSwitch('switch_4', 'junc_4', 'e_j3_j4', 'e_j4_s3', 'e_j4_s4', 0);

      addStation('st_0', 'station_node_0', level.colors[0], 0.14, 0.85);
      addStation('st_1', 'station_node_1', level.colors[1], 0.34, 0.85);
      addStation('st_2', 'station_node_2', level.colors[2], 0.54, 0.85);
      addStation('st_3', 'station_node_3', level.colors[3], 0.74, 0.85);
      addStation('st_4', 'station_node_4', level.colors[4], 0.90, 0.85);
      break;
    }

    case 'master_6':
    default: {
      // 6 colors: 5 switches in balanced multi-tier network
      addNode('junc_1', 0.5, 0.22, 'junction');
      addNode('junc_2', 0.32, 0.42, 'junction');
      addNode('junc_3', 0.68, 0.42, 'junction');
      addNode('junc_4', 0.22, 0.63, 'junction');
      addNode('junc_5', 0.78, 0.63, 'junction');

      addNode('station_node_0', 0.12, 0.86, 'station', level.colors[0]);
      addNode('station_node_1', 0.26, 0.86, 'station', level.colors[1]);
      addNode('station_node_2', 0.42, 0.86, 'station', level.colors[2]);
      addNode('station_node_3', 0.58, 0.86, 'station', level.colors[3]);
      addNode('station_node_4', 0.74, 0.86, 'station', level.colors[4]);
      addNode('station_node_5', 0.88, 0.86, 'station', level.colors[5]);

      addEdge('e_spawn_j1', spawnNodeId, 'junc_1');
      addEdge('e_j1_j2', 'junc_1', 'junc_2');
      addEdge('e_j1_j3', 'junc_1', 'junc_3');

      // From J2
      addEdge('e_j2_j4', 'junc_2', 'junc_4');
      addEdge('e_j2_s2', 'junc_2', 'station_node_2');

      // From J4
      addEdge('e_j4_s0', 'junc_4', 'station_node_0');
      addEdge('e_j4_s1', 'junc_4', 'station_node_1');

      // From J3
      addEdge('e_j3_s3', 'junc_3', 'station_node_3');
      addEdge('e_j3_j5', 'junc_3', 'junc_5');

      // From J5
      addEdge('e_j5_s4', 'junc_5', 'station_node_4');
      addEdge('e_j5_s5', 'junc_5', 'station_node_5');

      addSwitch('switch_1', 'junc_1', 'e_spawn_j1', 'e_j1_j2', 'e_j1_j3', 0);
      addSwitch('switch_2', 'junc_2', 'e_j1_j2', 'e_j2_j4', 'e_j2_s2', 0);
      addSwitch('switch_3', 'junc_3', 'e_j1_j3', 'e_j3_s3', 'e_j3_j5', 1);
      addSwitch('switch_4', 'junc_4', 'e_j2_j4', 'e_j4_s0', 'e_j4_s1', 0);
      addSwitch('switch_5', 'junc_5', 'e_j3_j5', 'e_j5_s4', 'e_j5_s5', 1);

      addStation('st_0', 'station_node_0', level.colors[0], 0.12, 0.86);
      addStation('st_1', 'station_node_1', level.colors[1], 0.26, 0.86);
      addStation('st_2', 'station_node_2', level.colors[2], 0.42, 0.86);
      addStation('st_3', 'station_node_3', level.colors[3], 0.58, 0.86);
      addStation('st_4', 'station_node_4', level.colors[4], 0.74, 0.86);
      addStation('st_5', 'station_node_5', level.colors[5], 0.88, 0.86);
      break;
    }
  }

  return { nodes, edges, switches, stations, spawnNodeId };
}

/**
 * Procedural Sequence Generator
 * Generates an engaging sequence of trains designed to test attention switching,
 * inhibitory control, and cognitive planning.
 */
export function generateTrainSequence(level: LevelConfig): TrainColor[] {
  const sequence: TrainColor[] = [];
  const colors = level.colors;
  const count = level.trainsToDeliver;

  if (colors.length === 0) return [];
  if (colors.length === 1) return Array(count).fill(colors[0]);

  let lastColor: TrainColor | null = null;
  let streakOfSame = 0;

  for (let i = 0; i < count; i++) {
    // Determine dispatch pattern
    let chosenColor: TrainColor;

    // In early trains, ensure each color is introduced once
    if (i < colors.length) {
      chosenColor = colors[i];
    } else {
      const roll = Math.random();

      if (roll < 0.25 && lastColor && streakOfSame < 2) {
        // Pattern 1: Repeat same color (tests impulse control so player doesn't flip switch too soon)
        chosenColor = lastColor;
      } else if (roll < 0.65 && lastColor) {
        // Pattern 2: Alternating color (tests rapid switch flipping)
        const otherColors = colors.filter((c) => c !== lastColor);
        chosenColor = otherColors[Math.floor(Math.random() * otherColors.length)];
      } else {
        // Pattern 3: Balanced random selection
        chosenColor = colors[Math.floor(Math.random() * colors.length)];
      }
    }

    if (chosenColor === lastColor) {
      streakOfSame++;
    } else {
      streakOfSame = 1;
      lastColor = chosenColor;
    }

    sequence.push(chosenColor);
  }

  return sequence;
}

/**
 * Map out which station matches a given color
 */
export function findMatchingStation(stations: Map<string, Station>, color: TrainColor): Station | undefined {
  for (const station of stations.values()) {
    if (station.color === color) {
      return station;
    }
  }
  return undefined;
}
