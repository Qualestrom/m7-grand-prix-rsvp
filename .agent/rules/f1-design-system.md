# Formula 1 Broadcast Design System (F1 TV & M7 Grand Prix)

## Visual & Design Specification
- **Color Palette:**
  - F1 Racing Red: `#E10600`
  - Carbon Black (Background): `#15151E`
  - Asphalt Dark (Panels/Cards): `#1F1F27`
  - Telemetry Cyan/Green: `#00D2BE`
  - DRS Gold/Yellow: `#FFB800`
  - Pure Kerb White: `#FFFFFF`
  - Pit Lane Gray: `#38383F`
  - Subtle Muted Gray: `#949498`

- **Typography:**
  - Headers: `Titillium Web` (weights 600, 700, 900 italic) and `Orbitron` for authentic F1 telemetry & broadcast styling.
  - Telemetry, sector timing, timers, RPM counters: `JetBrains Mono` or tabular monospace.

- **UI Motifs & Shapes:**
  - Angled chamfered corners (`clip-path: polygon(...)` or skewed borders) mimicking official F1 TV lower-thirds and timing towers.
  - Alternating red-and-white kerb accents along card borders / sector bars (`repeating-linear-gradient(...)`).
  - Carbon-fiber CSS pattern background with subtle radial vignette.
  - Glowing telemetry neon accents (`box-shadow: 0 0 15px rgba(0, 210, 190, 0.4)`).

- **Custom M7 Logo:**
  - Scalable SVG inspired by the modern Formula 1 logo: two sweeping aerodynamic diagonal ribbons forming an italicized "M" on the left, with a sharp, detached racing speed-mark "7" tucked into the slipstream on the right.

- **Three.js / React Three Fiber Guidelines:**
  - Stylized low-poly F1 car with front wing, nose cone, cockpit + halo, sidepods, rear wing, and 4 wheels with red soft compound sidewalls.
  - Procedural `CatmullRomCurve3` track with asphalt ribbon, glowing racing line, and red/white kerbs at turns.
  - Smooth camera interpolation along the spline with toggleable `OrbitControls` for guest exploration.

- **Framer Motion Rules:**
  - Spring-based smooth transitions for telemetry bars, modal entries, and start gantry lights.
  - SVG stroke-dashoffset animations for the M7 logo and racing circuits.
