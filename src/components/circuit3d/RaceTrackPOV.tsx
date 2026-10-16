import React, { useEffect, useRef } from 'react';

export const RaceTrackPOV: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    // Track state
    let speed = 0;
    let trackOffset = 0;
    let curve = 0;
    let targetCurve = 0.2;
    let curveTimer = 0;
    let gear = 7;
    let rpm = 0.85;

    // Sparks particles
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

    // Ahead cars
    const aheadCars = [
      { x: -0.18, z: 0.55, targetX: -0.15, color: '#E10600', wingColor: '#FFFFFF' }, // Rival 1 (Ferrari red)
      { x: 0.16, z: 0.75, targetX: 0.2, color: '#00D2BE', wingColor: '#00D2BE' },   // Rival 2 (Mercedes teal)
    ];

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Accelerate speed up to 330 km/h
      speed = Math.min(speed + dt * 80, 335);
      trackOffset += (speed * 1.5) * dt;

      // Shift curve dynamically
      curveTimer += dt;
      if (curveTimer > 2.8) {
        curveTimer = 0;
        targetCurve = (Math.random() - 0.5) * 0.8;
      }
      curve += (targetCurve - curve) * dt * 1.2;

      // Simulated engine RPM & Gear
      rpm = 0.82 + Math.sin(now * 0.008) * 0.15;
      gear = speed > 290 ? 8 : speed > 240 ? 7 : 6;

      // Generate titanium ground-effect sparks
      if (Math.random() < 0.65) {
        for (let i = 0; i < 3; i++) {
          sparks.push({
            x: width * 0.5 + (Math.random() - 0.5) * 80,
            y: height * 0.72 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 350 - curve * 200,
            vy: (Math.random() - 0.2) * 280,
            life: 1,
            maxLife: 0.2 + Math.random() * 0.35,
            size: 1.5 + Math.random() * 2.5,
            color: Math.random() > 0.3 ? '#FFA500' : '#FFD700',
          });
        }
      }

      // Clear with dark night track atmosphere
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, width, height);

      // Horizon & Night Sky Gradient with stadium lights
      const horizonY = height * 0.42;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#040407');
      skyGrad.addColorStop(0.7, '#080812');
      skyGrad.addColorStop(1, '#141424');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Stadium floodlights in distance
      for (let i = 0; i < 6; i++) {
        const lx = width * (0.1 + i * 0.16) + curve * 40;
        const ly = horizonY - 35;
        const lGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, 45);
        lGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        lGrad.addColorStop(0.3, 'rgba(200, 230, 255, 0.3)');
        lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, 45, 0, Math.PI * 2);
        ctx.fill();

        // Light tower pole
        ctx.strokeStyle = '#222230';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, horizonY);
        ctx.stroke();
      }

      // Draw perspective race track segments (from horizon down to bottom)
      const lines = 70;
      const roadWidth = width * 1.35;

      const centerX = width * 0.5;

      for (let i = lines - 1; i >= 0; i--) {
        const p1 = (i / lines);
        const p2 = ((i + 1) / lines);

        const y1 = horizonY + Math.pow(p1, 2.2) * (height - horizonY);
        const y2 = horizonY + Math.pow(p2, 2.2) * (height - horizonY);

        const scale1 = (y1 - horizonY) / (height - horizonY);
        const scale2 = (y2 - horizonY) / (height - horizonY);

        const w1 = roadWidth * Math.pow(scale1, 1.1) * 0.5;
        const w2 = roadWidth * Math.pow(scale2, 1.1) * 0.5;

        const curveOffset1 = Math.pow(1 - scale1, 2) * curve * width * 0.45;
        const curveOffset2 = Math.pow(1 - scale2, 2) * curve * width * 0.45;

        const x1 = centerX - curveOffset1;
        const x2 = centerX - curveOffset2;

        const segmentIndex = Math.floor(trackOffset + i);
        const isStripe = segmentIndex % 2 === 0;

        // Asphalt road surface
        ctx.fillStyle = isStripe ? '#181822' : '#14141D';
        ctx.beginPath();
        ctx.moveTo(x1 - w1, y1);
        ctx.lineTo(x1 + w1, y1);
        ctx.lineTo(x2 + w2, y2);
        ctx.lineTo(x2 - w2, y2);
        ctx.closePath();
        ctx.fill();

        // Rumble kerbs (Red and White striped racing kerbs on track boundaries)
        const kerbWidth1 = w1 * 0.16;
        const kerbWidth2 = w2 * 0.16;
        const kerbColor = isStripe ? '#E10600' : '#FFFFFF';

        // Left Kerb
        ctx.fillStyle = kerbColor;
        ctx.beginPath();
        ctx.moveTo(x1 - w1 - kerbWidth1, y1);
        ctx.lineTo(x1 - w1, y1);
        ctx.lineTo(x2 - w2, y2);
        ctx.lineTo(x2 - w2 - kerbWidth2, y2);
        ctx.closePath();
        ctx.fill();

        // Right Kerb
        ctx.beginPath();
        ctx.moveTo(x1 + w1, y1);
        ctx.lineTo(x1 + w1 + kerbWidth1, y1);
        ctx.lineTo(x2 + w2 + kerbWidth2, y2);
        ctx.lineTo(x2 + w2, y2);
        ctx.closePath();
        ctx.fill();

        // White Center lane dashed markings
        if (Math.floor((trackOffset + i) / 3) % 2 === 0 && scale1 > 0.08) {
          const dashW1 = Math.max(1, w1 * 0.025);
          const dashW2 = Math.max(1, w2 * 0.025);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.moveTo(x1 - dashW1, y1);
          ctx.lineTo(x1 + dashW1, y1);
          ctx.lineTo(x2 + dashW2, y2);
          ctx.lineTo(x2 - dashW2, y2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Render ahead racing F1 cars in perspective
      aheadCars.forEach((car, index) => {
        car.x += (car.targetX - car.x) * dt * 2;
        if (Math.random() < 0.02) {
          car.targetX = (Math.random() - 0.5) * 0.4;
        }

        const cz = car.z;
        const cy = horizonY + Math.pow(cz, 2.2) * (height - horizonY);
        const cscale = (cy - horizonY) / (height - horizonY);
        const cCurveOffset = Math.pow(1 - cscale, 2) * curve * width * 0.45;
        const cx = centerX - cCurveOffset + car.x * width * cscale;

        const carWidth = 140 * cscale;
        const carHeight = 45 * cscale;

        if (carWidth < 8) return;

        // F1 Car Rear Wing
        ctx.fillStyle = car.wingColor;
        ctx.fillRect(cx - carWidth * 0.45, cy - carHeight * 0.9, carWidth * 0.9, carHeight * 0.25);

        // Rear Wing Endplates
        ctx.fillStyle = car.color;
        ctx.fillRect(cx - carWidth * 0.48, cy - carHeight * 1.05, carWidth * 0.08, carHeight * 0.55);
        ctx.fillRect(cx + carWidth * 0.4, cy - carHeight * 1.05, carWidth * 0.08, carHeight * 0.55);

        // Body Chassis
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.moveTo(cx - carWidth * 0.25, cy - carHeight * 0.65);
        ctx.lineTo(cx + carWidth * 0.25, cy - carHeight * 0.65);
        ctx.lineTo(cx + carWidth * 0.2, cy);
        ctx.lineTo(cx - carWidth * 0.2, cy);
        ctx.closePath();
        ctx.fill();

        // Massive Rear Slick Tires
        ctx.fillStyle = '#111116';
        ctx.fillRect(cx - carWidth * 0.55, cy - carHeight * 0.5, carWidth * 0.2, carHeight * 0.7);
        ctx.fillRect(cx + carWidth * 0.35, cy - carHeight * 0.5, carWidth * 0.2, carHeight * 0.7);

        // Pirelli Red Soft tyre compound rim ring
        ctx.strokeStyle = '#E10600';
        ctx.lineWidth = Math.max(1, 2 * cscale);
        ctx.strokeRect(cx - carWidth * 0.53, cy - carHeight * 0.45, carWidth * 0.16, carHeight * 0.6);
        ctx.strokeRect(cx + carWidth * 0.37, cy - carHeight * 0.45, carWidth * 0.16, carHeight * 0.6);

        // Flashing FIA Red Rain Safety LED in center
        const isBlinking = Math.sin(now * 0.025 + index) > 0;
        if (isBlinking) {
          ctx.fillStyle = '#FF0000';
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 15;
          ctx.fillRect(cx - carWidth * 0.06, cy - carHeight * 0.25, carWidth * 0.12, carHeight * 0.18);
          ctx.shadowBlur = 0;
        }

        // Aero Slipstream & Tire Spray
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - carWidth * 0.4, cy);
        ctx.lineTo(cx - carWidth * 0.8, cy + carHeight * 1.8);
        ctx.moveTo(cx + carWidth * 0.4, cy);
        ctx.lineTo(cx + carWidth * 0.8, cy + carHeight * 1.8);
        ctx.stroke();
      });

      // Render Titanium Ground-Effect Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 450 * dt; // Gravity pull
        s.life -= dt / s.maxLife;

        if (s.life <= 0 || s.y > height) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Speed Vignette & Motion Blur edges
      const vigGrad = ctx.createRadialGradient(
        centerX,
        height * 0.6,
        width * 0.25,
        centerX,
        height * 0.6,
        width * 0.85
      );
      vigGrad.addColorStop(0, 'rgba(9, 9, 13, 0.35)');
      vigGrad.addColorStop(0.7, 'rgba(9, 9, 13, 0.82)');
      vigGrad.addColorStop(1, 'rgba(9, 9, 13, 0.98)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      // Cockpit POV: F1 Titanium/Carbon Halo Pillar in bottom center
      const haloX = centerX;
      const haloBaseY = height;
      const haloTopY = height * 0.52;

      ctx.save();
      ctx.fillStyle = '#0F0F14';
      ctx.strokeStyle = '#252530';
      ctx.lineWidth = 3;

      // Central vertical aero pylon
      ctx.beginPath();
      ctx.moveTo(haloX - 14, haloBaseY);
      ctx.lineTo(haloX - 8, haloTopY + 30);
      ctx.lineTo(haloX + 8, haloTopY + 30);
      ctx.lineTo(haloX + 14, haloBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top curved horizontal halo bar
      ctx.beginPath();
      ctx.moveTo(0, haloTopY - 20);
      ctx.quadraticCurveTo(haloX, haloTopY + 25, width, haloTopY - 20);
      ctx.lineTo(width, haloTopY + 5);
      ctx.quadraticCurveTo(haloX, haloTopY + 50, 0, haloTopY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Real-time F1 Cockpit Telemetry HUD in bottom-left
      ctx.save();
      const hudX = Math.max(16, width * 0.05);
      const hudY = height - 35;

      // Speedometer
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold italic 24px monospace';
      ctx.fillText(`${Math.floor(speed)}`, hudX, hudY);
      ctx.fillStyle = '#8E8E98';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('KM/H', hudX + 52, hudY);

      // Gear indicator
      ctx.fillStyle = '#FFB800';
      ctx.font = 'bold italic 22px monospace';
      ctx.fillText(`GEAR ${gear}`, hudX + 105, hudY);

      // DRS status
      ctx.fillStyle = '#00D2BE';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('DRS ACTIVE', hudX, hudY - 24);

      // Steering wheel RPM Rev LED strip
      const ledCount = 12;
      const ledWidth = 8;
      const activeLeds = Math.floor(rpm * ledCount);
      for (let i = 0; i < ledCount; i++) {
        const lx = hudX + i * (ledWidth + 3);
        const ly = hudY - 42;
        const color = i < 4 ? '#00D2BE' : i < 8 ? '#FFB800' : '#E10600';
        ctx.fillStyle = i < activeLeds ? color : 'rgba(255, 255, 255, 0.15)';
        if (i < activeLeds && i >= 8) {
          ctx.shadowColor = '#E10600';
          ctx.shadowBlur = 6;
        }
        ctx.fillRect(lx, ly, ledWidth, 6);
        ctx.shadowBlur = 0;
      }
      ctx.restore();

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
