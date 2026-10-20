// Genuine place/street names in a deliberately fictional, closed-course game world.
// The roads are designed for play, NOT a real road map or driving directions.
export const ROUTES = [
  {
    id: 'grand', district: 'DOHA', name: 'THE DOHA GRAND TOUR', short: 'GRAND TOUR',
    tagline: 'One city. Every side of it.',
    description: 'A long cross-city showcase: skyline, marina, souq, museums and the city of the future.',
    number: '01', laps: 1, time: 'sunset', accent: '#fbc286', icon: '✳', large: true,
    coastline: 515, setting: 'coast',
    highlights: ['West Bay', 'The Pearl', 'Lusail Stadium', 'Katara', 'Souq Waqif', 'MIA', 'Mina District', 'Aspire'],
    streets: ['Al Corniche Street', 'Lusail Expressway', 'Pearl Boulevard', 'Lusail Boulevard',
      'Al Waab Street', 'Jassim Bin Mohammed Street', 'Grand Hamad Street', 'Abdulla Bin Jassim Street'],
    points: [
      [-380, 320], [-220, 365], [-50, 377], [115, 363], [285, 325], [399, 249],
      [453, 123], [447, -39], [399, -180], [300, -284], [139, -337],
      [-36, -341], [-213, -307], [-371, -238], [-468, -104], [-492, 52], [-463, 213]
    ],
    landmarks: [
      { t: .032, side: 1, type: 'skyline', name: 'WEST BAY SKYLINE' },
      { t: .132, side: 1, type: 'katara', name: 'KATARA CULTURAL VILLAGE' },
      { t: .225, side: 1, type: 'pearl', name: 'THE PEARL ISLAND' },
      { t: .318, side: 1, type: 'stadium', name: 'LUSAIL STADIUM' },
      { t: .442, side: 1, type: 'aspire', name: 'THE TORCH · ASPIRE' },
      { t: .556, side: 1, type: 'msheireb', name: 'MSHEIREB DOWNTOWN' },
      { t: .649, side: 1, type: 'souq', name: 'SOUQ WAQIF' },
      { t: .737, side: 1, type: 'national', name: 'NATIONAL MUSEUM' },
      { t: .827, side: 1, type: 'mina', name: 'MINA DISTRICT' },
      { t: .925, side: 1, type: 'mia', name: 'MUSEUM OF ISLAMIC ART' },
    ]
  },
  {
    id: 'lusail', district: 'LUSAIL', name: 'LUSAIL LIGHTS', short: 'LUSAIL',
    tagline: 'The city of the future, after dark.',
    description: 'Sweep past the golden stadium, the crescent towers and a waterfront lit like a constellation.',
    number: '02', laps: 3, time: 'sunset', accent: '#e4b96a', icon: '✦',
    highlights: ['Lusail Stadium', 'Katara Towers', 'Place Vendôme', 'Marina Promenade'],
    streets: ['Lusail Boulevard', 'Marina East Street', 'Lusail Street', 'Al Khor Coastal Road',
      'Al Tarfa Street', 'Lusail Expressway', 'Marina East Street', 'Lusail Boulevard'],
    points: [
      [-44, 137], [18, 137], [80, 113], [127, 70], [150, 14], [145, -50],
      [106, -108], [45, -140], [-28, -142], [-97, -112], [-141, -61],
      [-150, 0], [-128, 61], [-88, 111]
    ],
  },
  {
    id: 'pearl', district: 'THE PEARL', name: 'PEARL ISLAND RUN', short: 'THE PEARL',
    tagline: 'A lap around the Arabian Riviera.',
    description: 'Race the island boulevard beside pastel canals, marina yachts and the warm Gulf breeze.',
    number: '03', laps: 2, time: 'day', accent: '#63d1cb', icon: '◈',
    highlights: ['Porto Arabia', 'Qanat Quartier', 'Medina Centrale', 'Viva Bahriya'],
    streets: ['Pearl Boulevard', 'Porto Arabia Drive', 'Madina Avenue', 'Qanat Quartier Drive',
      'Corso Venezia', 'Viva Bahriya Drive', 'Costa Malaz Drive', 'Pearl Boulevard'],
    points: [
      [-34, 128], [27, 133], [84, 100], [127, 55], [137, -5], [116, -58],
      [75, -104], [12, -134], [-53, -127], [-112, -91], [-142, -34], [-138, 30], [-97, 92]
    ],
  },
  {
    id: 'westbay', district: 'WEST BAY', name: 'WEST BAY NIGHTS', short: 'WEST BAY',
    tagline: 'The skyline is your starting line.',
    description: 'Chase the Corniche at dusk, carving a line beneath Doha’s most recognisable skyline.',
    number: '04', laps: 2, time: 'dusk', accent: '#ff8b82', icon: '◇',
    highlights: ['Doha Tower', 'Tornado Tower', 'Sheraton Grand', 'Doha Corniche'],
    streets: ['Al Corniche Street', 'Al Funduq Street', 'Majlis Al Taawon Street', 'Omar Al Mukhtar Street',
      'Diplomatic Street', 'Conference Centre Street', 'Al Markhiya Street', 'Al Corniche Street'],
    points: [
      [-53, 131], [17, 135], [83, 104], [129, 58], [143, -2], [120, -71],
      [66, -123], [-5, -145], [-76, -132], [-131, -92], [-157, -29], [-143, 39], [-103, 98]
    ],
  },
  {
    id: 'corniche', district: 'THE CORNICHE', name: 'CORNICHE COASTLINE', short: 'CORNICHE',
    tagline: 'A sunset drive along the bay.',
    description: 'Follow the water from Sheraton Park to the Museum of Islamic Art and the colourful Old Doha Port.',
    number: '05', laps: 1, time: 'sunset', accent: '#5de1ec', icon: '≈', large: true,
    coastline: 445, setting: 'coast',
    highlights: ['Sheraton Grand', 'Al Bidda Park', 'Pearl Monument', 'MIA Park', 'Mina District', 'Dhow Harbour'],
    streets: ['Al Corniche Street', 'Al Funduq Street', 'Majlis Al Taawon Street', 'Al Corniche Street',
      'Abdulla Bin Jassim Street', 'Museum Park Street', 'Al Corniche Street', 'Al Bidda Street'],
    points: [
      [-282, 280], [-111, 333], [70, 346], [251, 307], [365, 215], [391, 73],
      [357, -91], [272, -237], [104, -303], [-78, -309], [-251, -259],
      [-363, -146], [-389, 17], [-344, 172]
    ],
    landmarks: [
      { t: .048, side: 1, type: 'skyline', name: 'WEST BAY SKYLINE' },
      { t: .178, side: 1, type: 'sheraton', name: 'SHERATON GRAND' },
      { t: .299, side: 1, type: 'park', name: 'AL BIDDA PARK' },
      { t: .415, side: 1, type: 'pearlmonument', name: 'PEARL MONUMENT' },
      { t: .545, side: 1, type: 'mia', name: 'MUSEUM OF ISLAMIC ART' },
      { t: .675, side: 1, type: 'mina', name: 'OLD DOHA PORT · MINA' },
      { t: .815, side: 1, type: 'dhow', name: 'DHOW HARBOUR' },
      { t: .92, side: 1, type: 'national', name: 'NATIONAL MUSEUM' },
    ]
  },
  {
    id: 'olddoha', district: 'OLD DOHA', name: 'OLD DOHA DISCOVERY', short: 'OLD DOHA',
    tagline: 'Tradition meets tomorrow.',
    description: 'The heritage heart: Msheireb, Souq Waqif, the desert rose museum and the pastel port.',
    number: '06', laps: 1, time: 'dusk', accent: '#ffbf9d', icon: '✧', large: true,
    coastline: 405, setting: 'coast',
    highlights: ['Msheireb Downtown', 'Souq Waqif', 'Fanar', 'National Museum', 'Mina District', 'MIA'],
    streets: ['Grand Hamad Street', 'Jassim Bin Mohammed Street', 'Wadi Msheireb Street', 'Al Diwan Street',
      'Abdulla Bin Jassim Street', 'Al Corniche Street', 'Museum Park Street', 'Grand Hamad Street'],
    points: [
      [-275, 247], [-120, 300], [59, 305], [218, 262], [327, 165],
      [344, 9], [290, -151], [173, -265], [16, -293], [-159, -268],
      [-286, -200], [-354, -50], [-345, 100]
    ],
    landmarks: [
      { t: .055, side: 1, type: 'msheireb', name: 'MSHEIREB DOWNTOWN' },
      { t: .175, side: 1, type: 'souq', name: 'SOUQ WAQIF' },
      { t: .30, side: 1, type: 'fanar', name: 'FANAR CULTURAL CENTER' },
      { t: .435, side: 1, type: 'national', name: 'NATIONAL MUSEUM' },
      { t: .57, side: 1, type: 'mina', name: 'MINA DISTRICT' },
      { t: .71, side: 1, type: 'mia', name: 'MUSEUM OF ISLAMIC ART' },
      { t: .84, side: 1, type: 'park', name: 'AL BIDDA PARK' },
    ]
  },
  {
    id: 'katara', district: 'KATARA', name: 'KATARA COASTAL DRIVE', short: 'KATARA',
    tagline: 'Culture by the sea.',
    description: 'Discover the amphitheatre, colourful mosque, 21 High Street and the seafront.',
    number: '07', laps: 1, time: 'day', accent: '#92e4d2', icon: '◉', large: true,
    coastline: 385, setting: 'coast',
    highlights: ['Katara Amphitheatre', 'Katara Mosque', '21 High Street', 'Katara Beach', 'Al Thuraya Planetarium'],
    streets: ['Katara Street', 'Legtaifiya Street', 'Lusail Street', 'Lusail Expressway',
      'Katara Street', 'Legtaifiya Street', 'Lusail Street', 'Katara Street'],
    points: [
      [-250, 231], [-93, 281], [65, 292], [206, 263], [316, 156],
      [321, 9], [268, -144], [142, -259], [-26, -287],
      [-184, -244], [-296, -147], [-323, 6], [-300, 135]
    ],
    landmarks: [
      { t: .065, side: 1, type: 'katara', name: 'KATARA AMPHITHEATRE' },
      { t: .18, side: 1, type: 'mosque', name: 'KATARA MOSQUE' },
      { t: .315, side: 1, type: 'retail', name: '21 HIGH STREET' },
      { t: .455, side: 1, type: 'beach', name: 'KATARA BEACH' },
      { t: .60, side: 1, type: 'hills', name: 'KATARA HILLS' },
      { t: .742, side: 1, type: 'planetarium', name: 'AL THURAYA PLANETARIUM' },
      { t: .875, side: 1, type: 'pigeons', name: 'PIGEON TOWERS' },
    ]
  },
  {
    id: 'aspire', district: 'ASPIRE / EDUCATION CITY', name: 'ASPIRE & EDUCATION', short: 'ASPIRE',
    tagline: 'Green streets. Big ideas.',
    description: 'From The Torch and Khalifa Stadium to Qatar National Library and Oxygen Park.',
    number: '08', laps: 1, time: 'sunset', accent: '#b7e486', icon: '⬡', large: true,
    coastline: null, setting: 'inland',
    highlights: ['The Torch', 'Aspire Park', 'Villaggio', 'Khalifa Stadium', 'Qatar National Library', 'Oxygen Park'],
    streets: ['Al Waab Street', 'Sports City Street', 'Al Aziziyah Street', 'Al Furousiya Street',
      'Al Luqta Street', 'Dukhan Road', 'Gharrafat Al Rayyan Street', 'Al Waab Street'],
    points: [
      [-297, 267], [-113, 315], [77, 322], [248, 279], [365, 167],
      [373, 4], [308, -163], [173, -284], [-13, -314],
      [-196, -284], [-324, -205], [-391, -53], [-370, 111]
    ],
    landmarks: [
      { t: .06, side: 1, type: 'aspire', name: 'THE TORCH DOHA' },
      { t: .18, side: 1, type: 'park', name: 'ASPIRE PARK' },
      { t: .30, side: 1, type: 'retail', name: 'VILLAGGIO MALL' },
      { t: .43, side: 1, type: 'stadium', name: 'KHALIFA INTL STADIUM' },
      { t: .55, side: 1, type: 'museum321', name: '3-2-1 SPORTS MUSEUM' },
      { t: .67, side: 1, type: 'education', name: 'QATAR NATIONAL LIBRARY' },
      { t: .79, side: 1, type: 'stadium', name: 'EDUCATION CITY STADIUM' },
      { t: .9, side: 1, type: 'park', name: 'OXYGEN PARK' },
    ]
  },
];

