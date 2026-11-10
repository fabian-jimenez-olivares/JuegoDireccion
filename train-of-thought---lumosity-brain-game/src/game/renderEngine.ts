/**
 * Train of Thought - Canvas 2D Rendering Engine (Mobile-Optimized)
 * Proportionally scaled for authentic Android smartphone screens (360px - 390px width).
 * Slim, elegant tracks, miniature toy trains, and crisp touch-responsive switches.
 */

import { Point2D, Station, TrackEdge, TrackNode, TrackSwitch, Train, TRAIN_COLORS, Particle } from './types';
import { getBezierPoint, getBezierTangent } from './puzzleGenerator';

export class RenderEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  private terrainImage: HTMLImageElement | null = null;
  private terrainLoaded: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.loadTerrain();
  }

  private loadTerrain() {
    this.terrainImage = new Image();
    this.terrainImage.src = '/src/assets/images/train_game_terrain_1794096632172.jpg';
    this.terrainImage.onload = () => {
      this.terrainLoaded = true;
    };
    this.terrainImage.onerror = () => {
      this.terrainLoaded = false;
    };
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const canvas = this.ctx.canvas;
    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  public toScreenX(normX: number): number {
    return normX * this.width;
  }

  public toScreenY(normY: number): number {
    return normY * this.height;
  }

  /**
   * Mobile scale factor relative to a standard Android phone (380px width)
   */
  private getMobileScale(): number {
    return Math.max(0.65, Math.min(1.0, this.width / 380));
  }

  /**
   * Main render frame
   */
  public render(
    nodes: Map<string, TrackNode>,
    edges: Map<string, TrackEdge>,
    switches: Map<string, TrackSwitch>,
    stations: Map<string, Station>,
    trains: Train[],
    particles: Particle[],
    now: number
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    const scale = this.getMobileScale();

    // 1. Draw Background Terrain
    this.drawTerrain();

    // 2. Draw Track Ballast & Rails (Slim & delicate)
    this.drawAllTracks(edges, nodes, scale);

    // 3. Draw Stations (Mobile compact)
    this.drawStations(stations, scale, now);

    // 4. Draw Switches (Junction hubs and levers)
    this.drawSwitches(switches, nodes, edges, scale, now);

    // 5. Draw Trains (Engine + Carriages)
    this.drawTrains(trains, edges, nodes, scale);

    // 6. Draw Smoke & Celebration Particles
    this.drawParticles(particles);

    ctx.restore();
  }

  /**
   * Background: Serene Lumosity meadow
   */
  private drawTerrain() {
    const ctx = this.ctx;
    if (this.terrainLoaded && this.terrainImage) {
      ctx.drawImage(this.terrainImage, 0, 0, this.width, this.height);
      // Soft vignette
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      // High-polish vector meadow fallback
      const grad = ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#A7F3D0');
      grad.addColorStop(0.5, '#6EE7B7');
      grad.addColorStop(1, '#34D399');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = this.height * (0.2 + i * 0.18);
        ctx.ellipse(this.width * 0.5, y, this.width * 0.6, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw railroad tracks with wooden sleepers and dual steel rails scaled for mobile
   */
  private drawAllTracks(
    edges: Map<string, TrackEdge>,
    nodes: Map<string, TrackNode>,
    scale: number
  ) {
    const ctx = this.ctx;
    const ballastEdgeWidth = Math.round(15 * scale);
    const ballastFillWidth = Math.round(12 * scale);
    const sleeperHalfWidth = 6.0 * scale;
    const sleeperLineWidth = 2.0 * scale;
    const railOffset = 3.2 * scale;
    const railLineWidth = 1.8 * scale;

    // First Pass: Ballast gravel bed
    for (const edge of edges.values()) {
      const fromNode = nodes.get(edge.fromNodeId);
      const toNode = nodes.get(edge.toNodeId);
      if (!fromNode || !toNode) continue;

      const p0 = { x: this.toScreenX(fromNode.x), y: this.toScreenY(fromNode.y) };
      const p3 = { x: this.toScreenX(toNode.x), y: this.toScreenY(toNode.y) };
      const p1 = edge.cp1 ? { x: this.toScreenX(edge.cp1.x), y: this.toScreenY(edge.cp1.y) } : p0;
      const p2 = edge.cp2 ? { x: this.toScreenX(edge.cp2.x), y: this.toScreenY(edge.cp2.y) } : p3;

      // Ballast border
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = ballastEdgeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Ballast fill
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = ballastFillWidth;
      ctx.stroke();
    }

    // Second Pass: Wooden Sleepers (Ties)
    for (const edge of edges.values()) {
      const fromNode = nodes.get(edge.fromNodeId);
      const toNode = nodes.get(edge.toNodeId);
      if (!fromNode || !toNode) continue;

      const p0 = { x: this.toScreenX(fromNode.x), y: this.toScreenY(fromNode.y) };
      const p3 = { x: this.toScreenX(toNode.x), y: this.toScreenY(toNode.y) };
      const p1 = edge.cp1 ? { x: this.toScreenX(edge.cp1.x), y: this.toScreenY(edge.cp1.y) } : p0;
      const p2 = edge.cp2 ? { x: this.toScreenX(edge.cp2.x), y: this.toScreenY(edge.cp2.y) } : p3;

      const numTies = Math.max(10, Math.round((edge.length || 0.4) * (this.height / 11)));
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = sleeperLineWidth;
      ctx.lineCap = 'butt';

      for (let i = 0; i <= numTies; i++) {
        const t = i / numTies;
        const pt = getBezierPoint(p0, p1, p2, p3, t);
        const { angle } = getBezierTangent(p0, p1, p2, p3, t);
        const normalAngle = angle + Math.PI / 2;

        const x1 = pt.x + Math.cos(normalAngle) * sleeperHalfWidth;
        const y1 = pt.y + Math.sin(normalAngle) * sleeperHalfWidth;
        const x2 = pt.x - Math.cos(normalAngle) * sleeperHalfWidth;
        const y2 = pt.y - Math.sin(normalAngle) * sleeperHalfWidth;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Third Pass: Dual Steel Rails
    for (const edge of edges.values()) {
      const fromNode = nodes.get(edge.fromNodeId);
      const toNode = nodes.get(edge.toNodeId);
      if (!fromNode || !toNode) continue;

      const p0 = { x: this.toScreenX(fromNode.x), y: this.toScreenY(fromNode.y) };
      const p3 = { x: this.toScreenX(toNode.x), y: this.toScreenY(toNode.y) };
      const p1 = edge.cp1 ? { x: this.toScreenX(edge.cp1.x), y: this.toScreenY(edge.cp1.y) } : p0;
      const p2 = edge.cp2 ? { x: this.toScreenX(edge.cp2.x), y: this.toScreenY(edge.cp2.y) } : p3;

      const railSteps = Math.max(22, Math.round((edge.length || 0.4) * (this.height / 5)));
      const leftRailPts: Point2D[] = [];
      const rightRailPts: Point2D[] = [];

      for (let i = 0; i <= railSteps; i++) {
        const t = i / railSteps;
        const pt = getBezierPoint(p0, p1, p2, p3, t);
        const { angle } = getBezierTangent(p0, p1, p2, p3, t);
        const normalAngle = angle + Math.PI / 2;

        leftRailPts.push({
          x: pt.x + Math.cos(normalAngle) * railOffset,
          y: pt.y + Math.sin(normalAngle) * railOffset,
        });
        rightRailPts.push({
          x: pt.x - Math.cos(normalAngle) * railOffset,
          y: pt.y - Math.sin(normalAngle) * railOffset,
        });
      }

      // Left rail
      ctx.beginPath();
      ctx.moveTo(leftRailPts[0].x, leftRailPts[0].y);
      for (let i = 1; i < leftRailPts.length; i++) {
        ctx.lineTo(leftRailPts[i].x, leftRailPts[i].y);
      }
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = railLineWidth;
      ctx.stroke();

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Right rail
      ctx.beginPath();
      ctx.moveTo(rightRailPts[0].x, rightRailPts[0].y);
      for (let i = 1; i < rightRailPts.length; i++) {
        ctx.lineTo(rightRailPts[i].x, rightRailPts[i].y);
      }
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = railLineWidth;
      ctx.stroke();

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  /**
   * Draw interactive switch junctions with directional LED arrows and clean mobile proportions
   */
  private drawSwitches(
    switches: Map<string, TrackSwitch>,
    nodes: Map<string, TrackNode>,
    edges: Map<string, TrackEdge>,
    scale: number,
    now: number
  ) {
    const ctx = this.ctx;
    const visualRadius = Math.round(13.5 * scale); // 27px diameter (compact and elegant)

    for (const sw of switches.values()) {
      const node = nodes.get(sw.nodeId);
      if (!node) continue;

      const sx = this.toScreenX(node.x);
      const sy = this.toScreenY(node.y);

      // Subtle glow pulse
      const pulse = 1 + Math.sin(now * 0.005) * 0.08;
      ctx.beginPath();
      ctx.arc(sx, sy, visualRadius * 1.35 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fill();

      // Switch Hub Base
      ctx.beginPath();
      ctx.arc(sx, sy, visualRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Outer border
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.8 * scale;
      ctx.stroke();

      // Active branch indicator
      const activeBranch = sw.currentBranchIndex;
      const activeEdgeId = sw.outgoingEdgeIds[activeBranch];
      const activeEdge = edges.get(activeEdgeId);

      let arrowAngle = activeBranch === 0 ? -Math.PI / 4 : Math.PI / 4;
      if (activeEdge) {
        const fromNode = nodes.get(activeEdge.fromNodeId);
        const toNode = nodes.get(activeEdge.toNodeId);
        if (fromNode && toNode) {
          const dx = this.toScreenX(toNode.x) - sx;
          const dy = this.toScreenY(toNode.y) - sy;
          arrowAngle = Math.atan2(dy, dx);
        }
      }

      // Draw directional arrow
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(arrowAngle);

      const arrowLen = 6.5 * scale;
      ctx.beginPath();
      ctx.moveTo(-arrowLen * 0.8, 0);
      ctx.lineTo(arrowLen * 0.8, 0);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.2 * scale;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(arrowLen * 0.2, -4 * scale);
      ctx.lineTo(arrowLen * 0.9, 0);
      ctx.lineTo(arrowLen * 0.2, 4 * scale);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.2 * scale;
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.restore();

      // Mechanical toggle lever knob
      const leverAngle = activeBranch === 0 ? -Math.PI * 0.75 : -Math.PI * 0.25;
      const lx = sx + Math.cos(leverAngle) * (visualRadius + 4 * scale);
      const ly = sy + Math.sin(leverAngle) * (visualRadius + 4 * scale);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(lx, ly);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lx, ly, 3.8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /**
   * Draw terminal stations dynamically proportioned for mobile screen width
   */
  private drawStations(stations: Map<string, Station>, scale: number, now: number) {
    const ctx = this.ctx;
    const numStations = stations.size || 4;

    // Dynamically size station width so 2, 4, 5 or 6 stations never collide
    const maxAvailableWidth = (this.width / (numStations + 0.6)) * 0.88;
    const stationWidth = Math.min(40 * scale, Math.max(26, maxAvailableWidth));
    const stationHeight = Math.round(stationWidth * 0.78);
    const roofHeight = Math.round(stationHeight * 0.35);

    for (const station of stations.values()) {
      const colorMeta = TRAIN_COLORS[station.color];
      const sx = this.toScreenX(station.x);
      const sy = this.toScreenY(station.y);

      // Drop shadow
      ctx.beginPath();
      ctx.roundRect(sx - stationWidth / 2, sy - stationHeight / 2 + 2, stationWidth, stationHeight, 7);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fill();

      // Station Body
      ctx.beginPath();
      ctx.roundRect(sx - stationWidth / 2, sy - stationHeight / 2, stationWidth, stationHeight, 7);
      ctx.fillStyle = '#1E293B';
      ctx.fill();

      // Station Colored Roof & Trim
      ctx.beginPath();
      ctx.roundRect(sx - stationWidth / 2, sy - stationHeight / 2, stationWidth, roofHeight, [7, 7, 0, 0]);
      ctx.fillStyle = colorMeta.hex;
      ctx.fill();

      // Roof highlight
      ctx.beginPath();
      ctx.roundRect(sx - stationWidth / 2 + 2, sy - stationHeight / 2 + 1.5, stationWidth - 4, 2, 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      // Station Entrance Archway (Dark train entrance)
      const archWidth = Math.round(stationWidth * 0.46);
      const archHeight = Math.round(stationHeight * 0.52);
      ctx.beginPath();
      ctx.roundRect(sx - archWidth / 2, sy - stationHeight / 2 + roofHeight - 1, archWidth, archHeight, [4, 4, 0, 0]);
      ctx.fillStyle = '#0F172A';
      ctx.fill();

      // Border
      ctx.beginPath();
      ctx.roundRect(sx - stationWidth / 2, sy - stationHeight / 2, stationWidth, stationHeight, 7);
      ctx.strokeStyle = colorMeta.accentHex;
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Delivered Count Counter Pill
      if (station.deliveredCount > 0) {
        const badgeRadius = 7 * scale;
        const bx = sx + stationWidth / 2 - 1;
        const by = sy - stationHeight / 2 + 1;

        ctx.beginPath();
        ctx.arc(bx, by, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = colorMeta.hex;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(8.5 * scale)}px var(--font-mono, monospace)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(station.deliveredCount), bx, by);
      }

      // Success / Fail arrival shockwave ring
      if (station.lastArrivalTimestamp && now - station.lastArrivalTimestamp < 600) {
        const elapsed = (now - station.lastArrivalTimestamp) / 600;
        const radius = stationWidth * 0.5 + elapsed * (22 * scale);
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = station.lastArrivalStatus === 'success' ? colorMeta.hex : '#EF4444';
        ctx.lineWidth = 2.5 * (1 - elapsed);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw Trains sized proportionally for mobile viewports
   */
  private drawTrains(
    trains: Train[],
    edges: Map<string, TrackEdge>,
    nodes: Map<string, TrackNode>,
    scale: number
  ) {
    for (const train of trains) {
      if (train.state !== 'active') continue;

      const edge = edges.get(train.currentEdgeId);
      if (!edge) continue;

      const fromNode = nodes.get(edge.fromNodeId);
      const toNode = nodes.get(edge.toNodeId);
      if (!fromNode || !toNode) continue;

      const p0 = { x: this.toScreenX(fromNode.x), y: this.toScreenY(fromNode.y) };
      const p3 = { x: this.toScreenX(toNode.x), y: this.toScreenY(toNode.y) };
      const p1 = edge.cp1 ? { x: this.toScreenX(edge.cp1.x), y: this.toScreenY(edge.cp1.y) } : p0;
      const p2 = edge.cp2 ? { x: this.toScreenX(edge.cp2.x), y: this.toScreenY(edge.cp2.y) } : p3;

      const enginePos = getBezierPoint(p0, p1, p2, p3, train.progress);
      const { angle: engineAngle } = getBezierTangent(p0, p1, p2, p3, train.progress);

      const colorMeta = TRAIN_COLORS[train.color];

      // Trailing Carriage
      const carriageProgress = Math.max(0, train.progress - 0.055);
      const carriagePos = getBezierPoint(p0, p1, p2, p3, carriageProgress);
      const { angle: carriageAngle } = getBezierTangent(p0, p1, p2, p3, carriageProgress);

      this.drawCarriage(carriagePos.x, carriagePos.y, carriageAngle, colorMeta, scale);

      // Locomotive Engine
      this.drawLocomotive(enginePos.x, enginePos.y, engineAngle, colorMeta, scale);
    }
  }

  /**
   * Draw individual locomotive engine (Compact & Crisp for Android)
   */
  private drawLocomotive(
    x: number,
    y: number,
    angle: number,
    colorMeta: typeof TRAIN_COLORS[keyof typeof TRAIN_COLORS],
    scale: number
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const length = 21 * scale;
    const halfLen = length / 2;
    const halfWidth = 6.2 * scale;

    // Headlight Beam
    const beamGrad = ctx.createRadialGradient(halfLen + 6, 0, 2, halfLen + 18, 0, 16);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.beginPath();
    ctx.moveTo(halfLen, -2 * scale);
    ctx.lineTo(halfLen + 22 * scale, -9 * scale);
    ctx.lineTo(halfLen + 22 * scale, 9 * scale);
    ctx.lineTo(halfLen, 2 * scale);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();

    // Train Chassis Shadow
    ctx.beginPath();
    ctx.roundRect(-halfLen, -halfWidth + 1.5, length, halfWidth * 2, 4 * scale);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fill();

    // Train Main Body
    ctx.beginPath();
    ctx.roundRect(-halfLen, -halfWidth, length, halfWidth * 2, 4 * scale);
    ctx.fillStyle = colorMeta.hex;
    ctx.fill();

    // Chassis Stroke
    ctx.strokeStyle = colorMeta.darkHex;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cab Roof (Rear section)
    const cabLen = length * 0.44;
    ctx.beginPath();
    ctx.roundRect(-halfLen + 0.5, -halfWidth + 0.5, cabLen, halfWidth * 2 - 1, [3.5 * scale, 0, 0, 3.5 * scale]);
    ctx.fillStyle = colorMeta.darkHex;
    ctx.fill();

    // Cab Windows
    const winW = 5 * scale;
    const winH = 2.5 * scale;
    ctx.beginPath();
    ctx.roundRect(-halfLen + 2 * scale, -halfWidth + 1.2 * scale, winW, winH, 0.8);
    ctx.roundRect(-halfLen + 2 * scale, halfWidth - winH - 1.2 * scale, winW, winH, 0.8);
    ctx.fillStyle = '#E0F2FE';
    ctx.fill();

    // Boiler & Smokestack (Front cylinder)
    ctx.beginPath();
    ctx.arc(halfLen - 5 * scale, 0, 3.2 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Front wedge
    ctx.beginPath();
    ctx.moveTo(halfLen, -3.5 * scale);
    ctx.lineTo(halfLen + 2.5 * scale, 0);
    ctx.lineTo(halfLen, 3.5 * scale);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw trailing train carriage (Compact for Android)
   */
  private drawCarriage(
    x: number,
    y: number,
    angle: number,
    colorMeta: typeof TRAIN_COLORS[keyof typeof TRAIN_COLORS],
    scale: number
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const length = 15 * scale;
    const halfLen = length / 2;
    const halfWidth = 5.2 * scale;

    // Shadow
    ctx.beginPath();
    ctx.roundRect(-halfLen, -halfWidth + 1.5, length, halfWidth * 2, 3 * scale);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.roundRect(-halfLen, -halfWidth, length, halfWidth * 2, 3 * scale);
    ctx.fillStyle = colorMeta.hex;
    ctx.fill();

    // Border
    ctx.strokeStyle = colorMeta.darkHex;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Roof stripe
    ctx.beginPath();
    ctx.roundRect(-halfLen + 2 * scale, -2 * scale, length - 4 * scale, 4 * scale, 1.5 * scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // Coupler joint
    ctx.beginPath();
    ctx.moveTo(halfLen, 0);
    ctx.lineTo(halfLen + 2.5 * scale, 0);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw dynamic particles
   */
  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      } else if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size * 0.8, p.size * 1.1);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Hit test helper: Generous touch hit box for mobile thumbs (32px radius)
   */
  public hitTestSwitch(
    screenX: number,
    screenY: number,
    switches: Map<string, TrackSwitch>,
    nodes: Map<string, TrackNode>
  ): TrackSwitch | null {
    const touchThreshold = 30; // 60px diameter touch hit target for mobile ergonomics

    for (const sw of switches.values()) {
      const node = nodes.get(sw.nodeId);
      if (!node) continue;

      const sx = this.toScreenX(node.x);
      const sy = this.toScreenY(node.y);
      const dx = screenX - sx;
      const dy = screenY - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= touchThreshold) {
        return sw;
      }
    }
    return null;
  }
}
