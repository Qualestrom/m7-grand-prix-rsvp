---
name: f1-cinematic-visuals
description: "Expert in high-octane Formula 1 cinematic web experiences, ultra-low dynamic camera perspective, procedural aerodynamic racecar rendering, particle physics (titanium sparks, tire smoke, slipstream vapor), broadcast telemetry HUDs, and visceral motion aesthetics."
category: frontend
risk: safe
date_added: "2026-10-17"
author: "Antigravity F1 Motion & Graphics Engine"
tags: [formula1, canvas, webgl, 3d, motion, aerodynamics, broadcast-graphics]
tools: [claude, cursor, codex, antigravity]
---

# Agent Skill: Formula 1 Cinematic Visuals & Aerodynamic Graphics Engine

## When to Use
- Use whenever designing or enhancing Formula 1, motorsport, or extreme-speed racing visuals in web applications.
- Use when rendering racecars, track perspectives, onboard camera views, cockpit HUDs, or dynamic atmospheric racing scenes.
- Use when user feedback indicates visuals are "too high", "blocky", "arcade-like", "flat", or lacking cinematic drama.

---

## 1. Core Principles of F1 Cinematic Drama

### A. Ultra-Low Camera Perspective (Tarmac-Skimming Drama)
- **The Golden Horizon Rule**: High camera angles (horizon > 40% screen height) evoke blimps, drones, or arcade top-down games, destroying the sense of speed. True F1 cinematics require an asphalt-skimming chase or onboard nosecone perspective:
  - **Horizon Line**: Kept aggressively low (`0.22 - 0.30` of screen height).
  - **Vanishing Point Geometry**: Non-linear perspective scaling ($z^{2.6} - z^{3.2}$) compressing distance and making foreground objects explode toward the lens.
  - **Camera Banking & G-Force Roll**: When cornering, the camera rolls into the turn ($1.5^\circ - 3.5^\circ$) with subtle high-frequency vibration ($20 - 45\text{ Hz}$) proportional to simulated speed ($>280\text{ km/h}$).

### B. Sculpted Aerodynamic Car Rendering (The Anti-Blocky Mandate)
Formula 1 cars are complex aerodynamic sculptures, never simple boxes or 2D rectangles:
1. **Scale & Dominance**:
   - Foreground or mid-distance cars must command visual presence (min $220\text{px} - 450\text{px}$ width at overtake distance).
2. **Key Aerodynamic Silhouettes**:
   - **Curving Sidepods & Radiator Inlets**: Deep undercut air channels with realistic ambient occlusion, drop shadows, and sponsor livery accents.
   - **Coke-Bottle Rear Waist & Engine Cowl**: Tapering engine cover featuring the signature carbon shark fin and driver number (#7).
   - **Multi-Element Rear Wing & DRS**: High-downforce curved dual-plane wing, DRS hydraulic actuator pod, and slotted endplates shedding aerodynamic wake.
   - **Wide Slick Racing Wheels (Pirelli P-Zero Compound)**:
     - 3D-shaded cylindrical tire barrels with realistic ground-contact flat patch.
     - Red (Soft) or Yellow (Medium) Pirelli sidewall tire compound rings.
     - Carbon aerodynamic wheel covers with visible center-lock titanium nut.
   - **Titanium Undertray & Diffuser**: Multi-channel venturi strakes underneath, housing the central FIA flashing rain/safety LED cluster.
   - **Halo & Cockpit Aero**: Titanium safety hoop with aerodynamic fairing and black helmet visor reflection.

### C. Atmospheric Particle Physics & Visceral Effects
1. **Titanium Ground-Effect Sparks**:
   - Generated from undertray skid blocks compressing over kerbs and bumps.
   - Sparks bounce off the asphalt with physics-based gravity, restitution, and decay.
   - Multi-temperature color ramp: Intense white-hot core (`#FFFFFF`) transitioning to neon orange-gold (`#FF9500`) and glowing embers.
2. **Slipstream Aero Vortex & Spray**:
   - Twin helical vortex trails peeling off rear wing tips in humid or high-downforce conditions.
   - Diffuser heat shimmer distortion and tire roost spray streaming backwards.
3. **Asphalt & Racing Surface Fidelity**:
   - Dark textured asphalt with visible dark rubbered-in racing lines.
   - 3D raised racing kerbs (alternating championship red and white blocks with perspective bevelling).
   - Overhead track floodlight towers casting directional lens flares and specular highlights across carbon fiber clearcoats.

---

## 2. Implementation Guidelines (HTML5 Canvas / WebGL)

### Procedural F1 Car Drawing Architecture
```typescript
function drawFormula1Car(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  carConfig: {
    primaryColor: string;
    accentColor: string;
    number: string;
    drsOpen: boolean;
    steeringAngle: number;
    sparkIntensity: number;
  }
) {
  // 1. Drop Shadow & Asphalt Ambient Occlusion
  // 2. Diffuser Venturi Tunnels & Undertray
  // 3. Left & Right Pirelli Slick Tires (3D gradients + sidewall compound stripes)
  // 4. Coke-Bottle Sculpted Sidepods & Carbon Undercuts
  // 5. Engine Cover Shark Fin & Airbox Intake
  // 6. Halo Cockpit Ring & Driver Helmet Visor
  // 7. Multi-Tier Rear Wing with DRS Flap
  // 8. Flashing FIA Rain Safety Light (Gaussian bloom glow)
  // 9. Titanium Skid Plank Sparks & Slipstream Trails
}
```

---

## 3. Autonomous Quality Checklist
Before declaring any F1 visual complete, critically verify:
- [ ] Is the camera angle low and dramatic (horizon between 0.22 - 0.30)?
- [ ] Are cars large, muscular, and aerodynamic with smooth curves, or do they look like blocky rectangles?
- [ ] Are tires wide slicks with authentic Pirelli color bands and carbon wheel covers?
- [ ] Is there visceral motion feedback (spark physics, camera vibration, road perspective, telemetry HUD)?
- [ ] Does the visual match Hans Zimmer's high-octane soundtrack intensity?
