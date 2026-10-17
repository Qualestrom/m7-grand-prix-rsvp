import React, { useEffect, useRef } from 'react';

/**
 * RaceTrackPOV: Authentic Formula 1 Broadcast Onboard Engine
 * Built strictly according to @f1-cinematic-visuals directives:
 *
 * 1. PERSPECTIVE & ATMOSPHERE:
 *    - Ultra-low tarmac camera perspective (horizon ~0.23 screen height)
 *    - High-speed asphalt texture with rubbered racing lines and multi-tiered kerbs
 *    - Overhead floodlights, sponsor walls, and camera flashes
 *
 * 2. AUTHENTIC 2024/2026 FORMULA 1 CAR ARCHITECTURE:
 *    - Swept dual-tier carbon rear wing with functional animated DRS flap & beam wing
 *    - Curved aerodynamic wing endplates with carbon louvres
 *    - Apex T-Cam broadcast pod & triangular roll-hoop airbox intake
 *    - Dual aerodynamic wing mirrors on delicate carbon stalks
 *    - Titanium Halo safety arch & driver helmet with iridescent iridium visor
 *    - Athletic Coke-bottle sculpted sidepods with deep undercuts & cooling gill louvres
 *    - 18-inch 405mm Pirelli P-Zero rear slick tires with 3.5° negative camber tilt
 *    - Over-wheel aerodynamic deflector vanes & BBS centerlock wheel covers
 *    - Multi-element double-wishbone carbon suspension rods & pushrods
 *    - Venturi undertray diffuser with 4 vertical strakes
 *    - Central titanium exhaust with ceramic glow & supersonic downshift flames
 *    - 15-LED FIA flashing red rain safety beacon
 *    - Wingtip helical condensation vortex trails & undertray skid block sparks
 *
 * 3. RIGOROUS PHYSICAL HITBOX & OVERTAKING ENGINE (ZERO PHASING / NO GHOSTING):
 *    - Real-time 2D Screen-Space AABB & 3D Track-Space Hitbox calculations
 *    - Hard Longitudinal Collision Block: pursuer CANNOT drive through the leader's rear
 *    - Pursuer MUST diverge into the open lane before advancing forward
 *    - Strict Wheel-to-Wheel Lateral Repulsion Barrier: minimum clearance enforced
 *    - Cutback restriction: passing car only moves into racing line when completely clear
 */

