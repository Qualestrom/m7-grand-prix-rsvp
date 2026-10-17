export type NavAction =
  | 'START'
  | 'STRAIGHT'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'BEAR_LEFT'
  | 'BEAR_RIGHT'
  | 'ENTER_GATE'
  | 'ARRIVE';

export type LandmarkIconType =
  | 'gas'
  | 'school'
  | 'store'
  | 'arch'
  | 'plaza'
  | 'mall'
  | 'sports'
  | 'food'
  | 'gate'
  | 'venue';

export interface RouteLandmark {
  id: string;
  name: string;
  shortName: string;
  t: number; // Normalized progress along 3D spline (0.0 to 1.0)
  cueText: string;
  action: NavAction;
  iconType: LandmarkIconType;
  accentColor: string;
  buildingType?: string;
  side?: 'left' | 'right' | 'center';
  intersectionName?: string;
}

export interface RouteIntersection {
  t: number;
  name: string;
  hasTrafficLight?: boolean;
  branchDirection: 'left' | 'right' | 'both';
  crossStreetName: string;
}

export interface VenueRoute {
  id: 'route-1' | 'route-2' | 'route-3';
  code: string;
  name: string;
  shortTitle: string;
  origin: string;
  via: string;
  distanceKm: number;
  estTimeMin: number;
  color: string;
  landmarks: RouteLandmark[];
  intersections: RouteIntersection[];
  splinePoints: [number, number, number][]; // [x, y, z] in Three.js world units
}

