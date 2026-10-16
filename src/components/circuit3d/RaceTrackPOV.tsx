import React, { useEffect, useRef } from 'react';

/**
 * RaceTrackPOV: High-Octane Formula 1 Low-Angle Cinematic Onboard Engine
 * Built strictly according to the @f1-cinematic-visuals skill directives:
 * - Ultra-low tarmac camera perspective (horizon ~0.24 screen height)
 * - Large, commanding, muscular aerodynamic Formula 1 cars (responsive for mobile & desktop)
 * - Sculpted F1 aero: Carbon composite rear wings, DRS actuators, carbon suspension wishbones,
 *   3D wide Pirelli slicks with camber tilt, Coke-bottle sidepods, diffuser venturi tunnels,
 *   pulsing central FIA rain LEDs, and downshift turbo exhaust flames
 * - Bulletproof Canvas rendering (all radii strictly sanitized with Math.max(0.1, Math.abs(...)))
 * - Mobile-optimized layout: Responsive car scaling, telemetry HUD, and track width
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

    // Racing dynamics
    let speed = 295;
    const maxSpeed = 345;
    let trackOffset = 0;
    let curve = 0;
    let targetCurve = 0.16;
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
      { text: 'PIRELLI', color: '#FFD700', border: '#E10600' },
      { text: 'ROLEX', color: '#00D2BE', border: '#00FFCC' },
      { text: 'CHAMPIONSHIP', color: '#FFFFFF', border: '#8E8E98' },
    ];

    // Battling F1 Cars
    interface F1Car {
      id: string;
      lane: number;
      currentX: number;
      z: number;
      speedDelta: number;
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      teamName: string;
      driverNumber: string;
      drsActive: boolean;
      overtakeTimer: number;
      rollAngle: number;
      sparkCooldown: number;
      flameTimer: number;
    }

    const raceCars: F1Car[] = [
      {
        id: 'amari-7',
        lane: -0.14,
        currentX: -0.14,
        z: 0.86,
        speedDelta: 0.03,
        primaryColor: '#E10600',
        secondaryColor: '#120202',
        accentColor: '#FFB800',
        teamName: 'SCUDERIA M7',
        driverNumber: '7',
        drsActive: true,
        overtakeTimer: 0,
        rollAngle: 0,
        sparkCooldown: 0,
        flameTimer: 0,
      },
      {
        id: 'rival-teal',
        lane: 0.24,
        currentX: 0.24,
        z: 0.77,
        speedDelta: -0.02,
        primaryColor: '#00D2BE',
        secondaryColor: '#051210',
        accentColor: '#FFFFFF',
        teamName: 'PETRONAS AMG',
        driverNumber: '63',
        drsActive: true,
        overtakeTimer: 1.8,
        rollAngle: 0,
        sparkCooldown: 0,
        flameTimer: 0.5,
      },
    ];

    let lastTime = performance.now();

    const render = (now: number) => {
      try {
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;

        // Accelerate up to 345 km/h
        if (speed < maxSpeed) {
          speed = Math.min(speed + dt * 40, maxSpeed);
        }
        trackOffset += (speed * 0.92) * dt;

        // Curvature shifts
        curveTimer += dt;
        if (curveTimer > 3.2) {
          curveTimer = 0;
          targetCurve = (Math.random() - 0.5) * 0.8;
        }
        curve += (targetCurve - curve) * dt * 1.5;

        // High-speed camera shudder
        cameraShake = (Math.sin(now * 0.08) * 0.8 + Math.cos(now * 0.14) * 0.5) * (speed / 300);

        // Low-angle camera geometry
        const horizonY = height * 0.23 + cameraShake * 0.45;
        const centerX = width * 0.5 + curve * width * 0.12;
        const trackDepth = height - horizonY;
        const roadWidthBottom = width * (width < 600 ? 1.95 : 1.78);

        // Clear Canvas
        ctx.fillStyle = '#040407';
        ctx.fillRect(0, 0, width, height);

        // 1. NIGHT SKY & GRANDSTAND ATMOSPHERE
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#020204');
        skyGrad.addColorStop(0.55, '#06060F');
        skyGrad.addColorStop(1, '#0D0D1D');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Grandstand silhouettes & camera flashes
        const grandstandY = horizonY - 24;
        ctx.fillStyle = '#090914';
        ctx.fillRect(0, grandstandY, width, 24);

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

          // Volumetric atmospheric light cone
          const beamGrad = ctx.createLinearGradient(lx, ly, lx + curve * 70, horizonY + trackDepth * 0.45);
          beamGrad.addColorStop(0, 'rgba(180, 225, 255, 0.35)');
          beamGrad.addColorStop(0.35, 'rgba(120, 185, 255, 0.09)');
          beamGrad.addColorStop(1, 'rgba(4, 8, 20, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lx - 14, ly);
          ctx.lineTo(lx + 14, ly);
          ctx.lineTo(lx + 110 + curve * 50, horizonY + trackDepth * 0.45);
          ctx.lineTo(lx - 60 + curve * 50, horizonY + trackDepth * 0.45);
          ctx.closePath();
          ctx.fill();

          // Lens Flare Core
          const flare = ctx.createRadialGradient(lx, ly, 1, lx, ly, 65);
          flare.addColorStop(0, 'rgba(255, 255, 255, 1)');
          flare.addColorStop(0.2, 'rgba(205, 235, 255, 0.6)');
          flare.addColorStop(0.55, 'rgba(80, 140, 255, 0.16)');
          flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = flare;
          ctx.beginPath();
          ctx.arc(lx, ly, 65, 0, Math.PI * 2);
          ctx.fill();

          // Gantry Structure
          ctx.strokeStyle = '#161624';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, horizonY);
          ctx.stroke();
        });

        // 2. TARMAC, BARRIERS, KERBS, AND RUBBER RACING LINES
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

          // A. Run-Off and Trackside Sponsor Barriers
          const barrierW1 = w1 * 0.38;
          const barrierW2 = w2 * 0.38;
          const barrierH1 = Math.max(3, 40 * scale1);
          const barrierH2 = Math.max(3, 40 * scale2);

          // Dark Run-off tarmac outside the track
          ctx.fillStyle = '#06060A';
          ctx.fillRect(0, y1, width, y2 - y1 + 1);

          const sponsorIdx = Math.floor((trackOffset + i) / 5) % sponsors.length;
          const sponsor = sponsors[sponsorIdx];

          // Left Barrier Wall
          ctx.fillStyle = '#0A0A14';
          ctx.beginPath();
          ctx.moveTo(x1 - w1 - barrierW1, y1 - barrierH1);
          ctx.lineTo(x1 - w1, y1);
          ctx.lineTo(x2 - w2, y2);
          ctx.lineTo(x2 - w2 - barrierW2, y2 - barrierH2);
          ctx.closePath();
          ctx.fill();

          // Left Barrier Glowing Neon Top Edge
          ctx.strokeStyle = sponsor.border;
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

          // Right Barrier Glowing Neon Top Edge
          ctx.strokeStyle = sponsor.border;
          ctx.beginPath();
          ctx.moveTo(x1 + w1 + barrierW1, y1 - barrierH1);
          ctx.lineTo(x2 + w2 + barrierW2, y2 - barrierH2);
          ctx.stroke();

          // B. Dark Asphalt Surface
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

          // C. Heavy Rubbered-in Racing Lines
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

          // D. 3D Elevated Championship Kerbs
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

          // E. White Center Dashed Markings
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

        // 3. RENDER SCULPTED, LARGE, AERODYNAMIC FORMULA 1 CARS
        const sortedCars = [...raceCars].sort((a, b) => a.z - b.z);

        sortedCars.forEach((car) => {
          car.overtakeTimer -= dt;
          if (car.overtakeTimer <= 0) {
            car.overtakeTimer = 2.5 + Math.random() * 2.2;
            car.lane = car.id === 'amari-7'
              ? -0.15 + (Math.random() - 0.5) * 0.22
              : 0.22 + (Math.random() - 0.5) * 0.25;
            car.drsActive = true;
            car.flameTimer = 0.35;
          }

          const prevX = car.currentX;
          car.currentX += (car.lane - car.currentX) * dt * 2.6;
          car.rollAngle = (car.currentX - prevX) * 24;

          car.z += car.speedDelta * dt * 0.45;
          if (car.z > 0.90) car.speedDelta = -Math.abs(car.speedDelta);
          if (car.z < 0.76) car.speedDelta = Math.abs(car.speedDelta);

          const cScale = Math.pow(car.z, 2.35);
          const cy = horizonY + cScale * trackDepth;
          const curScale = (cy - horizonY) / trackDepth;
          const cCurve = Math.pow(1 - curScale, 2.2) * curve * width * 0.46;
          const cx = centerX - cCurve + car.currentX * roadWidthBottom * curScale * 0.46;

          // Responsive sizing: adapts to phone (375px) vs desktop (1536px)
          const maxResponsiveWidth = Math.min(width * 0.70, 420);
          const carW = Math.max(110, maxResponsiveWidth * curScale);
          const carH = carW * 0.38;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(car.rollAngle * (Math.PI / 180));

          // 1. Asphalt Ground Shadow
          const groundShadow = ctx.createRadialGradient(0, carH * 0.3, Math.max(0.1, carW * 0.12), 0, carH * 0.3, Math.max(0.1, carW * 0.65));
          groundShadow.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
          groundShadow.addColorStop(0.45, 'rgba(0, 0, 0, 0.75)');
          groundShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = groundShadow;
          ctx.beginPath();
          ctx.ellipse(0, carH * 0.32, Math.max(0.1, carW * 0.58), Math.max(0.1, carH * 0.36), 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Wide Slick Pirelli P-Zero Racing Tires
          const tireW = carW * 0.23;
          const tireH = carH * 0.86;
          const tireY = -tireH * 0.62;

          const renderF1Tire = (isLeft: boolean) => {
            const tx = isLeft ? -carW * 0.52 : carW * 0.29;
            ctx.save();
            ctx.translate(tx + tireW * 0.5, tireY + tireH * 0.5);
            ctx.rotate((isLeft ? 3.5 : -3.5) * (Math.PI / 180));

            const tireGrad = ctx.createLinearGradient(-tireW * 0.5, 0, tireW * 0.5, 0);
            tireGrad.addColorStop(0, '#08080C');
            tireGrad.addColorStop(0.35, '#22222E');
            tireGrad.addColorStop(0.7, '#14141E');
            tireGrad.addColorStop(1, '#050508');
            ctx.fillStyle = tireGrad;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-tireW * 0.5, -tireH * 0.5, tireW, tireH, Math.max(0, 6 * curScale));
            } else {
              ctx.rect(-tireW * 0.5, -tireH * 0.5, tireW, tireH);
            }
            ctx.fill();

            // Pirelli Red Tyre Compound Sidewall Rings
            ctx.strokeStyle = '#E10600';
            ctx.lineWidth = Math.max(2, 4 * curScale);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(0.1, tireW * 0.38), Math.max(0.1, tireH * 0.4), 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner wheel rim highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = Math.max(1, 1.5 * curScale);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(0.1, tireW * 0.26), Math.max(0.1, tireH * 0.28), 0, 0, Math.PI * 2);
            ctx.stroke();

            // Carbon Aero Wheel Cover & Gold Centerlock
            ctx.fillStyle = '#0D0D14';
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0.1, tireW * 0.22), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFB800';
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1.5, 3.5 * curScale), 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          };

          renderF1Tire(true);
          renderF1Tire(false);

          // 3. Carbon Suspension Wishbone Arms
          ctx.strokeStyle = '#181822';
          ctx.lineWidth = Math.max(1.5, 3 * curScale);
          ctx.beginPath();
          ctx.moveTo(-carW * 0.22, -carH * 0.55);
          ctx.lineTo(-carW * 0.40, -carH * 0.52);
          ctx.moveTo(-carW * 0.22, -carH * 0.25);
          ctx.lineTo(-carW * 0.40, -carH * 0.22);
          ctx.moveTo(carW * 0.22, -carH * 0.55);
          ctx.lineTo(carW * 0.40, -carH * 0.52);
          ctx.moveTo(carW * 0.22, -carH * 0.25);
          ctx.lineTo(carW * 0.40, -carH * 0.22);
          ctx.stroke();

          // 4. Carbon Fibre Diffuser Tunnels
          const diffW = carW * 0.56;
          const diffH = carH * 0.36;
          ctx.fillStyle = '#09090E';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-diffW * 0.5, -diffH * 0.5, diffW, diffH, Math.max(0, 4 * curScale));
          } else {
            ctx.rect(-diffW * 0.5, -diffH * 0.5, diffW, diffH);
          }
          ctx.fill();

          // Diffuser vertical venturi strakes
          ctx.strokeStyle = '#1E1E2C';
          ctx.lineWidth = Math.max(1, 2.5 * curScale);
          for (let s = -3; s <= 3; s++) {
            if (s === 0) continue;
            const fx = (diffW * 0.44 / 3) * s;
            ctx.beginPath();
            ctx.moveTo(fx, -diffH * 0.45);
            ctx.lineTo(fx, diffH * 0.45);
            ctx.stroke();
          }

          // Exhaust Exit with Turbo Glow & Downshift Flame
          car.flameTimer = Math.max(0, car.flameTimer - dt);
          if (car.flameTimer > 0) {
            const flameGrad = ctx.createRadialGradient(0, -diffH * 0.15, 2, 0, -diffH * 0.15, Math.max(5, 22 * curScale));
            flameGrad.addColorStop(0, '#FFFFFF');
            flameGrad.addColorStop(0.3, '#FFB800');
            flameGrad.addColorStop(0.7, '#FF3300');
            flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.arc(0, -diffH * 0.15, Math.max(5, 22 * curScale), 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#FF5500';
            ctx.shadowColor = '#FF3300';
            ctx.shadowBlur = 12 * curScale;
            ctx.beginPath();
            ctx.arc(0, -diffH * 0.18, Math.max(3, 6.5 * curScale), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // 5. Sculpted Aerodynamic Coke-Bottle Bodywork & Sidepods
          const bodyGrad = ctx.createLinearGradient(0, -carH * 0.95, 0, 0);
          bodyGrad.addColorStop(0, car.accentColor);
          bodyGrad.addColorStop(0.32, car.primaryColor);
          bodyGrad.addColorStop(0.85, car.secondaryColor);
          bodyGrad.addColorStop(1, '#050508');
          ctx.fillStyle = bodyGrad;

          ctx.beginPath();
          ctx.moveTo(-carW * 0.16, -carH * 0.9);
          ctx.lineTo(carW * 0.16, -carH * 0.9);
          ctx.bezierCurveTo(carW * 0.3, -carH * 0.68, carW * 0.38, -carH * 0.28, carW * 0.29, 0);
          ctx.lineTo(-carW * 0.29, 0);
          ctx.bezierCurveTo(-carW * 0.38, -carH * 0.28, -carW * 0.3, -carH * 0.68, -carW * 0.16, -carH * 0.9);
          ctx.closePath();
          ctx.fill();

          // Glossy clearcoat sheen
          const glossGrad = ctx.createLinearGradient(-carW * 0.1, -carH * 0.85, carW * 0.1, -carH * 0.85);
          glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
          glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glossGrad;
          ctx.fillRect(-carW * 0.14, -carH * 0.88, carW * 0.28, carH * 0.45);

          // Carbon Shark Fin
          ctx.fillStyle = '#08080C';
          ctx.beginPath();
          ctx.moveTo(-carW * 0.02, -carH * 1.2);
          ctx.lineTo(carW * 0.02, -carH * 1.2);
          ctx.lineTo(carW * 0.035, -carH * 0.48);
          ctx.lineTo(-carW * 0.035, -carH * 0.48);
          ctx.closePath();
          ctx.fill();

          // Driver Racing Number Badge (#7)
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 italic ${Math.max(11, Math.floor(25 * curScale))}px "Formula1", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(car.driverNumber, 0, -carH * 0.68);

          // 6. Halo Titanium Safety Hoop & Driver Helmet
          ctx.strokeStyle = '#14141E';
          ctx.lineWidth = Math.max(2.5, 6 * curScale);
          ctx.beginPath();
          ctx.arc(0, -carH * 0.98, Math.max(0.1, carW * 0.1), Math.PI * 0.9, Math.PI * 0.1, true);
          ctx.stroke();

          // Driver Helmet
          ctx.fillStyle = car.accentColor;
          ctx.beginPath();
          ctx.arc(0, -carH * 0.92, Math.max(3, 10 * curScale), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.fillRect(-carW * 0.045, -carH * 0.94, carW * 0.09, Math.max(2, 5 * curScale));

          // 7. Sculpted Carbon Fiber Rear Wing Assembly
          const wingW = carW * 0.84;
          const wingH = carH * 0.25;
          const wingY = -carH * 1.32;

          // Pylons
          ctx.strokeStyle = '#0B0B10';
          ctx.lineWidth = Math.max(1.8, 4.5 * curScale);
          ctx.beginPath();
          ctx.moveTo(-wingW * 0.18, -carH * 0.65);
          ctx.lineTo(-wingW * 0.16, wingY + wingH * 0.55);
          ctx.moveTo(wingW * 0.18, -carH * 0.65);
          ctx.lineTo(wingW * 0.16, wingY + wingH * 0.55);
          ctx.stroke();

          // Mainplane
          ctx.fillStyle = '#14141E';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-wingW * 0.5, wingY + wingH * 0.45, wingW, wingH * 0.55, Math.max(0, 3 * curScale));
          } else {
            ctx.rect(-wingW * 0.5, wingY + wingH * 0.45, wingW, wingH * 0.55);
          }
          ctx.fill();

          // Upper DRS Flap
          const drsGap = car.drsActive ? wingH * 0.65 : 1.5;
          ctx.fillStyle = car.primaryColor;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-wingW * 0.48, wingY - drsGap, wingW * 0.96, wingH * 0.48, Math.max(0, 2.5 * curScale));
          } else {
            ctx.rect(-wingW * 0.48, wingY - drsGap, wingW * 0.96, wingH * 0.48);
          }
          ctx.fill();

          // Carbon Wing Endplates with Accent Aero Trim
          const endW = wingW * 0.065;
          const endH = wingH * 2.3;

          // Left Endplate
          ctx.fillStyle = '#0F0F16';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-wingW * 0.52, wingY - wingH * 0.55, endW, endH, Math.max(0, 2.5 * curScale));
          } else {
            ctx.rect(-wingW * 0.52, wingY - wingH * 0.55, endW, endH);
          }
          ctx.fill();
          ctx.fillStyle = car.accentColor;
          ctx.fillRect(-wingW * 0.52, wingY - wingH * 0.55, Math.max(1.5, 2.5 * curScale), endH);

          // Right Endplate
          ctx.fillStyle = '#0F0F16';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(wingW * 0.455, wingY - wingH * 0.55, endW, endH, Math.max(0, 2.5 * curScale));
          } else {
            ctx.rect(wingW * 0.455, wingY - wingH * 0.55, endW, endH);
          }
          ctx.fill();
          ctx.fillStyle = car.accentColor;
          ctx.fillRect(wingW * 0.455 + endW - Math.max(1.5, 2.5 * curScale), wingY - wingH * 0.55, Math.max(1.5, 2.5 * curScale), endH);

          // DRS Hydraulic Actuator Pod
          ctx.fillStyle = car.drsActive ? '#00D2BE' : '#333345';
          ctx.fillRect(-carW * 0.028, wingY - drsGap * 0.5, carW * 0.056, wingH * 0.75);

          // 8. Flashing FIA Rain Safety Light
          const rainBlink = Math.sin(now * 0.038 + (car.id === 'amari-7' ? 0 : 2.0)) > 0;
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

          // 9. Helical Slipstream Vortex Trails from Wing Tips
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = Math.max(1.2, 2.6 * curScale);
          ctx.beginPath();
          ctx.moveTo(-wingW * 0.5, wingY);
          ctx.quadraticCurveTo(-wingW * 0.68, wingY + carH * 0.7, -wingW * 0.9, wingY + carH * 1.6);
          ctx.moveTo(wingW * 0.5, wingY);
          ctx.quadraticCurveTo(wingW * 0.68, wingY + carH * 0.7, wingW * 0.9, wingY + carH * 1.6);
          ctx.stroke();

          ctx.restore();

          // 10. Titanium Ground-Effect Sparks
          car.sparkCooldown += dt;
          if (car.sparkCooldown > 0.028) {
            car.sparkCooldown = 0;
            for (let s = 0; s < 4; s++) {
              sparks.push({
                x: cx + (Math.random() - 0.5) * (carW * 0.4),
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

        // 4. RENDER TITANIUM SPARKS
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

        // 5. RADIAL SPEED MOTION STREAKS
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

        // 6. CINEMATIC RADIAL VIGNETTE
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

        // 7. ULTRA-LOW COCKPIT TELEMETRY DISPLAY (BOTTOM)
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
