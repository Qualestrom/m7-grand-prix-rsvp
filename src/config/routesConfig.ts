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
  splinePoints: [number, number, number][]; // [x, y, z] in Three.js world units
}

export const VENUE_ROUTES: VenueRoute[] = [
  // ==========================================
  // ROUTE 1: Biñan – Santa Rosa (Old National Highway)
  // ==========================================
  {
    id: 'route-1',
    code: 'R1',
    name: 'Biñan – Santa Rosa Route',
    shortTitle: 'Old National Highway',
    origin: 'Biñan Boundary (Caltex Gas Station)',
    via: 'Holy Rosary • Puregold Tagapo • Santa Rosa Arch',
    distanceKm: 4.4,
    estTimeMin: 14,
    color: '#E10600', // Ferrari Red
    splinePoints: [
      [-190, 0, -130], // Start at Caltex Boundary
      [-160, 0, -100],
      [-120, 0, -65],  // Holy Rosary College
      [-80, 0, -35],
      [-40, 0, -5],    // Puregold Tagapo
      [-5, 0, 25],
      [35, 0, 60],     // Santa Rosa Arch
      [70, 0, 100],
      [100, 0, 140],   // Santa Rosa Plaza
      [130, 0, 170],   // Turn to Brgy. Ibaba
      [160, 0, 200],   // Saint John Subdivision Gate
      [185, 0, 225],   // JSH Events Place
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
      },
      {
        id: 'r1-hrc',
        name: 'Holy Rosary College',
        shortName: 'Holy Rosary College',
        t: 0.22,
        cueText: 'Holy Rosary College campus on your left — maintain straight heading',
        action: 'STRAIGHT',
        iconType: 'school',
        accentColor: '#00D2BE',
      },
      {
        id: 'r1-puregold',
        name: 'Puregold Tagapo Branch',
        shortName: 'Puregold Tagapo',
        t: 0.42,
        cueText: 'Puregold Tagapo commercial zone — check for upcoming highway crossing',
        action: 'STRAIGHT',
        iconType: 'store',
        accentColor: '#00D2BE',
      },
      {
        id: 'r1-arch',
        name: 'Historic Santa Rosa Arch',
        shortName: 'Santa Rosa Arch',
        t: 0.62,
        cueText: 'Passing under the historic Santa Rosa Arch — Welcome to the Lion City',
        action: 'STRAIGHT',
        iconType: 'arch',
        accentColor: '#E10600',
      },
      {
        id: 'r1-plaza',
        name: 'Santa Rosa Plaza',
        shortName: 'Santa Rosa Plaza',
        t: 0.78,
        cueText: 'Santa Rosa Plaza & Parish Church — prepare to turn into Barangay Ibaba',
        action: 'BEAR_RIGHT',
        iconType: 'plaza',
        accentColor: '#FFB800',
      },
      {
        id: 'r1-gate',
        name: 'Saint John Subdivision Gate',
        shortName: 'Saint John Subd. Gate',
        t: 0.92,
        cueText: 'Turn into Saint John Subdivision Main Gate in Barangay Ibaba',
        action: 'ENTER_GATE',
        iconType: 'gate',
        accentColor: '#00D2BE',
      },
      {
        id: 'r1-venue',
        name: 'JSH Events Place',
        shortName: 'JSH Events Place',
        t: 1.0,
        cueText: 'Arrived at JSH Events Place — Block 5, Lot 27! Welcome to the Grand Prix!',
        action: 'ARRIVE',
        iconType: 'venue',
        accentColor: '#E10600',
      },
    ],
  },

  // ==========================================
  // ROUTE 2: Balibago / Dita to Venue
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
      [-150, 0, 270],  // Balibago Complex
      [-110, 0, 245],
      [-70, 0, 220],   // Tram Plaza
      [-35, 0, 205],
      [5, 0, 190],     // Road to Garden Villas 3
      [50, 0, 165],
      [100, 0, 140],   // Santa Rosa Plaza
      [130, 0, 170],   // Turn to Brgy. Ibaba
      [160, 0, 200],   // Saint John Subdivision Gate
      [185, 0, 225],   // JSH Events Place
    ],
    landmarks: [
      {
        id: 'r2-start',
        name: 'Balibago Complex Area',
        shortName: 'Balibago Complex',
        t: 0.0,
        cueText: 'Start at Balibago Commercial & Terminal Hub heading towards Tramo corridor',
        action: 'START',
        iconType: 'plaza',
        accentColor: '#00D2BE',
      },
      {
        id: 'r2-tram',
        name: 'Tram Plaza (Tramo Corridor)',
        shortName: 'Tram Plaza',
        t: 0.28,
        cueText: 'Approaching Tram Plaza — maintain steady pace along main arterial',
        action: 'STRAIGHT',
        iconType: 'store',
        accentColor: '#FFB800',
      },
      {
        id: 'r2-garden-villas',
        name: 'Road to Garden Villas 3',
        shortName: 'Garden Villas 3 Road',
        t: 0.52,
        cueText: 'Garden Villas 3 junction — proceed straight towards the City Center',
        action: 'STRAIGHT',
        iconType: 'gate',
        accentColor: '#00D2BE',
      },
      {
        id: 'r2-plaza',
        name: 'Santa Rosa Plaza',
        shortName: 'Santa Rosa Plaza',
        t: 0.76,
        cueText: 'Santa Rosa Plaza — prepare to make the turn toward Barangay Ibaba',
        action: 'TURN_RIGHT',
        iconType: 'plaza',
        accentColor: '#FFB800',
      },
      {
        id: 'r2-gate',
        name: 'Saint John Subdivision Gate',
        shortName: 'Saint John Subd. Gate',
        t: 0.92,
        cueText: 'Turn into Saint John Subdivision Main Gate in Barangay Ibaba',
        action: 'ENTER_GATE',
        iconType: 'gate',
        accentColor: '#00D2BE',
      },
      {
        id: 'r2-venue',
        name: 'JSH Events Place',
        shortName: 'JSH Events Place',
        t: 1.0,
        cueText: 'Arrived at JSH Events Place — Block 5, Lot 27! Welcome to the Grand Prix!',
        action: 'ARRIVE',
        iconType: 'venue',
        accentColor: '#E10600',
      },
    ],
  },

  // ==========================================
  // ROUTE 3: Biñan via SM Santa Rosa to Venue
  // ==========================================
  {
    id: 'route-3',
    code: 'R3',
    name: 'Biñan via SM Santa Rosa',
    shortTitle: 'SM & Kanluran Bypass',
    origin: 'Laguna Technopark / San Antonio Gateway',
    via: 'SM City • Metrogate • Sports Complex • Kanluran • Jollibee Bayan',
    distanceKm: 6.2,
    estTimeMin: 18,
    color: '#FFB800', // Racing Gold
    splinePoints: [
      [-230, 0, -25],  // Technopark / San Antonio Gateway
      [-185, 0, 5],
      [-140, 0, 35],   // SM City Santa Rosa
      [-100, 0, 55],
      [-65, 0, 75],    // Metrogate Intersection
      [-20, 0, 95],    // Santa Rosa Multi-Purpose Complex
      [25, 0, 115],    // Barangay Kanluran Road
      [65, 0, 130],    // Jollibee Bayan
      [100, 0, 140],   // Santa Rosa Plaza
      [130, 0, 170],   // Turn to Brgy. Ibaba
      [160, 0, 200],   // Saint John Subdivision Gate
      [185, 0, 225],   // JSH Events Place
    ],
    landmarks: [
      {
        id: 'r3-start',
        name: 'Laguna Technopark / San Antonio',
        shortName: 'Technopark Gateway',
        t: 0.0,
        cueText: 'Start from San Antonio gateway corridor approaching SM City Santa Rosa',
        action: 'START',
        iconType: 'gate',
        accentColor: '#FFB800',
      },
      {
        id: 'r3-sm',
        name: 'SM City Santa Rosa',
        shortName: 'SM City Santa Rosa',
        t: 0.20,
        cueText: 'SM City Santa Rosa on your right — iconic regional mega-mall landmark',
        action: 'STRAIGHT',
        iconType: 'mall',
        accentColor: '#00D2BE',
      },
      {
        id: 'r3-metrogate',
        name: 'Metrogate Intersection',
        shortName: 'Metrogate Intersection',
        t: 0.36,
        cueText: 'Turn at Metrogate Intersection towards Santa Rosa Multi-Purpose Complex',
        action: 'TURN_LEFT',
        iconType: 'gate',
        accentColor: '#E10600',
      },
      {
        id: 'r3-complex',
        name: 'Santa Rosa Multi-Purpose Complex',
        shortName: 'Sports Complex',
        t: 0.50,
        cueText: 'Passing Santa Rosa Multi-Purpose Sports Complex on your flank',
        action: 'STRAIGHT',
        iconType: 'sports',
        accentColor: '#00D2BE',
      },
      {
        id: 'r3-kanluran',
        name: 'Barangay Kanluran Road',
        shortName: 'Brgy. Kanluran Road',
        t: 0.62,
        cueText: 'Proceed through Barangay Kanluran arterial connecting to town proper',
        action: 'STRAIGHT',
        iconType: 'store',
        accentColor: '#FFB800',
      },
      {
        id: 'r3-jollibee',
        name: 'Jollibee Bayan',
        shortName: 'Jollibee Bayan',
        t: 0.72,
        cueText: 'Jollibee Bayan landmark ahead — entering Santa Rosa historic town core',
        action: 'STRAIGHT',
        iconType: 'food',
        accentColor: '#E10600',
      },
      {
        id: 'r3-plaza',
        name: 'Santa Rosa Plaza',
        shortName: 'Santa Rosa Plaza',
        t: 0.80,
        cueText: 'Santa Rosa Plaza — prepare to make the turn into Barangay Ibaba',
        action: 'BEAR_RIGHT',
        iconType: 'plaza',
        accentColor: '#FFB800',
      },
      {
        id: 'r3-gate',
        name: 'Saint John Subdivision Gate',
        shortName: 'Saint John Subd. Gate',
        t: 0.93,
        cueText: 'Turn into Saint John Subdivision Main Gate in Barangay Ibaba',
        action: 'ENTER_GATE',
        iconType: 'gate',
        accentColor: '#00D2BE',
      },
      {
        id: 'r3-venue',
        name: 'JSH Events Place',
        shortName: 'JSH Events Place',
        t: 1.0,
        cueText: 'Arrived at JSH Events Place — Block 5, Lot 27! Welcome to the Grand Prix!',
        action: 'ARRIVE',
        iconType: 'venue',
        accentColor: '#E10600',
      },
    ],
  },
];