export const VENUE_ROUTES: VenueRoute[] = [
  // ==========================================
  // ROUTE 1: Biñan – Santa Rosa (Old National Highway)
  // Replicating actual 1:1 Manila South Road down to Brgy. Ibaba
  // ==========================================
  {
    id: 'route-1',
    code: 'R1',
    name: 'Biñan – Santa Rosa Route',
    shortTitle: 'Old National Highway',
    origin: 'Biñan Boundary (Caltex Gas Station)',
    via: 'Holy Rosary • Puregold Tagapo • Santa Rosa Arch • Plaza',
    distanceKm: 4.4,
    estTimeMin: 14,
    color: '#E10600', // Ferrari Red
    splinePoints: [
      [-320, 0, -280],  // 0. Caltex Gas Station (Biñan-Santa Rosa Boundary, Manila South Rd)
      [-280, 0, -225],  // 1. Manila South Rd straightaway
      [-235, 0, -165],  // 2. Approaching Holy Rosary College
      [-190, 0, -125],  // 3. Holy Rosary College (Tagapo)
      [-145, 0, -95],   // 4. Tagapo commercial corridor
      [-105, 0, -78],   // 5. Puregold Tagapo Branch
      [-70, 0, -68],    // 6. Manila South Rd x F. Gomez St approach
      [-42, 0, -60],    // 7. Historic Santa Rosa Arch (Arkong Bato - Entry to Bayan)
      [-18, 0, -32],    // 8. F. Gomez St through Poblacion
      [0, 0, 0],        // 9. Santa Rosa Plaza (Plaza Jose Rizal & Parish Church)
      [35, 0, -18],     // 10. F. Gomez St heading into Barangay Ibaba
      [72, 0, -36],     // 11. Barangay Ibaba heritage corridor
      [108, 0, -56],    // 12. F. Gomez St approaching Saint John Subd
      [125, 0, -68],    // 13. Saint John Subdivision Main Gate (Turn right)
      [138, 0, -54],    // 14. Saint John Subd internal residential avenue
      [152, 0, -42],    // 15. Approaching Block 5
      [166, 0, -32],    // 16. Destination: JSH Events Place (Block 5, Lot 27)
    ],
    intersections: [
      { t: 0.23, name: 'Holy Rosary College Crosswalk', hasTrafficLight: false, branchDirection: 'left', crossStreetName: 'HRC CAMPUS DRIVE' },
      { t: 0.40, name: 'Puregold Tagapo Intersection', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'TAGAPO COMMERCIAL RD' },
      { t: 0.58, name: 'Santa Rosa Arch Junction', hasTrafficLight: true, branchDirection: 'both', crossStreetName: 'MANILA SOUTH RD / F. GOMEZ ST' },
      { t: 0.70, name: 'Santa Rosa Plaza Intersection', hasTrafficLight: true, branchDirection: 'both', crossStreetName: 'RIZAL BLVD / ZAVALLA ST' },
      { t: 0.88, name: 'Saint John Subdivision Gate Junction', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'SAINT JOHN SUBDIVISION AVE' },
    ],
    landmarks: [
      {
        id: 'r1-start',
        name: 'Biñan-Santa Rosa Boundary',
        shortName: 'Caltex Gas Station',
        t: 0.0,
        cueText: 'Start at the boundary Caltex gas station heading south on Manila South Road',
        action: 'START',
        iconType: 'gas',
        accentColor: '#FFB800',
        buildingType: 'caltex',
        side: 'right',
      },
      {
        id: 'r1-hrc',
        name: 'Holy Rosary College',
        shortName: 'Holy Rosary College',
        t: 0.23,
        cueText: 'Holy Rosary College campus on your left — maintain straight heading along Manila South Road',
        action: 'STRAIGHT',
        iconType: 'school',
        accentColor: '#00D2BE',
        buildingType: 'school',
        side: 'left',
      },
      {
        id: 'r1-puregold',
        name: 'Puregold Tagapo Branch',
        shortName: 'Puregold Tagapo',
        t: 0.40,
        cueText: 'Puregold Tagapo commercial zone on your right — proceed straight along the highway',
        action: 'STRAIGHT',
        iconType: 'store',
        accentColor: '#00D2BE',
        buildingType: 'puregold',
        side: 'right',
      },
      {
        id: 'r1-arch',
        name: 'Historic Santa Rosa Arch',
        shortName: 'Santa Rosa Arch',
        t: 0.58,
        cueText: 'Pass through the Historic Santa Rosa Arch — Welcome to the Lion City Poblacion (F. Gomez St)',
        action: 'STRAIGHT',
        iconType: 'arch',
        accentColor: '#E10600',
        buildingType: 'arch',
        side: 'center',
      },
      {
        id: 'r1-plaza',
        name: 'Santa Rosa Plaza',
        shortName: 'Santa Rosa Plaza',
        t: 0.70,
        cueText: 'Santa Rosa Plaza & Parish Church — curve around the plaza heading northeast toward Barangay Ibaba',
        action: 'BEAR_RIGHT',
        iconType: 'plaza',
        accentColor: '#FFB800',
        buildingType: 'church',
        side: 'right',
      },
      {
        id: 'r1-gate',
        name: 'Saint John Subdivision Gate',
        shortName: 'Saint John Subd. Gate',
        t: 0.88,
        cueText: 'Turn right through Saint John Subdivision Main Gate into Barangay Ibaba',
        action: 'ENTER_GATE',
        iconType: 'gate',
        accentColor: '#00D2BE',
        buildingType: 'gate',
        side: 'center',
      },
      {
        id: 'r1-venue',
        name: 'JSH Events Place',
        shortName: 'JSH Events Place',
        t: 1.0,
        cueText: 'Arrived at JSH Events Place — Block 5, Lot 27! Welcome to Mattheu Amari\'s 7th Grand Prix!',
        action: 'ARRIVE',
        iconType: 'venue',
        accentColor: '#E10600',
        buildingType: 'venue',
        side: 'center',
      },
    ],
  },

  // ==========================================
  // ROUTE 2: Balibago / Dita to Venue
  // Replicating Balibago Complex -> Tram Plaza -> Garden Villas 3 -> Plaza -> Ibaba
  // ==========================================
  {
    id: 'route-2',
    code: 'R2',
    name: 'Balibago / Dita Route',
    shortTitle: 'Balibago & Tramo Corridor',
    origin: 'Balibago Complex Terminal',
    via: 'Tram Plaza • Garden Villas 3 • Santa Rosa Plaza',
    distanceKm: 5.1,
    estTimeMin: 16,
    color: '#00D2BE', // Petronas Teal
    splinePoints: [
      [-175, 0, 420],   // 0. Balibago Complex Terminal Hub
      [-155, 0, 360],   // 1. Balibago Road / F. Reyes St
      [-130, 0, 290],   // 2. Tram Plaza (Tramo corridor)
      [-105, 0, 225],   // 3. Northbound through Brgy. Dita/Labas
      [-75, 0, 160],    // 4. Road to Garden Villas 3 junction
      [-50, 0, 105],    // 5. Rizal Blvd through Brgy. Malusak
      [-25, 0, 52],     // 6. Approaching town center
      [-8, 0, 18],      // 7. Plaza approach
      [0, 0, 0],        // 8. Santa Rosa Plaza (Curve onto F. Gomez St)
      [35, 0, -18],     // 9. F. Gomez St into Barangay Ibaba
      [72, 0, -36],     // 10. Barangay Ibaba
      [108, 0, -56],    // 11. Approaching Saint John Subd
      [125, 0, -68],    // 12. Saint John Subdivision Main Gate (Turn into subdivision)
      [138, 0, -54],    // 13. Saint John Subd internal avenue
      [152, 0, -42],    // 14. Approaching Block 5
      [166, 0, -32],    // 15. Destination: JSH Events Place (Block 5, Lot 27)
    ],
    intersections: [
      { t: 0.25, name: 'Tram Plaza Intersection', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'TRAMO COMMERCIAL WAY' },
      { t: 0.48, name: 'Road to Garden Villas 3 Junction', hasTrafficLight: false, branchDirection: 'left', crossStreetName: 'GARDEN VILLAS 3 ACCESS RD' },
      { t: 0.72, name: 'Santa Rosa Plaza Intersection', hasTrafficLight: true, branchDirection: 'both', crossStreetName: 'RIZAL BLVD / F. GOMEZ ST' },
      { t: 0.88, name: 'Saint John Subdivision Gate Junction', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'SAINT JOHN SUBDIVISION AVE' },
    ],
    landmarks: [
      {
        id: 'r2-start',
        name: 'Balibago Complex Area',
        shortName: 'Balibago Complex',
        t: 0.0,
        cueText: 'Start at Balibago Commercial & Terminal Hub heading north towards Tramo corridor',
        action: 'START',
        iconType: 'plaza',
        accentColor: '#00D2BE',
        buildingType: 'balibago',
        side: 'left',
      },
      {
        id: 'r2-tram',
        name: 'Tram Plaza (Tramo Corridor)',
        shortName: 'Tram Plaza',
        t: 0.25,
        cueText: 'Approaching Tram Plaza on your right — maintain steady pace along Rizal Boulevard',
        action: 'STRAIGHT',
        iconType: 'store',
        accentColor: '#FFB800',
        buildingType: 'tram',
        side: 'right',
      },
      {
        id: 'r2-garden-villas',
        name: 'Road to Garden Villas 3',
        shortName: 'Garden Villas 3 Road',
        t: 0.48,
        cueText: 'Garden Villas 3 junction on your left — proceed straight along the boulevard towards the City Plaza',
        action: 'STRAIGHT',
        iconType: 'gate',
        accentColor: '#00D2BE',
        buildingType: 'villas',
        side: 'left',
      },
      {
        id: 'r2-plaza',
        name: 'Santa Rosa Plaza',
        shortName: 'Santa Rosa Plaza',
        t: 0.72,
        cueText: 'Santa Rosa Plaza — turn onto F. Gomez Street heading northeast toward Barangay Ibaba',
        action: 'TURN_RIGHT',
        iconType: 'plaza',
        accentColor: '#FFB800',
        buildingType: 'church',
        side: 'right',
      },
      {
        id: 'r2-gate',
        name: 'Saint John Subdivision Gate',
        shortName: 'Saint John Subd. Gate',
        t: 0.88,
        cueText: 'Turn right into Saint John Subdivision Main Gate in Barangay Ibaba',
        action: 'ENTER_GATE',
        iconType: 'gate',
        accentColor: '#00D2BE',
        buildingType: 'gate',
        side: 'center',
      },
      {
        id: 'r2-venue',
        name: 'JSH Events Place',
        shortName: 'JSH Events Place',
        t: 1.0,
        cueText: 'Arrived at JSH Events Place — Block 5, Lot 27! Welcome to Mattheu Amari\'s 7th Grand Prix!',
        action: 'ARRIVE',
        iconType: 'venue',
        accentColor: '#E10600',
        buildingType: 'venue',
        side: 'center',
      },
    ],
  },

  // ==========================================
  // ROUTE 3: Biñan via SM Santa Rosa to Venue
  // Replicating SM City -> Metrogate -> Sports Complex -> Kanluran -> Jollibee -> Plaza -> Ibaba
  // ==========================================
  {
    id: 'route-3',
    code: 'R3',
    name: 'Biñan via SM Santa Rosa',
    shortTitle: 'SM & Kanluran Bypass',
    origin: 'Manila South Road Gateway',
    via: 'SM City • Metrogate • Sports Complex • Kanluran • Jollibee Bayan',
    distanceKm: 6.2,
    estTimeMin: 18,
    color: '#FFB800', // Racing Gold
    splinePoints: [
      [-340, 0, -80],   // 0. Start: Manila South Rd approaching SM City
      [-285, 0, -32],   // 1. SM City Santa Rosa
      [-255, 0, -6],    // 2. Manila South Rd Tagapo corridor
      [-235, 0, 14],    // 3. Metrogate Santa Rosa Intersection (Turn onto Leon Arcillas Blvd)
      [-195, 0, 10],    // 4. Mayor Leon C. Arcillas Boulevard
      [-165, 0, 6],     // 5. Santa Rosa Multi-Purpose Sports Complex (Coliseum Dome)
      [-130, 0, 2],     // 6. Civic center boulevard
      [-105, 0, 0],     // 7. Turn into Barangay Kanluran Road (Zavalla St connector)
      [-75, 0, -12],    // 8. Barangay Kanluran Road
      [-50, 0, -18],    // 9. Brgy. Kanluran towards town proper
      [-35, 0, -22],    // 10. Jollibee Bayan (Rizal Blvd cor Zavalla St)
      [-15, 0, -10],    // 11. Turn onto Rizal Blvd / Plaza approach
      [0, 0, 0],        // 12. Santa Rosa Plaza (Curve onto F. Gomez St)
      [35, 0, -18],     // 13. F. Gomez St into Barangay Ibaba
      [72, 0, -36],     // 14. Barangay Ibaba
      [108, 0, -56],    // 15. Approaching Saint John Subd
      [125, 0, -68],    // 16. Saint John Subdivision Main Gate (Turn into subdivision)
      [138, 0, -54],    // 17. Saint John Subd internal avenue
      [152, 0, -42],    // 18. Approaching Block 5
      [166, 0, -32],    // 19. Destination: JSH Events Place (Block 5, Lot 27)
    ],
    intersections: [
      { t: 0.16, name: 'SM City Santa Rosa Main Entrance', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'SM SANTA ROSA DRIVEWAY' },
      { t: 0.28, name: 'Metrogate 4-Way Intersection', hasTrafficLight: true, branchDirection: 'both', crossStreetName: 'MANILA SOUTH RD / MAYOR LEON ARCILLAS BLVD' },
      { t: 0.42, name: 'Sports Complex Civic Junction', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'SPORTS COMPLEX CIVIC ACCESS' },
      { t: 0.55, name: 'Barangay Kanluran Road Junction', hasTrafficLight: true, branchDirection: 'left', crossStreetName: 'LEON ARCILLAS BLVD / ZAVALLA ST' },
      { t: 0.67, name: 'Jollibee Bayan Corner Intersection', hasTrafficLight: true, branchDirection: 'both', crossStreetName: 'RIZAL BLVD / ZAVALLA ST' },
      { t: 0.76, name: 'Santa Rosa Plaza Intersection', hasTrafficLight: true, branchDirection: 'both', crossStreetName: 'RIZAL BLVD / F. GOMEZ ST' },
      { t: 0.90, name: 'Saint John Subdivision Gate Junction', hasTrafficLight: false, branchDirection: 'right', crossStreetName: 'SAINT JOHN SUBDIVISION AVE' },
    ],
    landmarks: [
      {
        id: 'r3-start',
        name: 'Manila South Road Gateway',
        shortName: 'National Highway',
        t: 0.0,
        cueText: 'Start on Manila South Road heading south approaching SM City Santa Rosa',
        action: 'START',
        iconType: 'gate',
        accentColor: '#FFB800',
        buildingType: 'technopark',
        side: 'left',
      },
      {
        id: 'r3-sm',
        name: 'SM City Santa Rosa',
        shortName: 'SM City Santa Rosa',
        t: 0.16,
        cueText: 'SM City Santa Rosa on your right — iconic regional mega-mall landmark',
        action: 'STRAIGHT',
        iconType: 'mall',
        accentColor: '#00D2BE',
        buildingType: 'sm_mall',
        side: 'right',
      },
      {
        id: 'r3-metrogate',
        name: 'Metrogate Intersection',
        shortName: 'Metrogate Intersection',
        t: 0.28,
        cueText: 'Turn at Metrogate Intersection onto Mayor Leon C. Arcillas Boulevard towards the Sports Complex',
        action: 'TURN_LEFT',
        iconType: 'gate',
        accentColor: '#E10600',
        buildingType: 'metrogate',
        side: 'left',
      },
      {
        id: 'r3-complex',
        name: 'Santa Rosa Multi-Purpose Complex',
        shortName: 'Sports Complex',
        t: 0.42,
        cueText: 'Santa Rosa Multi-Purpose Sports Complex on your right — continue along the civic boulevard',
        action: 'STRAIGHT',
        iconType: 'sports',
        accentColor: '#00D2BE',
        buildingType: 'sports_complex',
        side: 'right',
      },
      {
        id: 'r3-kanluran',
        name: 'Barangay Kanluran Road',
        shortName: 'Brgy. Kanluran Road',
        t: 0.55,
        cueText: 'Turn into Barangay Kanluran Road (Zavalla Street connector) heading toward the town proper',
        action: 'TURN_LEFT',
        iconType: 'store',
        accentColor: '#FFB800',
        buildingType: 'kanluran',
        side: 'left',
      },
      {
        id: 'r3-jollibee',
        name: 'Jollibee Bayan',
        shortName: 'Jollibee Bayan',
        t: 0.67,
        cueText: 'Jollibee Bayan at the corner of Rizal Blvd & Zavalla St — turn right toward Santa Rosa Plaza',
        action: 'TURN_RIGHT',
        iconType: 'food',
        accentColor: '#E10600',
        buildingType: 'jollibee',
        side: 'right',
      },
      {
        id: 'r3-plaza',
        name: 'Santa Rosa Plaza',
        shortName: 'Santa Rosa Plaza',
        t: 0.76,
        cueText: 'Santa Rosa Plaza & Parish Church — continue straight onto F. Gomez Street into Barangay Ibaba',
        action: 'STRAIGHT',
        iconType: 'plaza',
        accentColor: '#FFB800',
        buildingType: 'church',
        side: 'right',
      },
      {
        id: 'r3-gate',
        name: 'Saint John Subdivision Gate',
        shortName: 'Saint John Subd. Gate',
        t: 0.90,
        cueText: 'Turn right through Saint John Subdivision Main Gate in Barangay Ibaba',
        action: 'ENTER_GATE',
        iconType: 'gate',
        accentColor: '#00D2BE',
        buildingType: 'gate',
        side: 'center',
      },
      {
        id: 'r3-venue',
        name: 'JSH Events Place',
        shortName: 'JSH Events Place',
        t: 1.0,
        cueText: 'Arrived at JSH Events Place — Block 5, Lot 27! Welcome to Mattheu Amari\'s 7th Grand Prix!',
        action: 'ARRIVE',
        iconType: 'venue',
        accentColor: '#E10600',
        buildingType: 'venue',
        side: 'center',
      },
    ],
  },
];