export const RaceTrackPOV: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Racing speed & physics
    let speed = 318;
    const maxSpeed = 354;
    let trackOffset = 0;
    let curve = 0;
    let targetCurve = 0.15;
    let curveTimer = 0;
    let cameraShake = 0;

    // Sparks particle physics
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }
    const sparks: Spark[] = [];

    // Grand Prix Trackside LED Sponsor Signage
    const sponsors = [
      { text: 'M7 GRAND PRIX', color: '#E10600', border: '#FF3333' },
      { text: 'AMARI 7', color: '#FFB800', border: '#FFD700' },
      { text: 'PIRELLI P-ZERO', color: '#FFD700', border: '#E10600' },
      { text: 'ROLEX', color: '#00D2BE', border: '#00FFCC' },
      { text: 'WORLD CHAMPION', color: '#FFFFFF', border: '#8E8E98' },
    ];

    // F1 Racing Cars State
    interface F1Car {
      id: string;
      name: string;
      x: number; // Lateral track position (-0.38 to +0.38)
      targetX: number;
      z: number; // Longitudinal distance: smaller = further ahead down track, larger = closer to camera
      speed: number;
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      tCamColor: string;
      tireCompoundColor: string;
      centerlockColor: string;
      wingSponsor: string;
      driverNumber: string;
      drsActive: boolean;
      rollAngle: number;
      sparkCooldown: number;
      flameTimer: number;
      // Screen space hitbox bounds computed every frame
      hitbox: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        cx: number;
        cy: number;
        carW: number;
        carH: number;
      };
    }

    // Car #7: Mattheu Amari (Ferrari Scarlet Red & Gold)
    const carAmari: F1Car = {
      id: 'car-amari',
      name: 'Mattheu Amari (M7)',
      x: -0.22, // Left lane
      targetX: -0.22,
      z: 0.69, // Initially leading ahead down track
      speed: 345,
      primaryColor: '#D40000', // Scarlet Red
      secondaryColor: '#120202', // Carbon dark
      accentColor: '#FFB800', // Gold Championship
      tCamColor: '#FFE600', // Fluoro yellow camera pod
      tireCompoundColor: '#E10600', // Red Softs
      centerlockColor: '#FFB800', // Gold centerlock
      wingSponsor: 'M7 GP',
      driverNumber: '7',
      drsActive: false,
      rollAngle: 0,
      sparkCooldown: 0,
      flameTimer: 0,
      hitbox: { minX: 0, maxX: 0, minY: 0, maxY: 0, cx: 0, cy: 0, carW: 0, carH: 0 },
    };

    // Car #63: Rival (Mercedes/Petronas Emerald Teal & Obsidian)
    const carRival: F1Car = {
      id: 'car-rival',
      name: 'Petronas Rival',
      x: -0.22, // Drafting directly behind Car 7 in Left lane
      targetX: -0.22,
      z: 0.83, // Initially chasing from behind (closer to camera)
      speed: 352,
      primaryColor: '#00B8A9', // Petronas Emerald Teal
      secondaryColor: '#061412', // Obsidian carbon
      accentColor: '#FFFFFF', // Silver / White
      tCamColor: '#1A1A1A', // Matte black camera pod
      tireCompoundColor: '#FFD700', // Yellow Mediums
      centerlockColor: '#00D2BE', // Teal anodized centerlock
      wingSponsor: 'PETRONAS',
      driverNumber: '63',
      drsActive: true,
      rollAngle: 0,
      sparkCooldown: 0,
      flameTimer: 0,
      hitbox: { minX: 0, maxX: 0, minY: 0, maxY: 0, cx: 0, cy: 0, carW: 0, carH: 0 },
    };

    // State machine for realistic overtaking cycles
    type BattlePhase = 'slipstreaming' | 'diverging-to-free-space' | 'wheel-to-wheel' | 'clearing-and-cutback';
    let battlePhase: BattlePhase = 'slipstreaming';
    let battleTimer = 0;
    let leaderId: 'car-amari' | 'car-rival' = 'car-amari';

    let lastTime = performance.now();

    const render = (now: number) => {
      try {
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;

        // Speed progression
        if (speed < maxSpeed) {
          speed = Math.min(speed + dt * 42, maxSpeed);
        }
        trackOffset += (speed * 0.94) * dt;

        // Gentle sweeping circuit curvature
        curveTimer += dt;
        if (curveTimer > 3.6) {
          curveTimer = 0;
          targetCurve = (Math.random() - 0.5) * 0.70;
        }
        curve += (targetCurve - curve) * dt * 1.35;

        // High-speed visceral camera shudder
        cameraShake = (Math.sin(now * 0.085) * 0.85 + Math.cos(now * 0.145) * 0.5) * (speed / 300);

        // Perspective Horizon & Depth
        const horizonY = height * 0.23 + cameraShake * 0.45;
        const centerX = width * 0.5 + curve * width * 0.12;
        const trackDepth = height - horizonY;
        const roadWidthBottom = width * (width < 600 ? 1.95 : 1.78);

        // Clear Canvas
        ctx.fillStyle = '#040407';
        ctx.fillRect(0, 0, width, height);

        // ==========================================
        // 1. NIGHT SKY, HORIZON & GRANDSTANDS
        // ==========================================
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#020204');
        skyGrad.addColorStop(0.55, '#06060F');
        skyGrad.addColorStop(1, '#0D0D1D');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Grandstand silhouettes
        const grandstandY = horizonY - 24;
        ctx.fillStyle = '#090914';
        ctx.fillRect(0, grandstandY, width, 24);

        // Spectator camera flashes
        for (let f = 0; f < 3; f++) {
          if (Math.random() < 0.2) {
            const fx = Math.random() * width;
            const fy = grandstandY + Math.random() * 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(fx, fy, Math.max(0.1, 1.5 + Math.random() * 2), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Overhead Stadium Floodlights & Volumetric Beams
        const floodlights = [0.1, 0.26, 0.46, 0.66, 0.86];
        floodlights.forEach((fPos, idx) => {
          const lx = width * fPos + curve * 30;
          const ly = horizonY - 45 - (idx % 2) * 8;

          // Volumetric light cone
          const beamGrad = ctx.createLinearGradient(lx, ly, lx + curve * 70, horizonY + trackDepth * 0.45);
          beamGrad.addColorStop(0, 'rgba(180, 225, 255, 0.32)');
          beamGrad.addColorStop(0.35, 'rgba(120, 185, 255, 0.08)');
          beamGrad.addColorStop(1, 'rgba(4, 8, 20, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lx - 14, ly);
          ctx.lineTo(lx + 14, ly);
          ctx.lineTo(lx + 110 + curve * 50, horizonY + trackDepth * 0.45);
          ctx.lineTo(lx - 60 + curve * 50, horizonY + trackDepth * 0.45);
          ctx.closePath();
          ctx.fill();

          // Flare Core
          const flare = ctx.createRadialGradient(lx, ly, 1, lx, ly, 65);
          flare.addColorStop(0, 'rgba(255, 255, 255, 1)');
          flare.addColorStop(0.2, 'rgba(205, 235, 255, 0.6)');
          flare.addColorStop(0.55, 'rgba(80, 140, 255, 0.16)');
          flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = flare;
          ctx.beginPath();
          ctx.arc(lx, ly, 65, 0, Math.PI * 2);
          ctx.fill();

          // Gantry Mast
          ctx.strokeStyle = '#161624';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, horizonY);
          ctx.stroke();
        });

        // ==========================================
        // 2. 2.5D ASPHALT TRACK, RUN-OFF & KERBS
        // ==========================================
        const slices = 85;
        for (let i = slices - 1; i >= 0; i--) {
          const p1 = i / slices;
          const p2 = (i + 1) / slices;

          const y1 = horizonY + Math.pow(p1, 2.35) * trackDepth;
          const y2 = horizonY + Math.pow(p2, 2.35) * trackDepth;

          const scale1 = (y1 - horizonY) / trackDepth;
          const scale2 = (y2 - horizonY) / trackDepth;

          const w1 = roadWidthBottom * Math.pow(scale1, 1.02) * 0.5;
          const w2 = roadWidthBottom * Math.pow(scale2, 1.02) * 0.5;

          const curveOffset1 = Math.pow(1 - scale1, 2.2) * curve * width * 0.46;
          const curveOffset2 = Math.pow(1 - scale2, 2.2) * curve * width * 0.46;

          const x1 = centerX - curveOffset1;
          const x2 = centerX - curveOffset2;

          const segmentIdx = Math.floor(trackOffset + i);
          const isAlternate = segmentIdx % 2 === 0;

          // Run-Off Barriers
          const barrierW1 = w1 * 0.38;
          const barrierW2 = w2 * 0.38;
          const barrierH1 = Math.max(3, 40 * scale1);
          const barrierH2 = Math.max(3, 40 * scale2);

          ctx.fillStyle = '#06060A';
          ctx.fillRect(0, y1, width, y2 - y1 + 1);

          const rawSponsorIdx = Math.floor((trackOffset + i) / 5) % sponsors.length;
          const sponsorIdx = (rawSponsorIdx + sponsors.length) % sponsors.length;
          const sponsor = sponsors[sponsorIdx] || sponsors[0];
          const sponsorBorder = sponsor ? sponsor.border : '#FF3333';

          // Left Barrier Wall
          ctx.fillStyle = '#0A0A14';
          ctx.beginPath();
          ctx.moveTo(x1 - w1 - barrierW1, y1 - barrierH1);
          ctx.lineTo(x1 - w1, y1);
          ctx.lineTo(x2 - w2, y2);
          ctx.lineTo(x2 - w2 - barrierW2, y2 - barrierH2);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = sponsorBorder;
          ctx.lineWidth = Math.max(1.2, 3 * scale1);
          ctx.beginPath();
          ctx.moveTo(x1 - w1 - barrierW1, y1 - barrierH1);
          ctx.lineTo(x2 - w2 - barrierW2, y2 - barrierH2);
          ctx.stroke();

          // Right Barrier Wall
          ctx.fillStyle = '#0A0A14';
          ctx.beginPath();
          ctx.moveTo(x1 + w1, y1);
          ctx.lineTo(x1 + w1 + barrierW1, y1 - barrierH1);
          ctx.lineTo(x2 + w2 + barrierW2, y2 - barrierH2);
          ctx.lineTo(x2 + w2, y2);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = sponsorBorder;
          ctx.beginPath();
          ctx.moveTo(x1 + w1 + barrierW1, y1 - barrierH1);
          ctx.lineTo(x2 + w2 + barrierW2, y2 - barrierH2);
          ctx.stroke();

          // Dark Asphalt Surface
          const asphaltGrad = ctx.createLinearGradient(x1 - w1, y1, x1 + w1, y1);
          asphaltGrad.addColorStop(0, '#101018');
          asphaltGrad.addColorStop(0.5, isAlternate ? '#161622' : '#12121B');
          asphaltGrad.addColorStop(1, '#101018');
          ctx.fillStyle = asphaltGrad;
          ctx.beginPath();
          ctx.moveTo(x1 - w1, y1);
          ctx.lineTo(x1 + w1, y1);
          ctx.lineTo(x2 + w2, y2);
          ctx.lineTo(x2 - w2, y2);
          ctx.closePath();
          ctx.fill();

          // Heavy Rubbered-in Racing Lines
          if (scale1 > 0.08) {
            const rubberAlpha = Math.min(0.5, scale1 * 0.58);
            ctx.fillStyle = `rgba(2, 2, 4, ${rubberAlpha})`;

            const rL1 = x1 - w1 * 0.38;
            const rL2 = x2 - w2 * 0.38;
            const rw1 = w1 * 0.25;
            const rw2 = w2 * 0.25;
            ctx.beginPath();
            ctx.moveTo(rL1 - rw1, y1);
            ctx.lineTo(rL1 + rw1, y1);
            ctx.lineTo(rL2 + rw2, y2);
            ctx.lineTo(rL2 - rw2, y2);
            ctx.closePath();
            ctx.fill();

            const rR1 = x1 + w1 * 0.38;
            const rR2 = x2 + w2 * 0.38;
            ctx.beginPath();
            ctx.moveTo(rR1 - rw1, y1);
            ctx.lineTo(rR1 + rw1, y1);
            ctx.lineTo(rR2 + rw2, y2);
            ctx.lineTo(rR2 - rw2, y2);
            ctx.closePath();
            ctx.fill();
          }

          // 3D Elevated Championship Kerbs
          const kerbW1 = w1 * 0.16;
          const kerbW2 = w2 * 0.16;
          const kerbColor = isAlternate ? '#E10600' : '#FFFFFF';
          const kerbShadow = isAlternate ? '#800200' : '#9999AA';

          // Left Kerb
          ctx.fillStyle = kerbColor;
          ctx.beginPath();
          ctx.moveTo(x1 - w1 - kerbW1, y1);
          ctx.lineTo(x1 - w1, y1);
          ctx.lineTo(x2 - w2, y2);
          ctx.lineTo(x2 - w2 - kerbW2, y2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = kerbShadow;
          ctx.fillRect(x2 - w2 - kerbW2, y2 - 1, kerbW2 * 0.3, 2);

          // Right Kerb
          ctx.fillStyle = kerbColor;
          ctx.beginPath();
          ctx.moveTo(x1 + w1, y1);
          ctx.lineTo(x1 + w1 + kerbW1, y1);
          ctx.lineTo(x2 + w2 + kerbW2, y2);
          ctx.lineTo(x2 + w2, y2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = kerbShadow;
          ctx.fillRect(x2 + w2, y2 - 1, kerbW2 * 0.3, 2);

          // White Center Dashed Line
          if (Math.floor((trackOffset + i) / 2.5) % 2 === 0 && scale1 > 0.1) {
            const dashW1 = Math.max(1.8, w1 * 0.024);
            const dashW2 = Math.max(1.8, w2 * 0.024);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.85, scale1 * 1.2)})`;
            ctx.beginPath();
            ctx.moveTo(x1 - dashW1, y1);
            ctx.lineTo(x1 + dashW1, y1);
            ctx.lineTo(x2 + dashW2, y2);
            ctx.lineTo(x2 - dashW2, y2);
            ctx.closePath();
            ctx.fill();
          }
        }

        // ==========================================
        // 3. PHYSICAL HITBOX & OVERTAKING ENGINE
        // ==========================================
        const lead = leaderId === 'car-amari' ? carAmari : carRival;
        const pursuer = leaderId === 'car-amari' ? carRival : carAmari;

        battleTimer += dt;

        // Lane definitions: Left = -0.22, Right = +0.22
        // Reminder: smaller Z = further ahead on track, larger Z = closer to camera
        const TARGET_LEAD_Z = 0.69;
        const TARGET_PURSUER_DRAFT_Z = 0.83;

        if (battlePhase === 'slipstreaming') {
          // Pursuer is drafting directly in the leader's wake
          pursuer.drsActive = true;
          lead.drsActive = false;

          // Follow directly behind leader in same lane
          pursuer.targetX = lead.targetX;

          // Surge forward in slipstream towards leader
          pursuer.z = Math.max(lead.z + 0.12, pursuer.z - dt * 0.07);
          lead.z = TARGET_LEAD_Z;

          // HARD LONGITUDINAL HITBOX COLLISION BLOCK:
          // If the lateral separation is small (< 0.28), the pursuer CANNOT penetrate the leader's rear!
          if (Math.abs(pursuer.x - lead.x) < 0.28) {
            pursuer.z = Math.max(pursuer.z, lead.z + 0.12);
          }

          // Once tucked right up in the slipstream, pursuer MUST DIVERGE INTO FREE SPACE to attempt the pass!
          if (pursuer.z <= lead.z + 0.14 || battleTimer > 3.2) {
            battlePhase = 'diverging-to-free-space';
            battleTimer = 0;
            // Target the open lane! (If leader is Left, attack Right; if Right, attack Left)
            const openLane = lead.x < 0 ? 0.22 : -0.22;
            pursuer.targetX = openLane;
            pursuer.flameTimer = 0.45; // Downshift backfire flame!
          }
        } else if (battlePhase === 'diverging-to-free-space') {
          // Pursuer is steering laterally into the free open lane
          const lateralClearance = Math.abs(pursuer.x - lead.x);

          // HITBOX RULE: As long as lateral clearance is NOT yet achieved (< 0.38),
          // the pursuer is STRICTLY FORBIDDEN from advancing forward!
          if (lateralClearance < 0.38) {
            pursuer.z = Math.max(pursuer.z, lead.z + 0.11);
          } else {
            // Free lane achieved! Pursuer drops the hammer with DRS and surges forward!
            pursuer.z = Math.max(lead.z - 0.02, pursuer.z - dt * 0.095);
          }

          // Once completely in the clear lane and drawing level
          if (lateralClearance >= 0.38 && pursuer.z <= lead.z + 0.04) {
            battlePhase = 'wheel-to-wheel';
            battleTimer = 0;
          }
        } else if (battlePhase === 'wheel-to-wheel') {
          // Alongside battle in two distinct lanes!
          pursuer.drsActive = true;
          lead.drsActive = false;

          // Pursuer powers ahead past the leader
          pursuer.z = Math.max(TARGET_LEAD_Z - 0.02, pursuer.z - dt * 0.075);
          // Overtaken leader drops back
          lead.z = Math.min(TARGET_PURSUER_DRAFT_Z, lead.z + dt * 0.065);

          // Both undertrays shower sparks under maximum lateral G-forces
          pursuer.sparkCooldown += dt * 2.2;
          lead.sparkCooldown += dt * 2.2;

          // When pursuer's rear is completely ahead of rival's nose
          if (pursuer.z <= lead.z - 0.13 || battleTimer > 3.2) {
            battlePhase = 'clearing-and-cutback';
            battleTimer = 0;
          }
        } else if (battlePhase === 'clearing-and-cutback') {
          // Overtake complete! New leader is well ahead down the track
          pursuer.drsActive = false;
          lead.drsActive = true; // Overtaken car now gets DRS

          // Only after completely clearing is the new leader allowed to drift to racing line
          pursuer.targetX = pursuer.id === 'car-amari' ? -0.22 : 0.22;
          lead.targetX = pursuer.targetX; // Old leader tucks in behind to draft!

          pursuer.z = Math.max(TARGET_LEAD_Z, pursuer.z - dt * 0.015);
          lead.z = Math.min(TARGET_PURSUER_DRAFT_Z, lead.z + dt * 0.035);

          if (battleTimer > 2.8) {
            // Swap roles! The passed car now becomes the hunter!
            leaderId = pursuer.id as 'car-amari' | 'car-rival';
            battlePhase = 'slipstreaming';
            battleTimer = 0;
          }
        }

        // Steer cars smoothly and calculate chassis roll angle
        [carAmari, carRival].forEach((car) => {
          const prevX = car.x;
          car.x += (car.targetX - car.x) * dt * 3.2;
          car.rollAngle = (car.x - prevX) * 28;
        });

        // Compute screen coordinates and hitboxes for both cars
        [carAmari, carRival].forEach((car) => {
          const cScale = Math.pow(car.z, 2.35);
          const cy = horizonY + cScale * trackDepth;
          const curScale = (cy - horizonY) / trackDepth;
          const cCurve = Math.pow(1 - curScale, 2.2) * curve * width * 0.46;
          const cx = centerX - cCurve + car.x * roadWidthBottom * curScale * 0.46;

          const maxResponsiveWidth = Math.min(width * 0.62, 395);
          const carW = Math.max(105, maxResponsiveWidth * curScale);
          const carH = carW * 0.38;

          car.hitbox = {
            minX: cx - carW * 0.48,
            maxX: cx + carW * 0.48,
            minY: cy - carH * 1.35,
            maxY: cy + carH * 0.08,
            cx,
            cy,
            carW,
            carH,
          };
        });

        // ==========================================
        // 4. ABSOLUTE PHYSICAL HITBOX ENFORCEMENT
        // ==========================================
        // Screen-space AABB collision test:
        const bA = carAmari.hitbox;
        const bR = carRival.hitbox;

        const lateralOverlap = bA.minX < bR.maxX && bA.maxX > bR.minX;
        const verticalOverlap = bA.minY < bR.maxY && bA.maxY > bR.minY;

        // If both lateral and vertical overlap occur, or if they are alongside:
        // Enforce hard physical lateral repulsion so wings/tires NEVER intersect!
        if (verticalOverlap) {
          const requiredDist = (bA.carW + bR.carW) * 0.52;
          const currentDist = bR.cx - bA.cx;
          if (Math.abs(currentDist) < requiredDist) {
            const push = (requiredDist - Math.abs(currentDist)) * 0.5;
            if (currentDist >= 0) {
              carRival.x += push / (roadWidthBottom * 0.35);
              carAmari.x -= push / (roadWidthBottom * 0.35);
            } else {
              carRival.x -= push / (roadWidthBottom * 0.35);
              carAmari.x += push / (roadWidthBottom * 0.35);
            }
          }
        }

        // Also if they are in the same lane (lateral overlap), prevent rear car from phasing into front car:
        if (lateralOverlap && Math.abs(carAmari.x - carRival.x) < 0.32) {
          if (carAmari.z < carRival.z) {
            // Amari is in front, Rival is behind: Rival CANNOT enter Amari's rear
            carRival.z = Math.max(carRival.z, carAmari.z + 0.12);
          } else {
            // Rival is in front, Amari is behind: Amari CANNOT enter Rival's rear
            carAmari.z = Math.max(carAmari.z, carRival.z + 0.12);
          }
        }

        // ==========================================
        // 5. RENDER AUTHENTIC 2024/2026 FORMULA 1 MACHINES
        // ==========================================
        // Painter's algorithm: draw car furthest away (smaller z) first, closer car (larger z) second!
        const sortedCars = [carAmari, carRival].sort((a, b) => a.z - b.z);

        sortedCars.forEach((car) => {
          const cScale = Math.pow(car.z, 2.35);
          const cy = horizonY + cScale * trackDepth;
          const curScale = (cy - horizonY) / trackDepth;
          const cCurve = Math.pow(1 - curScale, 2.2) * curve * width * 0.46;
          const cx = centerX - cCurve + car.x * roadWidthBottom * curScale * 0.46;

          const maxResponsiveWidth = Math.min(width * 0.62, 395);
          const carW = Math.max(105, maxResponsiveWidth * curScale);
          const carH = carW * 0.38;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(car.rollAngle * (Math.PI / 180));

          // ----------------------------------------
          // A. Underfloor Ground Occlusion Shadow
          // ----------------------------------------
          const groundShadow = ctx.createRadialGradient(
            0, carH * 0.32, Math.max(0.1, carW * 0.12),
            0, carH * 0.32, Math.max(0.1, carW * 0.60)
          );
          groundShadow.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
          groundShadow.addColorStop(0.55, 'rgba(0, 0, 0, 0.72)');
          groundShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = groundShadow;
          ctx.beginPath();
          ctx.ellipse(0, carH * 0.32, Math.max(0.1, carW * 0.58), Math.max(0.1, carH * 0.36), 0, 0, Math.PI * 2);
          ctx.fill();

          // ----------------------------------------
          // B. Carbon Floor Undertray & Vertical Edge Fences
          // ----------------------------------------
          const floorW = carW * 0.82;
          ctx.fillStyle = '#090910';
          ctx.fillRect(-floorW * 0.5, carH * 0.04, floorW, Math.max(1.5, 3.5 * curScale));

          // Aerodynamic vertical floor edge fences
          ctx.fillStyle = '#161624';
          ctx.fillRect(-floorW * 0.5, -carH * 0.08, Math.max(1.5, 3 * curScale), carH * 0.18);
          ctx.fillRect(floorW * 0.5 - Math.max(1.5, 3 * curScale), -carH * 0.08, Math.max(1.5, 3 * curScale), carH * 0.18);

          // ----------------------------------------
          // C. Massive 405mm Pirelli P-Zero Rear Slick Tires
          // ----------------------------------------
          const tireW = carW * 0.225;
          const tireH = carH * 0.88;
          const tireY = -tireH * 0.62;

          const renderTire = (isLeft: boolean) => {
            const tx = isLeft ? -carW * 0.515 : carW * 0.29;
            ctx.save();
            ctx.translate(tx + tireW * 0.5, tireY + tireH * 0.5);
            // 3.5° negative camber tilt
            ctx.rotate((isLeft ? 3.5 : -3.5) * (Math.PI / 180));

            // Cylindrical tire rubber with realistic dark sheen
            const tireGrad = ctx.createLinearGradient(-tireW * 0.5, 0, tireW * 0.5, 0);
            tireGrad.addColorStop(0, '#050508');
            tireGrad.addColorStop(0.35, '#222230');
            tireGrad.addColorStop(0.7, '#12121A');
            tireGrad.addColorStop(1, '#040406');
            ctx.fillStyle = tireGrad;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-tireW * 0.5, -tireH * 0.5, tireW, tireH, Math.max(0, 5 * curScale));
            } else {
              ctx.rect(-tireW * 0.5, -tireH * 0.5, tireW, tireH);
            }
            ctx.fill();

            // Official Pirelli P-Zero compound sidewall ring
            ctx.strokeStyle = car.tireCompoundColor;
            ctx.lineWidth = Math.max(2, 3.8 * curScale);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(0.1, tireW * 0.38), Math.max(0.1, tireH * 0.40), 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner wheel rim ring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = Math.max(1, 1.5 * curScale);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(0.1, tireW * 0.26), Math.max(0.1, tireH * 0.28), 0, 0, Math.PI * 2);
            ctx.stroke();

            // Carbon Aero Wheel Cover & Anodized Centerlock Nut
            ctx.fillStyle = '#0B0B14';
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0.1, tireW * 0.22), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = car.centerlockColor;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1.5, 3.5 * curScale), 0, Math.PI * 2);
            ctx.fill();

            // Over-wheel aerodynamic deflector vane (2024/2026 Regulation requirement)
            ctx.strokeStyle = '#181826';
            ctx.lineWidth = Math.max(1.8, 3.5 * curScale);
            ctx.beginPath();
            ctx.arc(0, -tireH * 0.52, Math.max(0.1, tireW * 0.48), Math.PI * 0.85, Math.PI * 0.15, true);
            ctx.stroke();

            ctx.restore();
          };

          renderTire(true);
          renderTire(false);

          // ----------------------------------------
          // D. Carbon Double-Wishbone Suspension Arms & Pushrods
          // ----------------------------------------
          ctx.strokeStyle = '#181824';
          ctx.lineWidth = Math.max(1.5, 3 * curScale);
          ctx.beginPath();
          // Left wishbones & pushrod
          ctx.moveTo(-carW * 0.18, -carH * 0.54);
          ctx.lineTo(-carW * 0.40, -carH * 0.50);
          ctx.moveTo(-carW * 0.18, -carH * 0.22);
          ctx.lineTo(-carW * 0.40, -carH * 0.18);
          ctx.moveTo(-carW * 0.18, -carH * 0.22);
          ctx.lineTo(-carW * 0.38, -carH * 0.52);
          // Right wishbones & pushrod
          ctx.moveTo(carW * 0.18, -carH * 0.54);
          ctx.lineTo(carW * 0.40, -carH * 0.50);
          ctx.moveTo(carW * 0.18, -carH * 0.22);
          ctx.lineTo(carW * 0.40, -carH * 0.18);
          ctx.moveTo(carW * 0.18, -carH * 0.22);
          ctx.lineTo(carW * 0.38, -carH * 0.52);
          ctx.stroke();

          // ----------------------------------------
          // E. Venturi Diffuser & Titanium Exhaust Structure
          // ----------------------------------------
          const diffW = carW * 0.54;
          const diffH = carH * 0.35;
          ctx.fillStyle = '#08080E';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-diffW * 0.5, -diffH * 0.4, diffW, diffH, Math.max(0, 4 * curScale));
          } else {
            ctx.rect(-diffW * 0.5, -diffH * 0.4, diffW, diffH);
          }
          ctx.fill();

          // 4 Vertical Aerodynamic Diffuser Strakes
          ctx.strokeStyle = '#1E1E2C';
          ctx.lineWidth = Math.max(1.2, 2.5 * curScale);
          for (let s = -3; s <= 3; s++) {
            if (s === 0) continue;
            const fx = (diffW * 0.44 / 3) * s;
            ctx.beginPath();
            ctx.moveTo(fx, -diffH * 0.35);
            ctx.lineTo(fx, diffH * 0.55);
            ctx.stroke();
          }

          // Single Central Titanium Exhaust with Turbo Downshift Flames
          car.flameTimer = Math.max(0, car.flameTimer - dt);
          if (car.flameTimer > 0) {
            const flameGrad = ctx.createRadialGradient(0, -diffH * 0.12, 2, 0, -diffH * 0.12, Math.max(5, 26 * curScale));
            flameGrad.addColorStop(0, '#FFFFFF');
            flameGrad.addColorStop(0.25, '#FFB800');
            flameGrad.addColorStop(0.65, '#FF3300');
            flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.arc(0, -diffH * 0.12, Math.max(5, 26 * curScale), 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#FF5500';
            ctx.shadowColor = '#FF3300';
            ctx.shadowBlur = 12 * curScale;
            ctx.beginPath();
            ctx.arc(0, -diffH * 0.15, Math.max(3, 6.5 * curScale), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // ----------------------------------------
          // F. Lower Beam Wing (Mounted low above diffuser)
          // ----------------------------------------
          const beamW = carW * 0.54;
          const beamH = carH * 0.11;
          ctx.fillStyle = '#14141E';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-beamW * 0.5, -diffH * 0.85, beamW, beamH, Math.max(0, 2 * curScale));
          } else {
            ctx.rect(-beamW * 0.5, -diffH * 0.85, beamW, beamH);
          }
          ctx.fill();

          // ----------------------------------------
          // G. Authentic Sculpted Coke-Bottle Sidepods & Engine Cowl
          // ----------------------------------------
          const sidepodY = -carH * 0.72;

          // Left Sidepod (Sculpted shoulder + deep undercut)
          const leftPodGrad = ctx.createLinearGradient(-carW * 0.32, sidepodY, -carW * 0.14, 0);
          leftPodGrad.addColorStop(0, car.primaryColor);
          leftPodGrad.addColorStop(0.65, car.secondaryColor);
          leftPodGrad.addColorStop(1, '#06060A');
          ctx.fillStyle = leftPodGrad;

          ctx.beginPath();
          ctx.moveTo(-carW * 0.32, sidepodY + carH * 0.15); // Outer shoulder
          ctx.lineTo(-carW * 0.14, sidepodY);              // Inner shoulder
          ctx.lineTo(-carW * 0.12, 0);                     // Gearbox waist
          ctx.lineTo(-carW * 0.28, 0);                     // Outer floor undercut
          ctx.closePath();
          ctx.fill();

          // Right Sidepod (Sculpted shoulder + deep undercut)
          const rightPodGrad = ctx.createLinearGradient(carW * 0.14, sidepodY, carW * 0.32, 0);
          rightPodGrad.addColorStop(0, car.secondaryColor);
          rightPodGrad.addColorStop(0.35, car.primaryColor);
          rightPodGrad.addColorStop(1, '#06060A');
          ctx.fillStyle = rightPodGrad;

          ctx.beginPath();
          ctx.moveTo(carW * 0.14, sidepodY);               // Inner shoulder
          ctx.lineTo(carW * 0.32, sidepodY + carH * 0.15); // Outer shoulder
          ctx.lineTo(carW * 0.28, 0);                      // Outer floor undercut
          ctx.lineTo(carW * 0.12, 0);                      // Gearbox waist
          ctx.closePath();
          ctx.fill();

          // Central Engine Spine & Cowl
          const cowlGrad = ctx.createLinearGradient(0, -carH * 0.95, 0, 0);
          cowlGrad.addColorStop(0, car.accentColor);
          cowlGrad.addColorStop(0.3, car.primaryColor);
          cowlGrad.addColorStop(1, car.secondaryColor);
          ctx.fillStyle = cowlGrad;

          ctx.beginPath();
          ctx.moveTo(-carW * 0.10, -carH * 0.95);
          ctx.lineTo(carW * 0.10, -carH * 0.95);
          ctx.lineTo(carW * 0.12, 0);
          ctx.lineTo(-carW * 0.12, 0);
          ctx.closePath();
          ctx.fill();

          // Sidepod Cooling Gill Louvres
          ctx.strokeStyle = '#08080C';
          ctx.lineWidth = Math.max(1, 2 * curScale);
          for (let l = 0; l < 4; l++) {
            const ly = sidepodY + carH * (0.25 + l * 0.09);
            // Left louvres
            ctx.beginPath();
            ctx.moveTo(-carW * 0.18, ly);
            ctx.lineTo(-carW * 0.26, ly + 2);
            ctx.stroke();
            // Right louvres
            ctx.beginPath();
            ctx.moveTo(carW * 0.18, ly);
            ctx.lineTo(carW * 0.26, ly + 2);
            ctx.stroke();
          }

          // Carbon Shark Fin (Aerodynamic razor spine)
          ctx.fillStyle = '#06060A';
          ctx.beginPath();
          ctx.moveTo(-carW * 0.018, -carH * 1.25);
          ctx.lineTo(carW * 0.018, -carH * 1.25);
          ctx.lineTo(carW * 0.026, -carH * 0.42);
          ctx.lineTo(-carW * 0.026, -carH * 0.42);
          ctx.closePath();
          ctx.fill();

          // Driver Racing Number (#7 Amari / #63 Rival)
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 italic ${Math.max(11, Math.floor(25 * curScale))}px "Formula1", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(car.driverNumber, 0, -carH * 0.65);

          // ----------------------------------------
          // H. Dual Aerodynamic Wing Mirrors on Stalks
          // ----------------------------------------
          const mirrorY = -carH * 0.82;
          ctx.strokeStyle = '#181822';
          ctx.lineWidth = Math.max(1.5, 2.5 * curScale);
          // Left mirror stalk & housing
          ctx.beginPath();
          ctx.moveTo(-carW * 0.12, -carH * 0.75);
          ctx.lineTo(-carW * 0.22, mirrorY);
          ctx.stroke();
          ctx.fillStyle = car.primaryColor;
          ctx.fillRect(-carW * 0.26, mirrorY - 3, carW * 0.06, Math.max(2, 5 * curScale));

          // Right mirror stalk & housing
          ctx.beginPath();
          ctx.moveTo(carW * 0.12, -carH * 0.75);
          ctx.lineTo(carW * 0.22, mirrorY);
          ctx.stroke();
          ctx.fillStyle = car.primaryColor;
          ctx.fillRect(carW * 0.20, mirrorY - 3, carW * 0.06, Math.max(2, 5 * curScale));

          // ----------------------------------------
          // I. Titanium Halo Safety Arch & Driver Helmet
          // ----------------------------------------
          ctx.strokeStyle = '#12121A';
          ctx.lineWidth = Math.max(2.5, 6 * curScale);
          ctx.beginPath();
          ctx.arc(0, -carH * 0.98, Math.max(0.1, carW * 0.095), Math.PI * 0.9, Math.PI * 0.1, true);
          ctx.stroke();

          // Driver Helmet with reflective visor
          ctx.fillStyle = car.accentColor;
          ctx.beginPath();
          ctx.arc(0, -carH * 0.92, Math.max(3, 9.5 * curScale), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000'; // Visor band
          ctx.fillRect(-carW * 0.04, -carH * 0.94, carW * 0.08, Math.max(2, 4.5 * curScale));

          // ----------------------------------------
          // J. Engine Airbox Intake & Apex T-Cam Pod
          // ----------------------------------------
          const airboxW = carW * 0.13;
          const airboxH = carH * 0.22;
          const airboxY = -carH * 1.26;

          // Airbox triangular intake scoop
          ctx.fillStyle = '#0E0E16';
          ctx.beginPath();
          ctx.moveTo(-airboxW * 0.5, airboxY + airboxH);
          ctx.lineTo(0, airboxY);
          ctx.lineTo(airboxW * 0.5, airboxY + airboxH);
          ctx.closePath();
          ctx.fill();

          // Iconic F1 Apex T-Cam Pod (fluoro yellow for #7, black for #63)
          ctx.fillStyle = car.tCamColor;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-carW * 0.025, airboxY - carH * 0.08, carW * 0.05, carH * 0.08, Math.max(0, 1.5 * curScale));
          } else {
            ctx.rect(-carW * 0.025, airboxY - carH * 0.08, carW * 0.05, carH * 0.08);
          }
          ctx.fill();

          // ----------------------------------------
          // K. Swept Dual-Element Rear Wing & DRS System
          // ----------------------------------------
          const wingW = carW * 0.84;
          const wingH = carH * 0.25;
          const wingY = -carH * 1.34;

          // Swan-Neck Mounting Pylons
          ctx.strokeStyle = '#08080E';
          ctx.lineWidth = Math.max(1.8, 4.5 * curScale);
          ctx.beginPath();
          ctx.moveTo(-wingW * 0.18, -carH * 0.65);
          ctx.lineTo(-wingW * 0.16, wingY + wingH * 0.55);
          ctx.moveTo(wingW * 0.18, -carH * 0.65);
          ctx.lineTo(wingW * 0.16, wingY + wingH * 0.55);
          ctx.stroke();

          // Mainplane Lower Airfoil Element
          ctx.fillStyle = '#12121C';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-wingW * 0.5, wingY + wingH * 0.45, wingW, wingH * 0.55, Math.max(0, 3 * curScale));
          } else {
            ctx.rect(-wingW * 0.5, wingY + wingH * 0.45, wingW, wingH * 0.55);
          }
          ctx.fill();

          // Upper DRS Flap (Animates Open when active!)
          const drsGap = car.drsActive ? wingH * 0.70 : 1.5;
          ctx.fillStyle = car.primaryColor;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-wingW * 0.48, wingY - drsGap, wingW * 0.96, wingH * 0.46, Math.max(0, 2.5 * curScale));
          } else {
            ctx.rect(-wingW * 0.48, wingY - drsGap, wingW * 0.96, wingH * 0.46);
          }
          ctx.fill();

          // Flap sponsor text on top wing
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 italic ${Math.max(8, Math.floor(13 * curScale))}px "Formula1", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(car.wingSponsor, 0, wingY - drsGap + wingH * 0.23);

          // Sculpted Carbon Endplates
          const endW = wingW * 0.07;
          const endH = wingH * 2.2;

          // Left Endplate
          ctx.fillStyle = '#0E0E18';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-wingW * 0.52, wingY - wingH * 0.55, endW, endH, Math.max(0, 3 * curScale));
          } else {
            ctx.rect(-wingW * 0.52, wingY - wingH * 0.55, endW, endH);
          }
          ctx.fill();

          // Right Endplate
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(wingW * 0.45, wingY - wingH * 0.55, endW, endH, Math.max(0, 3 * curScale));
          } else {
            ctx.rect(wingW * 0.45, wingY - wingH * 0.55, endW, endH);
          }
          ctx.fill();

          // Central DRS Hydraulic Actuator Pod (Glowing teal/green when open)
          ctx.fillStyle = car.drsActive ? '#00D2BE' : '#333345';
          ctx.fillRect(-carW * 0.025, wingY - drsGap * 0.5, carW * 0.05, wingH * 0.75);

          // ----------------------------------------
          // L. Flashing FIA Red Rain Safety LED Matrix
          // ----------------------------------------
          const rainBlink = Math.sin(now * 0.038 + (car.id === 'car-amari' ? 0 : 2.0)) > 0;
          if (rainBlink) {
            ctx.fillStyle = '#FF0000';
            ctx.shadowColor = '#FF0033';
            ctx.shadowBlur = 22 * curScale;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-carW * 0.05, -diffH * 0.12, carW * 0.1, diffH * 0.45, Math.max(0, 2.5 * curScale));
            } else {
              ctx.rect(-carW * 0.05, -diffH * 0.12, carW * 0.1, diffH * 0.45);
            }
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // ----------------------------------------
          // M. Helical Slipstream Vortex Trails from Wing Tips
          // ----------------------------------------
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = Math.max(1.2, 2.6 * curScale);
          ctx.beginPath();
          ctx.moveTo(-wingW * 0.5, wingY);
          ctx.quadraticCurveTo(-wingW * 0.68, wingY + carH * 0.7, -wingW * 0.9, wingY + carH * 1.6);
          ctx.moveTo(wingW * 0.5, wingY);
          ctx.quadraticCurveTo(wingW * 0.68, wingY + carH * 0.7, wingW * 0.9, wingY + carH * 1.6);
          ctx.stroke();

          ctx.restore();

          // ----------------------------------------
          // N. Titanium Skid Block Sparks Spraying Backwards
          // ----------------------------------------
          car.sparkCooldown += dt;
          if (car.sparkCooldown > 0.028) {
            car.sparkCooldown = 0;
            for (let s = 0; s < 4; s++) {
              sparks.push({
                x: cx + (Math.random() - 0.5) * (carW * 0.38),
                y: cy + carH * 0.16,
                vx: (Math.random() - 0.5) * 550 - curve * 280,
                vy: 140 + Math.random() * 380,
                life: 1,
                maxLife: 0.26 + Math.random() * 0.38,
                size: Math.max(1, (2.0 + Math.random() * 3.2) * curScale),
                color: Math.random() > 0.3 ? '#FFA500' : '#FFF5AA',
              });
            }
          }
        });

        // ==========================================
        // 6. RENDER TITANIUM SPARKS
        // ==========================================
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vy += 450 * dt;
          s.life -= dt / s.maxLife;

          if (s.life <= 0 || s.y > height + 25) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(s.x, s.y, Math.max(0.1, s.size * s.life), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // ==========================================
        // 7. RADIAL SPEED MOTION STREAKS
        // ==========================================
        if (speed > 280) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
          ctx.lineWidth = 1.5;
          for (let l = 0; l < 10; l++) {
            const angle = (l / 10) * Math.PI * 2 + now * 0.006;
            const dist1 = width * 0.32;
            const dist2 = width * 0.78;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * dist1, horizonY + Math.sin(angle) * dist1 * 0.45);
            ctx.lineTo(centerX + Math.cos(angle) * dist2, horizonY + Math.sin(angle) * dist2 * 0.45);
            ctx.stroke();
          }
        }

        // ==========================================
        // 8. CINEMATIC RADIAL VIGNETTE
        // ==========================================
        const vig = ctx.createRadialGradient(
          centerX,
          height * 0.45,
          Math.max(0.1, width * 0.25),
          centerX,
          height * 0.45,
          Math.max(0.1, width * 0.85)
        );
        vig.addColorStop(0, 'rgba(4, 4, 7, 0)');
        vig.addColorStop(0.68, 'rgba(4, 4, 7, 0.45)');
        vig.addColorStop(1, 'rgba(4, 4, 7, 0.92)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);

        // ==========================================
        // 9. ULTRA-LOW COCKPIT TELEMETRY DISPLAY (BOTTOM)
        // ==========================================
        ctx.save();
        const isMobile = width < 600;
        const hudX = isMobile ? 12 : Math.max(20, width * 0.06);
        const hudY = isMobile ? height - 14 : height - 26;

        // Speedometer
        ctx.fillStyle = '#FFFFFF';
        ctx.font = isMobile ? '900 italic 20px "Formula1", monospace' : '900 italic 28px "Formula1", monospace';
        ctx.fillText(`${Math.floor(speed)}`, hudX, hudY);
        ctx.fillStyle = '#8E8E98';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('KM/H', hudX + (isMobile ? 44 : 62), hudY - 2);

        // Gear indicator
        ctx.fillStyle = '#FFB800';
        ctx.font = isMobile ? '900 italic 16px "Formula1", monospace' : '900 italic 22px "Formula1", monospace';
        ctx.fillText('GEAR 8', hudX + (isMobile ? 86 : 120), hudY);

        // DRS status
        if (!isMobile) {
          ctx.fillStyle = '#00D2BE';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('DRS ACTIVE // ZONE 2', hudX, hudY - 24);
        }

        // RPM LED strip
        const rpmLeds = isMobile ? 10 : 15;
        const ledW = isMobile ? 5 : Math.max(6, Math.floor(width * 0.007));
        const activeLeds = Math.min(rpmLeds, Math.floor((speed / maxSpeed) * rpmLeds));
        for (let i = 0; i < rpmLeds; i++) {
          const lx = hudX + i * (ledW + 2.5);
          const ly = hudY - (isMobile ? 24 : 40);
          const color = i < (isMobile ? 3 : 5) ? '#00D2BE' : i < (isMobile ? 7 : 10) ? '#FFB800' : '#E10600';
          ctx.fillStyle = i < activeLeds ? color : 'rgba(255, 255, 255, 0.12)';
          if (i < activeLeds && i >= (isMobile ? 7 : 10)) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
          }
          ctx.fillRect(lx, ly, ledW, isMobile ? 4 : 5);
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      } catch (err) {
        console.error('Render frame error:', err);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
