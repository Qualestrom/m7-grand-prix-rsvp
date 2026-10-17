import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
}

interface SpeedStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
  height: number;
  alpha: number;
}

export const PaddockPassBackdrop: React.FC = () => {
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
      initTrack();
    };

    window.addEventListener('resize', handleResize);

    // --- 1. Closed Circuit Track Spline & Car Light Tracer ---
    let trackPoints: { x: number; y: number }[] = [];
    let carProgress = 0;

    const initTrack = () => {
      // Generates an elegant, wide F1 circuit outline scaled to the screen
      trackPoints = [];
      const cx = width / 2;
      const cy = height / 2;
      const rx = Math.min(width * 0.42, 540);
      const ry = Math.min(height * 0.38, 300);

      const numPoints = 120;
      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        // Asymmetric formula evoking an F1 circuit (straightaways, esses, hairpin)
        const r = 1 + 0.18 * Math.cos(2 * theta) - 0.12 * Math.sin(3 * theta) + 0.08 * Math.cos(theta);
        const px = cx + rx * r * Math.cos(theta);
        const py = cy + ry * r * Math.sin(theta);
        trackPoints.push({ x: px, y: py });
      }
    };

    initTrack();

    // --- 2. Floating Night Circuit Micro-Sparks / Embers ---
    const particles: Particle[] = [];
    const MAX_PARTICLES = 16;
    const sparkColors = ['#FF1801', '#FFB800', '#FFFFFF', '#00D2BE'];

    const createParticle = (): Particle => {
      const isBottom = Math.random() > 0.3;
      return {
        x: Math.random() * width,
        y: isBottom ? height + 10 : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.3 + Math.random() * 0.6),
        size: 1 + Math.random() * 1.8,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        alpha: 0,
        maxAlpha: 0.2 + Math.random() * 0.4,
        life: 0,
        maxLife: 200 + Math.random() * 250,
      };
    };

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = createParticle();
      p.y = Math.random() * height;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    // --- 3. Faded Speed Light Streaks (Horizontal/Angled) ---
    const streaks: SpeedStreak[] = [];
    const streakColors = [
      'rgba(225, 6, 0, ',    // Ferrari Red
      'rgba(0, 210, 190, ',  // Petronas Teal
      'rgba(255, 184, 0, ',  // Gold / Amber
    ];

    const createStreak = (initial = false): SpeedStreak => {
      const colorBase = streakColors[Math.floor(Math.random() * streakColors.length)];
      return {
        x: initial ? Math.random() * width : -300 - Math.random() * 200,
        y: Math.random() * height,
        length: 180 + Math.random() * 240,
        speed: 4 + Math.random() * 5,
        color: colorBase,
        height: 1 + Math.random() * 1.5,
        alpha: 0.12 + Math.random() * 0.18,
      };
    };

    for (let i = 0; i < 4; i++) {
      streaks.push(createStreak(true));
    }

    // History trail for the car on the track
    const carTrail: { x: number; y: number }[] = [];
    const MAX_TRAIL = 18;

    // --- Animation Loop ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // A. Draw Subtle Asphalt Skid Marks in Corners (faded tire rubber marks)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';

      // Top-left curved skid mark
      ctx.beginPath();
      ctx.arc(width * 0.12, height * 0.15, Math.min(width * 0.18, 140), 0.2, 1.4);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(225, 6, 0, 0.04)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(width * 0.12, height * 0.15, Math.min(width * 0.18, 140) + 16, 0.2, 1.4);
      ctx.stroke();

      // Bottom-right curved skid mark
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(width * 0.88, height * 0.85, Math.min(width * 0.18, 140), 3.3, 4.6);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 210, 190, 0.035)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(width * 0.88, height * 0.85, Math.min(width * 0.18, 140) - 16, 3.3, 4.6);
      ctx.stroke();
      ctx.restore();

      // B. Draw Faint Racetrack Outline
      if (trackPoints.length > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(trackPoints[0].x, trackPoints[0].y);
        for (let i = 1; i < trackPoints.length; i++) {
          ctx.lineTo(trackPoints[i].x, trackPoints[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();

        // Car tracer position along the spline
        carProgress = (carProgress + 0.0018) % 1;
        const totalSegments = trackPoints.length - 1;
        const floatIndex = carProgress * totalSegments;
        const baseIndex = Math.floor(floatIndex);
        const nextIndex = (baseIndex + 1) % trackPoints.length;
        const frac = floatIndex - baseIndex;

        const p1 = trackPoints[baseIndex];
        const p2 = trackPoints[nextIndex];
        const currentCarX = p1.x + (p2.x - p1.x) * frac;
        const currentCarY = p1.y + (p2.y - p1.y) * frac;

        carTrail.unshift({ x: currentCarX, y: currentCarY });
        if (carTrail.length > MAX_TRAIL) {
          carTrail.pop();
        }

        // Draw Car Light Trail (Fading red comet tail)
        for (let i = carTrail.length - 1; i >= 0; i--) {
          const tPoint = carTrail[i];
          const fadeFrac = 1 - i / MAX_TRAIL;
          ctx.beginPath();
          ctx.arc(tPoint.x, tPoint.y, 1.2 + fadeFrac * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(225, 6, 0, ${fadeFrac * 0.35})`;
          ctx.fill();
        }

        // Lead Car Headlight / Taillight Dot
        ctx.beginPath();
        ctx.arc(currentCarX, currentCarY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF1801';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // C. Draw Speed Light Streaks
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.x += s.speed;

        // Reset if offscreen
        if (s.x - s.length > width) {
          streaks[i] = createStreak(false);
          continue;
        }

        const grad = ctx.createLinearGradient(s.x - s.length, s.y, s.x, s.y);
        grad.addColorStop(0, `${s.color}0)`);
        grad.addColorStop(0.7, `${s.color}${s.alpha * 0.7})`);
        grad.addColorStop(1, `${s.color}${s.alpha})`);

        ctx.fillStyle = grad;
        ctx.fillRect(s.x - s.length, s.y, s.length, s.height);

        // Tiny bright leading head
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(s.x - 2, s.y - 0.5, 3, s.height + 1);
      }

      // D. Draw Drifting Night Sparks / Embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Fade in and out smoothly
        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.7) {
          p.alpha = (1 - (progress - 0.7) / 0.3) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        if (p.life >= p.maxLife || p.y < -10) {
          particles[i] = createParticle();
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Soft Luxury Vignette Base Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.14)_0%,rgba(9,9,13,0.98)_72%)]" />

      {/* Subtle Top & Bottom Red-White Racing Kerb Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 kerb-inlay-h opacity-40" />
      <div className="absolute bottom-0 left-0 right-0 h-1 kerb-inlay-h opacity-40" />

      {/* Lightweight Dynamic Canvas for Small Moving F1 Effects */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
