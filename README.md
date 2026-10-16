# DON'T LET HER FALL
> *"Some distances cannot be crossed."*

An atmospheric, emotional, cinematic 2D silhouette platformer and website built with vanilla HTML5, CSS3, JavaScript, Canvas, and procedural Web Audio API.

---

## ✦ Overview

The player controls a lonely young man journeying through abandoned places, dangerous cliffs, dark forests, crumbling ruins, and forgotten memories, trying to reach a mysterious girl standing far away.

As the journey progresses, the world grows darker, platforming challenges demand greater precision, and fragments of scattered memories reveal the bittersweet truth behind their journey.

---

## ✦ Key Features

1. **Cinematic Silhouette Art Direction**
   - Deep midnight blue backgrounds, multi-layer parallax scrolling (mountains, ruined arches, pine trees).
   - Dynamic weather particles (fireflies, falling autumn leaves, pouring rain, rolling mist).
   - Procedural vector silhouettes for **The Boy** (flowing animated scarf, articulated running cycle, jumping squash & stretch) and **The Girl** (windblown hair and dress, ethereal starlight aura).

2. **Advanced Platforming Physics**
   - Responsive acceleration, deceleration, and ground friction.
   - Variable jump height (holding jump boosts ascent).
   - **Coyote Time** (grace period after leaving a platform).
   - **Jump Buffering** (pre-landing jump queueing).
   - Forgiving AABB collision resolution.
   - Moving platforms (sinusoidal easing with player velocity inheritance).
   - Crumbling/collapsing platforms (shake warning, collapse, timed regeneration).
   - Hazard spikes, respawn checkpoints (illuminated ancient lanterns), and memory fragments.

3. **10 Complete, Progressively Challenging Chapters**
   - **Chapter I — The Beginning**: Gentle moonlit rolling hills introducing movement and the first collectible.
   - **Chapter II — First Step**: Wider gaps and elevated stepping stones.
   - **Chapter III — Don't Fall**: Ruined valley over dark thorns, introducing precision and checkpoints.
   - **Chapter IV — Moving Away**: Chasm with floating moving platforms requiring momentum timing.
   - **Chapter V — The Distance**: Deep misty forest with branching canopy routes and hidden collectibles.
   - **Chapter VI — Fading Light**: Atmospheric twilight with illuminated safe zones.
   - **Chapter VII — Broken Memories**: Abandoned ruins with crumbling stone platforms.
   - **Chapter VIII — Almost There**: Sky bridges combining moving platforms, spikes, and crumbling stones.
   - **Chapter IX — Don't Give Up**: Dark torrential rainstorm gauntlet testing full player mastery.
   - **Chapter X — Goodbye**: Return to the peaceful cliffside under the giant moon, leading into the emotional final cinematic revelation.

4. **Procedural Web Audio Engine**
   - 100% self-contained synthesized soundtrack and sound effects using the Web Audio API (zero external audio dependencies).
   - Melodic piano and atmospheric chord progressions that adapt across levels (Peaceful, Melancholy, Darkness, Tension, and Finale).
   - Procedural sound effects: jump whoosh, footstep impact, memory chime cascade, singing bowl checkpoint chime, crumbling stone crackle, and glass dissolution death sound.

5. **Integrated Narrative & Emotional Climax**
   - 10 collectible Memory Fragments with unique lore cards.
   - Poignant in-game narrative banners.
   - Multi-phase final cinematic with slow motion, particle dissolution, and the core revelation:
     - *"I kept running because I thought you were waiting for me."*
     - *"Some distances cannot be crossed."*
     - *"Thank you for remembering her."*

6. **Desktop & Mobile Multi-Touch Support**
   - **Desktop Controls**:
     - `A` / `D` or `←` / `→`: Move Left / Right
     - `Space` / `W` / `↑`: Jump
     - `Esc` / `P`: Pause / Resume
     - `R`: Restart Chapter
   - **Mobile Touch Controls**:
     - Ergonomic on-screen virtual controls for Left, Right, Jump, and Pause.
     - Multi-touch Pointer Events (enables holding movement while jumping).
     - Responsive canvas scaling across phones, tablets, and desktop displays.

7. **Save System & Settings**
   - Versioned `localStorage` schema saving unlocked levels, completed chapters, collected memory fragments, volume sliders, screen shake, and reduced motion options.
   - Reset progress option with confirmation dialog.

---

## ✦ Project Structure

```
/
├── index.html              # Main HTML entry point and UI modals
├── README.md               # Documentation
├── css/
│   ├── styles.css          # Typography, theme variables, menus, modals, ending screen
│   └── game.css            # Canvas viewport, HUD, touch controls, toast notifications
├── js/
│   ├── save-system.js      # LocalStorage progress and settings management
│   ├── audio.js            # Procedural Web Audio synthesizer and SFX engine
│   ├── input.js            # Unified keyboard and multi-touch pointer event manager
│   ├── camera.js           # Smooth following camera, lookahead, and screen shake
│   ├── physics.js          # Kinematic movement, AABB collisions, and coyote time
│   ├── entities.js         # Player, Girl, Platforms, Checkpoints, Collectibles, Particles
│   ├── levels.js           # 10 complete chapter layouts and coordinate data
│   ├── renderer.js         # Parallax backgrounds, weather effects, and lighting
│   ├── story.js            # Narrative fragments, memory lore, and ending sequence
│   ├── ui.js               # Menus, level select grid, HUD, pause, and modals
│   ├── game.js             # Master GameEngine loop, state machine, and entity lifecycles
│   └── main.js             # App bootstrapping and audio unlock hooks
└── assets/                 # Custom visual assets and icons
```

---

## ✦ How to Run Locally

Because the game is built with standard web standards and requires zero build tools:

1. **Option A: Via XAMPP / Apache**
   - Place this directory in your web root: `c:\xampp\htdocs\dont-let-her-fall`.
   - Start Apache from the XAMPP Control Panel.
   - Open your browser and navigate to: `http://localhost/dont-let-her-fall/`.

2. **Option B: Using Node.js**
   ```bash
   npx serve .
   # Or using Python:
   python -m http.server 8080
   ```
   Open `http://localhost:8080` in any modern desktop or mobile browser.

3. **Deploying to Static Hosting**
   - The game has zero server requirements or databases. You can directly deploy the repository to GitHub Pages, Cloudflare Pages, Vercel, Netlify, or any static web host.

---

## ✦ Developer Debug Cheats
Open your browser developer console (`F12`) on the game page:
- `window.unlockAllLevels()`: Instantly unlocks and completes all 10 chapters for testing.
- `window.gameEngine.startLevel(n)`: Jumps directly to Chapter `n` (1-10).
- `window.gameStory.startEndingCinematic()`: Triggers the final ending sequence.
