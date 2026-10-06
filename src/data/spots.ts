export type Bottom = 'sand' | 'rock' | 'mixed'
export type RegionId = 'nw' | 'bizerte' | 'tunis' | 'capbon' | 'south'

/**
 * What kind of place it is. This matters more than the exact coordinates: nearby spots share
 * the same forecast grid cell, so their differences come from type and orientation.
 * - beach: open sand beach
 * - rocks: fishing from rocks, cliffs, capes
 * - jetty: breakwater or harbour wall (جطّي); its lee side stays fishable in rougher sea
 * - port: inside a harbour, very sheltered
 * - mouth: river mouth or lagoon outlet
 */
export type SpotKind = 'beach' | 'rocks' | 'jetty' | 'port' | 'mouth'

export interface Region {
  id: RegionId
  name: string
}

export interface Area {
  id: string
  name: string
  region: RegionId
}

export interface Spot {
  id: string
  name: string
  area: string
  lat: number
  lon: number
  /** Compass bearing the spot looks out to sea (0 = north, 90 = east). */
  facing: number
  kind: SpotKind
  /** Seabed in front of the spot. Defaults from the kind when not given. */
  bottom: Bottom
  /** Murky water after rain draws sea bass (river mouths, lagoon outlets). */
  estuary?: boolean
  /** Lit or easy to reach at night. */
  night?: boolean
  /** Species ids known to be caught here: they get a boost and always show first. */
  fish?: string[]
  /** Local tip shown on the spot page, in darja. */
  note?: string
  /** Coordinates placed by hand rather than taken from OpenStreetMap: worth checking on site. */
  approx?: boolean
}

export const REGIONS: Region[] = [
  { id: 'nw', name: 'الشمال الغربي' },
  { id: 'bizerte', name: 'بنزرت' },
  { id: 'tunis', name: 'تونس' },
  { id: 'capbon', name: 'الوطن القبلي' },
  { id: 'south', name: 'الحمامات وهرقلة' },
]

export const AREAS: Area[] = [
  { id: 'capnegro', name: 'كاب نيقرو', region: 'nw' },
  { id: 'sejnane', name: 'سيدي مشرق وكاب سراط', region: 'nw' },

  { id: 'bizcity', name: 'بنزرت المدينة', region: 'bizerte' },
  { id: 'capblanc', name: 'كاب بلان ورأس أنجلة', region: 'bizerte' },
  { id: 'rimel', name: 'الرمل', region: 'bizerte' },
  { id: 'rasjebel', name: 'رأس الجبل وماتلين', region: 'bizerte' },
  { id: 'rafraf', name: 'رفراف', region: 'bizerte' },
  { id: 'gharmelh', name: 'غار الملح', region: 'bizerte' },

  { id: 'kalaa', name: 'قلعة الأندلس', region: 'tunis' },
  { id: 'raoued', name: 'رواد', region: 'tunis' },
  { id: 'gammarth', name: 'قمرت', region: 'tunis' },
  { id: 'marsa', name: 'المرسى', region: 'tunis' },
  { id: 'carthage', name: 'سيدي بوسعيد وقرطاج', region: 'tunis' },
  { id: 'goulette', name: 'حلق الوادي والكرم', region: 'tunis' },
  { id: 'southsub', name: 'رادس وحمام الأنف', region: 'tunis' },

  { id: 'korbous', name: 'قربص وسيدي الرايس', region: 'capbon' },
  { id: 'sididaoud', name: 'سيدي داود', region: 'capbon' },
  { id: 'haouaria', name: 'الهوارية', region: 'capbon' },
  { id: 'kelibia', name: 'قليبية', region: 'capbon' },
  { id: 'temime', name: 'منزل تميم', region: 'capbon' },
  { id: 'korba', name: 'قربة', region: 'capbon' },

  { id: 'nabeul', name: 'نابل وبني خيار', region: 'south' },
  { id: 'hammamet', name: 'الحمامات', region: 'south' },
  { id: 'bouficha', name: 'بوفيشة', region: 'south' },
  { id: 'hergla', name: 'هرقلة', region: 'south' },
]

const DEFAULT_BOTTOM: Record<SpotKind, Bottom> = { beach: 'sand', rocks: 'rock', jetty: 'mixed', port: 'mixed', mouth: 'sand' }

type SpotInput = Omit<Spot, 'bottom'> & { bottom?: Bottom }
const s = (x: SpotInput): Spot => ({ ...x, bottom: x.bottom ?? DEFAULT_BOTTOM[x.kind], estuary: x.estuary ?? x.kind === 'mouth' })