export const CARS = [
  { name: 'DESERT FALCON', type: 'RALLY / ALL-WHEEL DRIVE', color: '#1b8ef5',
    number: '07', topSpeed: 49, acceleration: 21, braking: 28, handling: 2.15, grip: 7.8,
    stats: [82, 91, 85, 86], description: 'Agile through every corner. Born for the boulevard.',
    length: 4.4, width: 2.05, wing: true },
  { name: 'PEARL GT', type: 'GRAND TOURER / REAR-WHEEL DRIVE', color: '#f2eee4',
    number: '22', topSpeed: 54, acceleration: 18.5, braking: 27, handling: 1.92, grip: 6.8,
    stats: [92, 79, 78, 84], description: 'Quiet confidence. An elegant line through the city.',
    length: 4.7, width: 2.1, wing: false },
  { name: 'DUNE PHANTOM', type: 'TRACK SPECIAL / REAR-WHEEL DRIVE', color: '#b21f4d',
    number: '99', topSpeed: 61, acceleration: 22.5, braking: 31, handling: 1.75, grip: 6.1,
    stats: [100, 96, 70, 95], description: 'Unapologetically fast. Make the night yours.',
    length: 4.85, width: 2.16, wing: true },
  { name: 'NEON ZEPHYR', type: 'ELECTRIC / ALL-WHEEL DRIVE', color: '#8155ef',
    number: '11', topSpeed: 57, acceleration: 24, braking: 29, handling: 2.04, grip: 7.5,
    stats: [94, 100, 86, 90], description: 'Silent power. A violet flash through the city.',
    length: 4.55, width: 2.08, wing: true },
  { name: 'GULF BREEZE', type: 'STREET SPORT / REAR-WHEEL DRIVE', color: '#30cfc7',
    number: '55', topSpeed: 53, acceleration: 20, braking: 28, handling: 2.11, grip: 7.4,
    stats: [86, 88, 91, 87], description: 'Coastal colour and perfectly balanced corners.',
    length: 4.46, width: 2.04, wing: false },
];

