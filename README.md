# وقتاش نحوّت؟

A phone app (PWA) that ranks the next 7 days for beach fishing with a rod and bait along the north-east coast of Tunisia, from Cap Negro to Hergla. For each day it gives stars, the best spot, prime times, likely fish, bait and rig, all in Tunisian darja.

No server and no API keys. The phone fetches the forecast straight from Open-Meteo and does all the scoring itself. Hosting is free on GitHub Pages.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where things live

| File | What it holds |
|---|---|
| `src/data/spots.ts` | The 24 spots: coordinates, the bearing each beach faces, and the bottom type |
| `src/data/species.ts` | Fish knowledge: Tunisian name, activity by month, water temperature, sea state, time of day, bottom, bait, rig |
| `src/data/tackle.ts` | Bait and rig descriptions in darja, plus sinker weight by wave height |
| `src/lib/score.ts` | The scoring engine (the weights are at the top of `scoreHour`) |
| `src/lib/api.ts` | Open-Meteo forecast and marine calls, cached on the phone for offline use |
| `src/lib/astro.ts` | Moon phase and solunar periods, via suncalc |

To correct a fish name, a season or a bait, edit `species.ts`. Each entry lists its sources.

## How a day is scored

Every hour at every spot gets a score from 0 to 1:

- **Sea** (30%): the offshore wave height, scaled by how directly the waves hit that beach. Daytime scoring favours a moderate chop (0.6–1.2 m). At night, calmer water is fine.
- **Fish** (30%): the best-matching species for the month, sea temperature, bottom, time of day and sea state.
- **Wind** (18%): speed and gusts, plus a penalty for casting into a strong onshore wind.
- **Moon** (12%): solunar major periods (moon overhead or underfoot, ±1 h) and minor periods (moonrise and moonset).
- **Pressure** (10%): a slowly falling barometer scores best.

The total is then multiplied by a light factor (dawn and sunset are best; a bright full moon over calm water is weaker) and by a moon-phase factor.

Bonuses: a sea calming down after a storm, and a river mouth running murky after rain (good for sea bass).

A danger cap applies when waves at the beach are 2.5 m or more, gusts reach 65 km/h or more, or there's a thunderstorm.

Each day is split into four windows: الفجر, النهار, المغرب and الليل. A window's score is the average of its best two hours. A day's score is 70% its best window and 30% its second-best.

## Sources

- Forecast: [Open-Meteo](https://open-meteo.com) weather and marine APIs (free for non-commercial use)
- Tunisian fish names: [FishBase](https://www.fishbase.se) common names by country
- Seasons and baits: [pecheentunisie.com](https://www.pecheentunisie.com), [almlook.com](https://almlook.com), and general Mediterranean surfcasting guides