// Coordinates from OpenStreetMap where a named place exists; `approx` marks the ones placed by hand.
export const SPOTS: Spot[] = [
  // ---- الشمال الغربي
  s({ id: 'capnegro', name: 'كاب نيقرو', area: 'capnegro', lat: 37.095, lon: 8.99, facing: 330, kind: 'rocks', approx: true }),
  s({ id: 'mechreg', name: 'سيدي مشرق', area: 'sejnane', lat: 37.16, lon: 9.13, facing: 350, kind: 'beach', bottom: 'mixed', approx: true }),
  s({ id: 'capserrat', name: 'شط كاب سراط', area: 'sejnane', lat: 37.2184, lon: 9.2259, facing: 0, kind: 'mouth', bottom: 'mixed' }),
  s({ id: 'capserratrocks', name: 'صخر كاب سراط', area: 'sejnane', lat: 37.2404, lon: 9.2172, facing: 330, kind: 'rocks' }),

  // ---- بنزرت
  s({ id: 'canal', name: 'جطّي الكنال', area: 'bizcity', lat: 37.2696, lon: 9.8936, facing: 70, kind: 'jetty', night: true, fish: ['warata', 'qarous', 'mourjane'], note: 'مدخل القنال: تيّار قوي، زيد في الرصاص.', approx: true }),
  s({ id: 'vieuxport', name: 'المرسى القديم', area: 'bizcity', lat: 37.2767, lon: 9.8753, facing: 90, kind: 'port', night: true, fish: ['bouri', 'warata'] }),
  s({ id: 'sidisalem', name: 'سيدي سالم', area: 'bizcity', lat: 37.2865, lon: 9.88, facing: 70, kind: 'beach', bottom: 'mixed', approx: true }),
  s({ id: 'corniche', name: 'الكورنيش (البلاج الجميل)', area: 'bizcity', lat: 37.3163, lon: 9.8683, facing: 60, kind: 'beach' }),
  s({ id: 'lagrotte', name: 'لا قروت (الكهوف)', area: 'bizcity', lat: 37.333, lon: 9.8466, facing: 30, kind: 'rocks', fish: ['ouarka', 'kahla', 'warata'] }),
  s({ id: 'capblanc', name: 'كاب بلان', area: 'capblanc', lat: 37.338, lon: 9.8369, facing: 0, kind: 'rocks' }),
  s({ id: 'rasangela', name: 'رأس أنجلة', area: 'capblanc', lat: 37.3469, lon: 9.7423, facing: 0, kind: 'rocks' }),
  s({ id: 'rimel', name: 'شط الرمل', area: 'rimel', lat: 37.2587, lon: 9.9102, facing: 30, kind: 'beach' }),
  s({ id: 'raszbib', name: 'رأس زبيب', area: 'rasjebel', lat: 37.2683, lon: 10.0683, facing: 15, kind: 'rocks' }),
  s({ id: 'raszbibport', name: 'مرسى رأس زبيب', area: 'rasjebel', lat: 37.2672, lon: 10.0695, facing: 30, kind: 'jetty' }),
  s({ id: 'mami', name: 'شط مامي (ماتلين)', area: 'rasjebel', lat: 37.2405, lon: 10.0959, facing: 20, kind: 'beach' }),
  s({ id: 'rasjebel', name: 'شط رأس الجبل', area: 'rasjebel', lat: 37.235, lon: 10.13, facing: 10, kind: 'beach', bottom: 'mixed', approx: true }),
  s({ id: 'sounine', name: 'سونين (عين مستير)', area: 'rafraf', lat: 37.2067, lon: 10.1915, facing: 0, kind: 'beach', bottom: 'mixed' }),
  s({ id: 'rafraf', name: 'شط رفراف', area: 'rafraf', lat: 37.1856, lon: 10.2172, facing: 40, kind: 'beach' }),
  s({ id: 'gharmelhport', name: 'مرسى غار الملح', area: 'gharmelh', lat: 37.1527, lon: 10.2298, facing: 120, kind: 'jetty', night: true }),
  s({ id: 'sidiali', name: 'سيدي علي المكي', area: 'gharmelh', lat: 37.1703, lon: 10.2535, facing: 130, kind: 'beach', estuary: true }),
  s({ id: 'captarf', name: 'رأس الطرف (كاب فارينا)', area: 'gharmelh', lat: 37.1778, lon: 10.2805, facing: 90, kind: 'rocks' }),

  // ---- تونس
  s({ id: 'medjerda', name: 'فم وادي مجردة', area: 'kalaa', lat: 37.1, lon: 10.215, facing: 80, kind: 'mouth', approx: true }),
  s({ id: 'raoued', name: 'شط رواد', area: 'raoued', lat: 36.9634, lon: 10.2263, facing: 80, kind: 'beach' }),
  s({ id: 'gammarth', name: 'شط قمرت', area: 'gammarth', lat: 36.9324, lon: 10.2736, facing: 60, kind: 'beach' }),
  s({ id: 'gammarthport', name: 'مرسى قمرت', area: 'gammarth', lat: 36.9205, lon: 10.308, facing: 60, kind: 'jetty', night: true }),
  s({ id: 'marsaplage', name: 'شط المرسى', area: 'marsa', lat: 36.8938, lon: 10.3252, facing: 45, kind: 'beach' }),
  s({ id: 'sidiabdelaziz', name: 'سيدي عبد العزيز', area: 'marsa', lat: 36.8893, lon: 10.3268, facing: 50, kind: 'rocks', bottom: 'mixed', night: true, fish: ['ouarka', 'warata', 'kahla'], approx: true }),
  s({ id: 'marsacorniche', name: 'كورنيش المرسى', area: 'marsa', lat: 36.8839, lon: 10.3376, facing: 60, kind: 'rocks', bottom: 'mixed', night: true }),
  s({ id: 'sbsport', name: 'مرسى سيدي بوسعيد', area: 'carthage', lat: 36.8668, lon: 10.3515, facing: 90, kind: 'jetty', night: true }),
  s({ id: 'amilcar', name: 'شط أميلكار', area: 'carthage', lat: 36.8617, lon: 10.3416, facing: 90, kind: 'beach' }),
  s({ id: 'salammbo', name: 'شط صلامبو', area: 'carthage', lat: 36.8368, lon: 10.3246, facing: 110, kind: 'beach' }),
  s({ id: 'kram', name: 'شط الكرم', area: 'goulette', lat: 36.8308, lon: 10.3188, facing: 110, kind: 'beach' }),
  s({ id: 'kheireddine', name: 'خير الدين', area: 'goulette', lat: 36.8264, lon: 10.3145, facing: 110, kind: 'beach', bottom: 'mixed', approx: true }),
  s({ id: 'goulettejetty', name: 'جطّي حلق الوادي', area: 'goulette', lat: 36.8219, lon: 10.3136, facing: 110, kind: 'jetty', night: true, fish: ['warata', 'qarous', 'bouri'] }),
  s({ id: 'rades', name: 'شط رادس', area: 'southsub', lat: 36.779, lon: 10.292, facing: 40, kind: 'beach', approx: true }),
  s({ id: 'ezzahra', name: 'شط الزهراء', area: 'southsub', lat: 36.746, lon: 10.312, facing: 40, kind: 'beach', approx: true }),
  s({ id: 'hammamlif', name: 'شط حمام الأنف', area: 'southsub', lat: 36.729, lon: 10.338, facing: 30, kind: 'beach', approx: true }),

  // ---- الوطن القبلي
  s({ id: 'korbous', name: 'قربص', area: 'korbous', lat: 36.83, lon: 10.57, facing: 290, kind: 'rocks', approx: true }),
  s({ id: 'sidirais', name: 'سيدي الرايس', area: 'korbous', lat: 36.78, lon: 10.54, facing: 300, kind: 'beach', bottom: 'mixed', approx: true }),
  s({ id: 'mangaa', name: 'شط المنقعة', area: 'korbous', lat: 36.8758, lon: 10.6253, facing: 320, kind: 'beach' }),
  s({ id: 'rtiba', name: 'شط الرتيبة', area: 'korbous', lat: 36.8947, lon: 10.733, facing: 330, kind: 'beach' }),
  s({ id: 'sididaoudport', name: 'مرسى سيدي داود', area: 'sididaoud', lat: 37.0204, lon: 10.9081, facing: 330, kind: 'jetty' }),
  s({ id: 'haouaria', name: 'الهوارية (الغرب)', area: 'haouaria', lat: 37.03, lon: 10.97, facing: 345, kind: 'rocks', approx: true }),
  s({ id: 'gharkebir', name: 'غار الكبير', area: 'haouaria', lat: 37.06, lon: 11.035, facing: 30, kind: 'rocks', approx: true }),
  s({ id: 'haouariaport', name: 'مرسى الهوارية', area: 'haouaria', lat: 37.0415, lon: 11.0652, facing: 60, kind: 'jetty' }),
  s({ id: 'rasedrek', name: 'رأس الدرك', area: 'haouaria', lat: 36.98, lon: 11.06, facing: 80, kind: 'rocks', approx: true }),
  s({ id: 'darallouch', name: 'شط دار علّوش', area: 'haouaria', lat: 36.9829, lon: 11.077, facing: 80, kind: 'beach' }),
  s({ id: 'ghezaz', name: 'شط حمام الغزاز', area: 'kelibia', lat: 36.8864, lon: 11.1201, facing: 50, kind: 'beach' }),
  s({ id: 'sidimansour', name: 'سيدي منصور', area: 'kelibia', lat: 36.8654, lon: 11.1324, facing: 60, kind: 'beach', bottom: 'mixed' }),
  s({ id: 'mansoura', name: 'المنصورة', area: 'kelibia', lat: 36.8524, lon: 11.1265, facing: 70, kind: 'rocks', bottom: 'mixed' }),
  s({ id: 'petitparis', name: 'باريس الصغيرة', area: 'kelibia', lat: 36.8475, lon: 11.1243, facing: 80, kind: 'rocks', bottom: 'mixed' }),
  s({ id: 'kelibiaport', name: 'مرسى قليبية', area: 'kelibia', lat: 36.8349, lon: 11.1118, facing: 100, kind: 'jetty', night: true }),
  s({ id: 'kelibia', name: 'شط قليبية', area: 'kelibia', lat: 36.8367, lon: 11.1028, facing: 130, kind: 'beach' }),
  s({ id: 'jameleddine', name: 'سيدي جمال الدين', area: 'temime', lat: 36.7957, lon: 11.0317, facing: 115, kind: 'beach' }),
  s({ id: 'temime', name: 'شط منزل تميم', area: 'temime', lat: 36.78, lon: 11.02, facing: 110, kind: 'beach', approx: true }),
  s({ id: 'menzelhorr', name: 'شط منزل حر', area: 'temime', lat: 36.7173, lon: 10.9659, facing: 115, kind: 'beach' }),
  s({ id: 'korba', name: 'شط قربة', area: 'korba', lat: 36.5721, lon: 10.8679, facing: 115, kind: 'beach', estuary: true }),

  // ---- الحمامات وهرقلة
  s({ id: 'nabeul', name: 'شط نابل', area: 'nabeul', lat: 36.45, lon: 10.74, facing: 135, kind: 'beach', approx: true }),
  s({ id: 'benikhiar', name: 'مرسى بني خيار', area: 'nabeul', lat: 36.4543, lon: 10.7972, facing: 135, kind: 'jetty' }),
  s({ id: 'hammamet', name: 'شط الحمامات', area: 'hammamet', lat: 36.3941, lon: 10.6177, facing: 160, kind: 'beach' }),
  s({ id: 'yasmine', name: 'مرسى ياسمين الحمامات', area: 'hammamet', lat: 36.3736, lon: 10.5459, facing: 160, kind: 'jetty', night: true }),
  s({ id: 'bouficha', name: 'شط بوفيشة', area: 'bouficha', lat: 36.3, lon: 10.5, facing: 90, kind: 'beach', approx: true }),
  s({ id: 'hergla', name: 'شط هرقلة', area: 'hergla', lat: 36.03, lon: 10.51, facing: 90, kind: 'beach', bottom: 'mixed', approx: true }),
  s({ id: 'herglaport', name: 'مرسى هرقلة', area: 'hergla', lat: 36.0332, lon: 10.5105, facing: 90, kind: 'jetty', night: true }),
]

const AREA_BY_ID = new Map(AREAS.map((a) => [a.id, a]))
export const areaOf = (s: Spot): Area => AREA_BY_ID.get(s.area)!
export const regionOf = (s: Spot): RegionId => areaOf(s).region

export const KIND_NAMES: Record<SpotKind, string> = {
  beach: 'شط',
  rocks: 'صخر',
  jetty: 'جطّي',
  port: 'داخل المرسى',
  mouth: 'فم وادي',
}

/** Point ~4 km offshore along the facing bearing, so the wave model samples open sea, not land. */
export function marinePoint(s: Spot): { lat: number; lon: number } {
  const d = 0.04
  const r = (s.facing * Math.PI) / 180
  return {
    lat: +(s.lat + d * Math.cos(r)).toFixed(3),
    lon: +(s.lon + (d * Math.sin(r)) / Math.cos((s.lat * Math.PI) / 180)).toFixed(3),
  }
}
