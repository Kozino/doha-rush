# DOHA RUSH

**A colourful, no-login 3D driving game inspired by Doha, Qatar.** Open it, pick a route, and start a rally or explore in Free Drive. No account, API key, downloaded models, or remote assets are needed. The game is an original, artistic interpretation, **not a street map**.

## Play immediately

- **Offline, single-file game:** open [`../DOHA-RUSH.html`](../DOHA-RUSH.html) in a modern desktop or mobile browser. The HTML contains the JavaScript, CSS, fonts and favicon. No connection is needed to play.
- **Source project:** from this directory, run `npm install` and `npm run dev`, then open the Vite URL.
- **Check steering:** run `npm test` to verify that Left/A and Right/D steer in the correct screen directions (including touch controls).
- **Rebuild the offline game:** run `npm run build` followed by `python scripts/make-standalone.py`.

## Eight routes

| # | Route | Laps | Approx. game length | Places illustrated |
|---|---|---:|---:|---|
| 01 | **The Doha Grand Tour** | 1 | 2.7 km | West Bay skyline, Katara, The Pearl, Lusail Stadium, Aspire, Msheireb, Souq Waqif, National Museum, Mina District, Museum of Islamic Art |
| 02 | **Lusail Lights** | 3 | 0.9 km / lap | Lusail Stadium, Katara Towers, Place Vendôme, Marina Promenade |
| 03 | **Pearl Island Run** | 2 | 0.9 km / lap | Porto Arabia, Qanat Quartier, Medina Centrale, Viva Bahriya |
| 04 | **West Bay Nights** | 2 | 0.9 km / lap | Doha Tower, Tornado Tower, Sheraton Grand, Doha Corniche |
| 05 | **Corniche Coastline** | 1 | 2.3 km | Sheraton Grand, Al Bidda Park, Pearl Monument, Museum of Islamic Art, Mina District, Dhow Harbour |
| 06 | **Old Doha Discovery** | 1 | 2.1 km | Msheireb Downtown, Souq Waqif, Fanar, National Museum, Mina District, Museum of Islamic Art |
| 07 | **Katara Coastal Drive** | 1 | 2.0 km | Katara Amphitheatre, Katara Mosque, 21 High Street, beach, hills, Al Thuraya Planetarium |
| 08 | **Aspire & Education** | 1 | 2.3 km | The Torch, Aspire Park, Villaggio, Khalifa International Stadium, Qatar National Library, Education City Stadium, Oxygen Park |

The first three district routes are shorter sprints; the Grand Tour and four new district drives are longer courses. Course lengths are **in-game measurements, not real-world distances**. All routes have eight checkpoints per lap and cycle through green, amber and red traffic lights. Crossing a red signal during a rally adds **two seconds** to your time. The HUD shows the next signal's colour, remaining seconds and approximate distance. Traffic lights freeze while the game is paused.

The five longer routes have a paved outer boulevard connected to the main road by six cross streets. Explore them in **Free Drive**; the minimap draws both roads. The sprint routes have signal-controlled pedestrian crossings. These are deliberately fictional layouts.

Five fictional vehicles, four driver choices, five camera angles, photo-mode PNG export, four lighting presets, touch controls, local best times, road-name signs, architectural landmarks, a live minimap and a colourful route selector are included. Cars, streets and buildings are rendered from procedurally generated geometry and materials. Local records use browser storage; saving records is optional for play.

## Controls

| Key | Action |
|---|---|
| W / ↑ | Accelerate |
| S / ↓ | Brake / reverse |
| A D / ← → | Steer |
| Space | Handbrake / drift |
| C | Cycle chase, wide, hood, cockpit and cinematic cameras |
| R | Reset car to the nearest section of the circuit |
| P / Esc | Pause / resume, or leave photo mode |
| M / H | Mute / hide HUD |
| 1 / 2 / 3 / 4 | Daylight / golden hour / blue hour / midnight |
| G | Toggle composition grid in photo mode |

On a phone, use the steering, brake, throttle and drift buttons shown while driving. The main menu route strip swipes horizontally; its arrows also cycle routes. The garage route list scrolls vertically. No login is required.

## Important note on geography

**This is a fictional, closed-course game world; it must never be used for real-world navigation.** Many location and street *names* come from Doha, but the curves, distances, road connections, building models and proportions are invented. A venue being pictured here does not imply the streets around it are available for racing. This independent project is not affiliated with any venue, game creator or public authority.

Place references include Visit Qatar guides to [Lusail](https://visitqatar.com/intl-en/things-to-do/get-inspired/lusail-highlights), [The Pearl](https://visitqatar.com/intl-en/things-to-do/romantic-getaway/places/the-pearl), [West Bay](https://visitqatar.com/intl-en/things-to-do/art-culture/architecture/west-bay-towers), [Old Doha Port/Mina District](https://visitqatar.com/intl-en/things-to-do/romantic-getaway/places/mina-district-old-doha-port), [Msheireb](https://visitqatar.com/intl-en/things-to-do/romantic-getaway/places/msheireb-downtown), [Katara](https://visitqatar.com/intl-en/things-to-do/art-culture/katara-cultural-village), [Aspire](https://visitqatar.com/intl-en/things-to-do/adventure-sports/aspire-zone-foundation), and [Education City](https://visitqatar.com/intl-en/plan-your-trip/education/universities/education-city). The code, UI and 3D art are original.

## Project layout

```text
index.html                  Vite entry point
src/data.js                 Routes, cars, drivers, colour/lighting presets
src/world.js                Procedural courses, side streets, signals, landmarks
src/car.js                  Custom 3D cars and wheel animation
src/audio.js                Synthesised engine and sound cues
src/controls.js             Unified left/right keyboard and touch steering
src/main.js                 Game loop, physics, checkpoints, HUD and cameras
src/styles.css              Responsive interface and touch controls
tests/steering.test.mjs      Steering direction regression tests
public/fonts/               Bundled typefaces — no network fonts
scripts/make-standalone.py  Regenerates one-file offline game from dist/
```
