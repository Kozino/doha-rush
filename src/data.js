// Real place and street names; the circuit shapes themselves are artistic interpretations.
export const ROUTES = [
  {
    id: 'lusail', district: 'LUSAIL', name: 'LUSAIL LIGHTS', short: 'LUSAIL',
    tagline: 'The city of the future, after dark.',
    description: 'Sweep past the golden stadium, the crescent towers and a waterfront lit like a constellation.',
    number: '01', laps: 3, time: 'sunset', accent: '#e4b96a',
    icon: '✦',
    highlights: ['Lusail Stadium', 'Katara Towers', 'Place Vendôme', 'Marina Promenade'],
    streets: [
      'Lusail Boulevard', 'Marina East Street', 'Lusail Street', 'Al Khor Coastal Road',
      'Al Tarfa Street', 'Lusail Expressway', 'Marina East Street', 'Lusail Boulevard'
    ],
    points: [
      [-44, 137], [18, 137], [80, 113], [127, 70], [150, 14],
      [145, -50], [106, -108], [45, -140], [-28, -142],
      [-97, -112], [-141, -61], [-150, 0], [-128, 61], [-88, 111]
    ],
  },
  {
    id: 'pearl', district: 'THE PEARL', name: 'PEARL ISLAND RUN', short: 'THE PEARL',
    tagline: 'A lap around the Arabian Riviera.',
    description: 'Race the island boulevard beside pastel canals, marina yachts and the warm Gulf breeze.',
    number: '02', laps: 2, time: 'day', accent: '#63d1cb',
    icon: '◈',
    highlights: ['Porto Arabia', 'Qanat Quartier', 'Medina Centrale', 'Viva Bahriya'],
    streets: [
      'Pearl Boulevard', 'Porto Arabia Drive', 'Madina Avenue', 'Qanat Quartier Drive',
      'Corso Venezia', 'Viva Bahriya Drive', 'Costa Malaz Drive', 'Pearl Boulevard'
    ],
    points: [
      [-34, 128], [27, 133], [84, 100], [127, 55], [137, -5],
      [116, -58], [75, -104], [12, -134], [-53, -127],
      [-112, -91], [-142, -34], [-138, 30], [-97, 92]
    ],
  },
  {
    id: 'westbay', district: 'WEST BAY', name: 'WEST BAY NIGHTS', short: 'WEST BAY',
    tagline: 'The skyline is your starting line.',
    description: 'Chase the Corniche at dusk, carving a line beneath Doha’s most recognizable skyline.',
    number: '03', laps: 2, time: 'dusk', accent: '#ff8b82',
    icon: '◇',
    highlights: ['Doha Tower', 'Tornado Tower', 'Sheraton Grand', 'Doha Corniche'],
    streets: [
      'Al Corniche Street', 'Al Funduq Street', 'Majlis Al Taawon Street', 'Omar Al Mukhtar Street',
      'Diplomatic Street', 'Conference Centre Street', 'Al Markhiya Street', 'Al Corniche Street'
    ],
    points: [
      [-53, 131], [17, 135], [83, 104], [129, 58], [143, -2],
      [120, -71], [66, -123], [-5, -145], [-76, -132],
      [-131, -92], [-157, -29], [-143, 39], [-103, 98]
    ],
  }
];

export const CARS = [
  {
    name: 'DESERT FALCON', type: 'RALLY / ALL-WHEEL DRIVE', color: '#1b8ef5',
    number: '07', topSpeed: 49, acceleration: 21, braking: 28, handling: 2.15, grip: 7.8,
    stats: [82, 91, 85, 86], description: 'Agile through every corner. Born for the boulevard.',
    length: 4.4, width: 2.05, wing: true,
  },
  {
    name: 'PEARL GT', type: 'GRAND TOURER / REAR-WHEEL DRIVE', color: '#f2eee4',
    number: '22', topSpeed: 54, acceleration: 18.5, braking: 27, handling: 1.92, grip: 6.8,
    stats: [92, 79, 78, 84], description: 'Quiet confidence. An elegant line through the city.',
    length: 4.7, width: 2.1, wing: false,
  },
  {
    name: 'DUNE PHANTOM', type: 'TRACK SPECIAL / REAR-WHEEL DRIVE', color: '#b21f4d',
    number: '99', topSpeed: 61, acceleration: 22.5, braking: 31, handling: 1.75, grip: 6.1,
    stats: [100, 96, 70, 95], description: 'Unapologetically fast. Make the night yours.',
    length: 4.85, width: 2.16, wing: true,
  },
];

export const DRIVERS = ['YOU', 'A. AL-MARRI', 'N. AL-KUWARI', 'S. AL-THANI'];
export const CAMERA_NAMES = ['CHASE', 'WIDE', 'HOOD', 'COCKPIT', 'CINEMATIC'];

export const TIMES = {
  day: {
    label: 'DAYLIGHT', top: '#74b9df', horizon: '#eddfc7', fog: 0xcfd8d3,
    sun: 0xffefce, sunIntensity: 2.6, ambient: 1.65, exposure: 1.25,
    light: [160, 210, -90], night: 0,
  },
  sunset: {
    label: 'GOLDEN HOUR', top: '#6e9cba', horizon: '#f5b78e', fog: 0xd1a792,
    sun: 0xffba7b, sunIntensity: 2.5, ambient: 1.42, exposure: 1.19,
    light: [-190, 100, -90], night: 0.2,
  },
  dusk: {
    label: 'BLUE HOUR', top: '#23385a', horizon: '#b57380', fog: 0x536075,
    sun: 0xff9c82, sunIntensity: 1.55, ambient: 0.95, exposure: 1.18,
    light: [-150, 65, 75], night: 0.75,
  },
  night: {
    label: 'MIDNIGHT', top: '#08132e', horizon: '#253b59', fog: 0x1b2c44,
    sun: 0xb9c9ff, sunIntensity: 0.63, ambient: 0.67, exposure: 1.43,
    light: [80, 130, 110], night: 1,
  },
};