export const DRIVERS = ['YOU', 'A. AL-MARRI', 'N. AL-KUWARI', 'S. AL-THANI'];
export const CAMERA_NAMES = ['CHASE', 'WIDE', 'HOOD', 'COCKPIT', 'CINEMATIC'];

export const TIMES = {
  day: { label: 'DAYLIGHT', top: '#3eaff3', horizon: '#f9ddbc', fog: 0xcad8d8,
    sun: 0xffedca, sunIntensity: 2.8, ambient: 1.8, exposure: 1.36,
    light: [160, 210, -90], night: 0 },
  sunset: { label: 'GOLDEN HOUR', top: '#478aca', horizon: '#ffae87', fog: 0xcda292,
    sun: 0xffc28c, sunIntensity: 2.55, ambient: 1.55, exposure: 1.27,
    light: [-190, 100, -90], night: 0.23 },
  dusk: { label: 'BLUE HOUR', top: '#203e84', horizon: '#db789d', fog: 0x697189,
    sun: 0xff9c82, sunIntensity: 1.65, ambient: 1.03, exposure: 1.28,
    light: [-150, 65, 75], night: 0.75 },
  night: { label: 'MIDNIGHT', top: '#09143d', horizon: '#333968', fog: 0x1e2d4e,
    sun: 0xb9c9ff, sunIntensity: 0.75, ambient: 0.72, exposure: 1.48,
    light: [80, 130, 110], night: 1 },
};
