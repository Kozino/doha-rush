# DOHA RUSH

**A no-login, playable 3D browser racing game through a stylised Qatar.** Select a district from the main menu, then start a rally or go free driving. The game runs entirely in your browser: no API key, account, server-side save, downloaded models, or remote assets are required.

## Play

- **Standalone game:** open [`../DOHA-RUSH.html`](../DOHA-RUSH.html) in a modern desktop or mobile browser. This single file includes the game, its JavaScript, fonts, and styling and works offline.
- **Source/development:** from this directory, run `npm install` and `npm run dev`. Open the URL printed by Vite.
- **Production build:** `npm run build`. To regenerate the single-file version, run `python scripts/make-standalone.py` after building.

## Choose your route

| District | Route | Road signs you'll see | Landmarks modelled |
|---|---|---|---|
| Lusail | Lusail Lights · 3 laps | Lusail Boulevard, Marina East Street, Lusail Street, Al Khor Coastal Road, Al Tarfa Street, Lusail Expressway | Lusail Stadium, Katara Towers, Place Vendôme, Marina Twin Towers |
| The Pearl | Pearl Island Run · 2 laps | Pearl Boulevard, Porto Arabia Drive, Madina Avenue, Qanat Quartier Drive, Corso Venezia, Viva Bahriya Drive, Costa Malaz Drive | Porto Arabia marina, Qanat Quartier canals, Medina Centrale, Abraj Quartier |
| West Bay | West Bay Nights · 2 laps | Al Corniche Street, Al Funduq Street, Majlis Al Taawon Street, Omar Al Mukhtar Street, Diplomatic Street, Conference Centre Street, Al Markhiya Street | Doha Tower, Tornado Tower, Sheraton Grand, DECC, Doha Corniche |

All courses have **eight sequential checkpoints per lap**, a live minimap, an on-road speedometer, lap/race times and personal records saved locally in your browser. Pick among three fictional cars and four fictional driver names in **Garage & Routes**. **Free Drive** lets you explore whichever district you selected; choose another from the garage. **Photo Mode** includes orbit, zoom, composition grid, four lighting presets and a PNG download.

### Controls

| Key | Action |
|---|---|
| W / ↑ | Accelerate |
| S / ↓ | Brake / reverse |
| A D / ← → | Steer |
| Space | Handbrake / drift |
| C | Cycle chase, wide, hood, cockpit, cinematic cameras |
| R | Reset car to the nearest part of the circuit |
| P / Esc | Pause / resume, or leave photo mode |
| M / H | Mute / hide HUD |
| 1 / 2 / 3 / 4 | Daylight / golden hour / blue hour / midnight |
| G | Toggle composition grid in photo mode |

On touchscreens, use the displayed steering, brake, throttle and drift buttons; tap the pause button for the menu. There is no login screen.

## Important note on geography

**This is an artistic game world, not a real street map or navigation aid.** Place and street *names* refer to real places; curves, distances, road connections, building models, and proportions have been invented for playability and performance. Please never use the game's layout for actual navigation or assume that a real road is suitable for racing. All cars are fictional. This is an independent project not affiliated with venues or public authorities.

Place-name references: Visit Qatar's [1](https://visitqatar.com/intl-en/things-to-do/get-inspired/lusail-highlights) Lusail highlights, [2](https://visitqatar.com/intl-en/things-to-do/romantic-getaway/places/the-pearl) The Pearl guide, and [3](https://visitqatar.com/intl-en/things-to-do/art-culture/architecture/west-bay-towers) West Bay architecture guide; the [4](https://qatar-streets.openalfa.com/the-pearl-qatar) Pearl street-name index; and a [5](https://medcraveonline.com/JHAAS/the-urban-regeneration-of-west-bay-business-district-of-doha-state-of-qatar.html) listing of West Bay streets. The code, UI and 3D models in this project are original.

## Project structure

```text
index.html              Vite entry point
src/data.js             Route, vehicle and lighting definitions
src/world.js            Procedural environments, circuits, landmarks, street signs
src/car.js              Custom 3D car models and wheel animation
src/audio.js            Procedural Web Audio engine and cues
src/main.js             Game loop, physics, UI, checkpoints and cameras
src/styles.css          Responsive interface and touch controls
public/fonts/           Locally stored typefaces; no network fetches
scripts/make-standalone.py  Bundles an offline HTML deliverable
```
