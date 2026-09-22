export type Bottom = 'sand' | 'rock' | 'mixed'
export type RegionId = 'nw' | 'bizerte' | 'tunis' | 'capbon' | 'south'

export interface Spot {
  id: string
  name: string
  region: RegionId
  lat: number
  lon: number
  /** Compass bearing the beach looks out to sea (0 = north, 90 = east). */
  facing: number
  bottom: Bottom
  /** River mouth or lagoon outlet: murky water after rain draws sea bass. */
  estuary?: boolean
}

export const REGIONS: { id: RegionId; name: string }[] = [
  { id: 'nw', name: 'الشمال الغربي' },
  { id: 'bizerte', name: 'بنزرت' },
  { id: 'tunis', name: 'تونس' },
  { id: 'capbon', name: 'الوطن القبلي' },
  { id: 'south', name: 'الحمامات وهرقلة' },
]

export const SPOTS: Spot[] = [
  { id: 'capnegro', name: 'كاب نيقرو', region: 'nw', lat: 37.095, lon: 8.99, facing: 330, bottom: 'rock' },
  { id: 'mechreg', name: 'سيدي مشرق', region: 'nw', lat: 37.16, lon: 9.13, facing: 350, bottom: 'mixed' },
  { id: 'capserrat', name: 'كاب سراط', region: 'nw', lat: 37.225, lon: 9.225, facing: 0, bottom: 'mixed', estuary: true },

  { id: 'rasangela', name: 'رأس أنجلة', region: 'bizerte', lat: 37.345, lon: 9.745, facing: 0, bottom: 'rock' },
  { id: 'capblanc', name: 'كاب بلان', region: 'bizerte', lat: 37.33, lon: 9.84, facing: 0, bottom: 'rock' },
  { id: 'corniche', name: 'الكورنيش (سيدي سالم)', region: 'bizerte', lat: 37.295, lon: 9.87, facing: 60, bottom: 'mixed' },
  { id: 'rimel', name: 'الرمل', region: 'bizerte', lat: 37.255, lon: 9.92, facing: 30, bottom: 'sand' },
  { id: 'raszbib', name: 'رأس زبيب', region: 'bizerte', lat: 37.268, lon: 10.063, facing: 15, bottom: 'rock' },
  { id: 'rasjebel', name: 'رأس الجبل', region: 'bizerte', lat: 37.235, lon: 10.13, facing: 10, bottom: 'mixed' },
  { id: 'rafraf', name: 'رفراف', region: 'bizerte', lat: 37.19, lon: 10.2, facing: 40, bottom: 'sand' },
  { id: 'sidiali', name: 'سيدي علي المكي', region: 'bizerte', lat: 37.165, lon: 10.265, facing: 130, bottom: 'sand', estuary: true },

  { id: 'medjerda', name: 'فم وادي مجردة', region: 'tunis', lat: 37.1, lon: 10.215, facing: 80, bottom: 'sand', estuary: true },
  { id: 'raoued', name: 'رواد', region: 'tunis', lat: 36.97, lon: 10.215, facing: 80, bottom: 'sand' },
  { id: 'gammarth', name: 'قمرت', region: 'tunis', lat: 36.92, lon: 10.29, facing: 70, bottom: 'mixed' },

  { id: 'korbous', name: 'قربص', region: 'capbon', lat: 36.83, lon: 10.57, facing: 290, bottom: 'rock' },
  { id: 'sidirais', name: 'سيدي الرايس', region: 'capbon', lat: 36.78, lon: 10.54, facing: 300, bottom: 'mixed' },
  { id: 'haouaria', name: 'الهوارية', region: 'capbon', lat: 37.03, lon: 10.97, facing: 345, bottom: 'rock' },
  { id: 'gharkebir', name: 'غار الكبير (الهوارية)', region: 'capbon', lat: 37.06, lon: 11.035, facing: 30, bottom: 'rock' },
  { id: 'rasedrek', name: 'رأس الدرك', region: 'capbon', lat: 36.98, lon: 11.06, facing: 80, bottom: 'rock' },
  { id: 'mansoura', name: 'المنصورة (قليبية)', region: 'capbon', lat: 36.87, lon: 11.11, facing: 60, bottom: 'mixed' },
  { id: 'kelibia', name: 'قليبية', region: 'capbon', lat: 36.83, lon: 11.105, facing: 100, bottom: 'mixed' },
  { id: 'temime', name: 'منزل تميم', region: 'capbon', lat: 36.78, lon: 11.02, facing: 110, bottom: 'sand' },
  { id: 'korba', name: 'قربة', region: 'capbon', lat: 36.58, lon: 10.87, facing: 115, bottom: 'sand', estuary: true },

  { id: 'nabeul', name: 'نابل', region: 'south', lat: 36.45, lon: 10.74, facing: 135, bottom: 'sand' },
  { id: 'hammamet', name: 'الحمامات', region: 'south', lat: 36.39, lon: 10.61, facing: 160, bottom: 'sand' },
  { id: 'bouficha', name: 'بوفيشة', region: 'south', lat: 36.3, lon: 10.5, facing: 90, bottom: 'sand' },
  { id: 'hergla', name: 'هرقلة', region: 'south', lat: 36.03, lon: 10.51, facing: 90, bottom: 'mixed' },
]

/** Point ~4 km offshore along the facing bearing, so the wave model samples open sea, not land. */
export function marinePoint(s: Spot): { lat: number; lon: number } {
  const d = 0.04
  const r = (s.facing * Math.PI) / 180
  return {
    lat: +(s.lat + d * Math.cos(r)).toFixed(3),
    lon: +(s.lon + (d * Math.sin(r)) / Math.cos((s.lat * Math.PI) / 180)).toFixed(3),
  }
}
