export interface CircuitSector {
  id: string;
  name: string;
  code: string;
  landmark: string;
  distance: string;
  speed: string;
  status: 'GREEN' | 'PURPLE' | 'YELLOW';
}

export interface EventConfig {
  celebrantName: string;
  celebrantAge: number;
  shortBrand: string;
  eventTitle: string;
  subTitle: string;
  season: string;
  round: string;
  date: string;
  time: string;
  lightsOutTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  wazeUrl: string;
  adminPasscode: string;
  weather: {
    condition: string;
    airTemp: string;
    trackTemp: string;
    humidity: string;
    rainProbability: string;
  };
  raceStats: {
    laps: number;
    circuitLength: string;
    drsZones: number;
    lapRecord: string;
  };
  sectors: CircuitSector[];
}

export const EVENT_CONFIG: EventConfig = {
  celebrantName: "Mattheu Amari",
  celebrantAge: 7,
  shortBrand: "M7",
  eventTitle: "Mattheu Amari's 7th Grand Prix",
  subTitle: "FORMULA 7 WORLD CHAMPIONSHIP",
  season: "2026 SEASON",
  round: "ROUND 07",
  date: "November 22, 2026",
  time: "2:00 PM",
  lightsOutTime: "2:00 PM",
  venueName: "JSH Events Place",
  venueAddress: "Santa Rosa, Laguna",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=JSH+Events+Place+Santa+Rosa+Laguna",
  wazeUrl: "https://waze.com/ul?q=JSH%20Events%20Place%20Santa%20Rosa%20Laguna",
  adminPasscode: "M7PITWALL",
  weather: {
    condition: "Sunny & High Octane",
    airTemp: "28°C",
    trackTemp: "38°C",
    humidity: "45%",
    rainProbability: "0%",
  },
  raceStats: {
    laps: 7,
    circuitLength: "3.777 KM",
    drsZones: 2,
    lapRecord: "1:07.777 (M. AMARI)",
  },
  sectors: [
    {
      id: "sector-1",
      name: "Sector 1: The Fast Sweeper",
      code: "S1",
      landmark: "Starting Grid & Champions Gateway",
      distance: "1.2 KM",
      speed: "315 KM/H",
      status: "PURPLE",
    },
    {
      id: "sector-2",
      name: "Sector 2: The Chicane of Joy",
      code: "S2",
      landmark: "Loot Bag Chicane & Game Arena",
      distance: "2.4 KM",
      speed: "280 KM/H",
      status: "PURPLE",
    },
    {
      id: "sector-3",
      name: "Finish Line: Grand Venue",
      code: "S3",
      landmark: "The Grand Paddock & Cake Podium",
      distance: "3.7 KM",
      speed: "CHECKERED FLAG",
      status: "GREEN",
    },
  ],
};
