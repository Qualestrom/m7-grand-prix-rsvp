# 🏎️ M7 GRAND PRIX
### Formula 1 Broadcast-Style 7th Birthday Invitation, 3D Venue Circuit Guide & Pit Wall Admin

An interactive, 1:1 Formula 1 TV broadcast-replica celebration experience for **Mattheu Amari's 7th Birthday**. 

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **React Three Fiber (WebGL / Three.js)**, **Framer Motion**, and **Supabase / LocalStorage**.

---

## 🏁 Experience Architecture (5 Core Screens)

### 1. Starting Gantry & Telemetry Loader (`<TelemetryLoader />`)
* **Custom M7 SVG Logo:** Two sweeping aerodynamic ribbons forming an italicized "M" with a detached speed-mark "7" in the slipstream, drawn with stroke-dashoffset animations.
* **Official 5-Red-Light Gantry:** 5 LED pods illuminate sequentially (1... 2... 3... 4... 5...) with synthesized Web Audio beeps, followed by **"LIGHTS OUT AND AWAY WE GO!"** and synthesized engine revs.
* **Live Telemetry Gauges:** Live RPM simulation, gear indicator, and tire-compound indicators (Soft Red, Medium Yellow, Hard White).

### 2. "Paddock Pass" Event Briefing (`<PaddockPass />`)
* Styled like an official F1 Grand Prix VIP Accreditation Pass with holographic slot and alternating red-and-white kerb borders.
* Displays **Mattheu Amari's Pole Position**, Round 07 schedule, lights-out timetable, and track weather telemetry ("100% Track Fun").
* **Two Primary CTA Buttons:**
  1. `CONFIRM GRID SLOT (I'LL GO)` — High-contrast F1 Red button routing to Driver Registration.
  2. `BOX / DNF (CAN'T MAKE IT)` — Sleek dark button routing to Regrets notice.

### 3. Driver & Pit Crew Registration (`<DriverRegistration />`)
* **Primary Driver Name** input.
* **Relationship Selector Pills:** `Family / Relative`, `Ninong / Ninang`, `Schoolmate / Friend`, `Family Friend`.
* **Dynamic "Pit Crew" (+1s) List:** Add any number of companions, each with full name and a toggleable **`Kid` / `Adult`** tag for accurate catering & loot bag counts.
* **Corner Headcount Badge:** Automatically calculates live totals (`Driver + N Companions = Total Headcount`).
* **Birthday Pit Radio Message:** Optional heartfelt radio message sent to Mattheu Amari.
* **Celebratory Confetti:** Triggers F1 color confetti cannon upon grid confirmation.

### 4. Stylized 3D Racing Circuit Venue Reveal (`<CircuitGuide3D />`)
* **Procedural 3D Track:** Extruded asphalt track generated from a 3D `CatmullRomCurve3` spline with glowing cyan racing lines and 3D kerb borders.
* **Low-Poly M7 F1 Car:** Hand-modeled Three.js race car with front wings, nose cone, cockpit with halo, sidepods, rear wing with DRS flap, and 4 rotating wheels with red Pirelli-style sidewalls.
* **Animated Flyover Chase Camera:** Smoothly follows the M7 car along the circuit past floating 3D broadcast callouts (**Sector 1**, **Sector 2**) and stops under a 3D **Checkered Flag Arch** at the venue podium.
* **Interactive Controls:** Toggle between cinematic **"Replay Flyover"** and **"Free Orbit View"** (`OrbitControls` for pinch/rotate/zoom).
* **Navigation Links:** Instant one-tap access to **Google Maps** and **Waze**, plus a **"Download Paddock Pass Summary"** text card.

### 5. `/admin` — The "Pit Wall" Live Telemetry Dashboard (`<PitWallAdmin />`)
* **Encrypted Passcode Gate:** Protected by passcode `M7PITWALL` (configurable in `eventConfig.ts`).
* **4 Telemetry KPI Cards:**
  1. *Total Confirmed Headcount* (All primary drivers + companions).
  2. *Kids vs. Adults Breakdown* (Catering and loot bag tracker).
  3. *Grid Entries vs. DNF* (Confirmed ratio).
  4. *Relationship Breakdown* (Family, Ninong/Ninang, Schoolmate, Friends).
* **Searchable & Filterable Driver Roster:** Filter by `All`, `Confirmed Grid`, or `DNF`; search by any name or note.
* **Export Telemetry to CSV:** Instant one-click spreadsheet download formatted for party check-in.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm**

### Installation
```bash
# Clone the repository
git clone https://github.com/Qualestrom/m7-grand-prix-rsvp.git
cd m7-grand-prix-rsvp

# Install dependencies
npm install --legacy-peer-deps

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## ⚙️ Configuration & Customization

All event details can be changed in **`src/config/eventConfig.ts`**:

```typescript
export const EVENT_CONFIG = {
  celebrantName: "Mattheu Amari",
  celebrantAge: 7,
  shortBrand: "M7",
  eventTitle: "Mattheu Amari's 7th Grand Prix",
  date: "Saturday, November 21, 2026",
  time: "3:00 PM - 7:00 PM PHT",
  lightsOutTime: "15:00 HRS (LIGHTS OUT)",
  venueName: "The Grand Paddock Club & Circuit Ballroom",
  venueAddress: "77 Speedline Boulevard, Bonifacio Global City, Metro Manila, Philippines",
  googleMapsUrl: "https://maps.google.com/?q=Bonifacio+Global+City+Taguig",
  wazeUrl: "https://waze.com/ul?q=Bonifacio+Global+City+Taguig",
  adminPasscode: "M7PITWALL", // Passcode for /admin
  // ...
};
```

---

## 🗄️ Supabase Backend Setup (Optional)

The application works **100% locally out-of-the-box** using automatic `localStorage` persistence. To sync RSVPs across devices using Supabase:

1. Create a project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the script in **`supabase/schema.sql`**.
3. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart `npm run dev`. The app will now automatically transmit and read RSVPs directly from your Supabase PostgreSQL database!

---

## 📱 Mobile Responsiveness

Optimized for mobile portrait viewports (Messenger, Viber, WhatsApp in-app browsers):
* Touch-friendly buttons and inputs (minimum 44px tap targets).
* Responsive 3D Canvas with hardware acceleration.
* OpenGraph meta tags for rich social preview cards.

---

## 🏗️ Production Build

```bash
# Verify TypeScript & compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

*“Lights out and away we go for Mattheu Amari's 7th Grand Prix!”* 🏁🏎️
