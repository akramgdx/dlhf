/**
 * DON'T LET HER FALL - Level Data & Configurations
 * Defines all 10 complete, playable platformer chapters with progressive mechanics,
 * custom platform coordinates, hazards, collectibles, checkpoints, and story beats.
 */

const GAME_LEVELS = [
  // ==========================================================================
  // LEVEL 1: THE BEGINNING
  // ==========================================================================
  {
    id: 1,
    name: "The Beginning",
    subtitle: "Chapter I",
    theme: "peaceful",
    weather: "fireflies",
    skyGradient: ["#070b19", "#0e1533", "#1a234f"],
    worldWidth: 1600,
    worldHeight: 700,
    playerStart: { x: 80, y: 460 },
    platforms: [
      // Safe, wide starting grassy ground
      { x: 0, y: 520, width: 450, height: 180 },
      // Gentle stepped mounds
      { x: 500, y: 480, width: 220, height: 220 },
      { x: 770, y: 440, width: 240, height: 260 },
      // Elevated peaceful ridge
      { x: 1060, y: 400, width: 250, height: 300 },
      // Final gentle overlook where the girl stands
      { x: 1360, y: 380, width: 240, height: 320 }
    ],
    movingPlatforms: [],
    crumblingPlatforms: [],
    spikes: [],
    checkpoints: [
      { x: 790, y: 400, id: "cp_1_1" }
    ],
    collectibles: [
      { x: 600, y: 420, id: "mem_1", name: "A Folded Note", icon: "note" }
    ],
    girl: { x: 1480, y: 334 },
    storyPrompt: "Follow the distant light across the hills.",
    narrativeQuote: "I saw you through the mist. You didn't wave, but you didn't run away."
  },

  // ==========================================================================
  // LEVEL 2: FIRST STEP
  // ==========================================================================
  {
    id: 2,
    name: "First Step",
    subtitle: "Chapter II",
    theme: "peaceful",
    weather: "leaves",
    skyGradient: ["#080d21", "#121a3e", "#202c5c"],
    worldWidth: 1900,
    worldHeight: 750,
    playerStart: { x: 80, y: 480 },
    platforms: [
      { x: 0, y: 540, width: 320, height: 210 },
      // Wider gaps requiring controlled jumps
      { x: 400, y: 510, width: 180, height: 240 },
      { x: 650, y: 460, width: 170, height: 290 },
      // Stepping stones
      { x: 880, y: 410, width: 140, height: 340 },
      { x: 1080, y: 450, width: 200, height: 300 },
      // Upper path with collectible (reachable from p3 at y: 410 or p4 at y: 450)
      { x: 1060, y: 370, width: 160, height: 20, oneWay: true },
      // Descending path
      { x: 1340, y: 420, width: 220, height: 330 },
      // Arch overlook
      { x: 1620, y: 390, width: 280, height: 360 }
    ],
    movingPlatforms: [],
    crumblingPlatforms: [],
    spikes: [],
    checkpoints: [
      { x: 890, y: 370, id: "cp_2_1" }
    ],
    collectibles: [
      { x: 1140, y: 310, id: "mem_2", name: "Pale Blue Ribbon", icon: "ribbon" }
    ],
    girl: { x: 1760, y: 344 },
    storyPrompt: "Wider gaps appear. Leap with conviction.",
    narrativeQuote: "Your favorite song still echoes here. I hum it when the road gets too quiet."
  },

  // ==========================================================================
  // LEVEL 3: DON'T FALL
  // ==========================================================================
  {
    id: 3,
    name: "Don't Fall",
    subtitle: "Chapter III",
    theme: "melancholy",
    weather: "mist",
    skyGradient: ["#060918", "#0f1638", "#182046"],
    worldWidth: 2200,
    worldHeight: 800,
    playerStart: { x: 80, y: 500 },
    platforms: [
      { x: 0, y: 560, width: 280, height: 240 },
      // Platforms with spikes in the pits below
      { x: 360, y: 530, width: 160, height: 270 },
      { x: 600, y: 480, width: 180, height: 320 },
      // Checkpoint ridge
      { x: 860, y: 460, width: 220, height: 340 },
      // Tight jumps over thorns
      { x: 1160, y: 440, width: 120, height: 360 },
      { x: 1350, y: 400, width: 130, height: 400 },
      { x: 1550, y: 440, width: 160, height: 360 },
      // End cliff
      { x: 1780, y: 410, width: 420, height: 390 }
    ],
    movingPlatforms: [],
    crumblingPlatforms: [],
    spikes: [
      { x: 280, y: 640, width: 80, height: 30 },
      { x: 520, y: 640, width: 80, height: 30 },
      { x: 780, y: 640, width: 80, height: 30 },
      { x: 1080, y: 640, width: 80, height: 30 },
      { x: 1280, y: 640, width: 70, height: 30 },
      { x: 1480, y: 640, width: 70, height: 30 }
    ],
    checkpoints: [
      { x: 880, y: 420, id: "cp_3_1" },
      { x: 1560, y: 400, id: "cp_3_2" }
    ],
    collectibles: [
      { x: 1390, y: 340, id: "mem_3", name: "Dried Forget-Me-Not", icon: "flower" }
    ],
    girl: { x: 2020, y: 364 },
    storyPrompt: "Dark thorns line the pits. Precision is everything.",
    narrativeQuote: "Every step feels heavier now, but stopping hurts much worse."
  },

  // ==========================================================================
  // LEVEL 4: MOVING AWAY
  // ==========================================================================
  {
    id: 4,
    name: "Moving Away",
    subtitle: "Chapter IV",
    theme: "melancholy",
    weather: "mist",
    skyGradient: ["#050816", "#0c122e", "#161b3d"],
    worldWidth: 2400,
    worldHeight: 800,
    playerStart: { x: 80, y: 460 },
    platforms: [
      { x: 0, y: 520, width: 260, height: 280 },
      // Middle stable island
      { x: 920, y: 480, width: 220, height: 320 },
      // Third island
      { x: 1700, y: 440, width: 200, height: 360 },
      // Goal platform
      { x: 2080, y: 400, width: 320, height: 400 }
    ],
    movingPlatforms: [
      // Horizontal moving bridge 1
      { x: 340, y: 500, width: 130, height: 20, targetX: 740, targetY: 500, speed: 70 },
      // Vertical moving lift
      { x: 1220, y: 480, width: 120, height: 20, targetX: 1220, targetY: 340, speed: 50 },
      // Horizontal moving bridge 2
      { x: 1400, y: 380, width: 130, height: 20, targetX: 1620, targetY: 380, speed: 65 },
      // Final moving step
      { x: 1940, y: 420, width: 110, height: 20, targetX: 2030, targetY: 420, speed: 60 }
    ],
    crumblingPlatforms: [],
    spikes: [
      { x: 260, y: 720, width: 660, height: 30 },
      { x: 1140, y: 720, width: 560, height: 30 },
      { x: 1900, y: 720, width: 180, height: 30 }
    ],
    checkpoints: [
      { x: 940, y: 440, id: "cp_4_1" },
      { x: 1720, y: 400, id: "cp_4_2" }
    ],
    collectibles: [
      { x: 1270, y: 280, id: "mem_4", name: "Silver Music Box", icon: "musicbox" }
    ],
    girl: { x: 2250, y: 354 },
    storyPrompt: "Moving stones bridge the chasm. Time your leaps.",
    narrativeQuote: "You used to say distance is only in the mind. Why does it feel like oceans between us?"
  },

  // ==========================================================================
  // LEVEL 5: THE DISTANCE
  // ==========================================================================
  {
    id: 5,
    name: "The Distance",
    subtitle: "Chapter V",
    theme: "melancholy",
    weather: "fireflies",
    skyGradient: ["#070a1a", "#121430", "#1e1d44"],
    worldWidth: 2600,
    worldHeight: 850,
    playerStart: { x: 80, y: 520 },
    platforms: [
      { x: 0, y: 580, width: 260, height: 270 },
      { x: 330, y: 540, width: 150, height: 310 },
      // Branching tree paths: lower path
      { x: 550, y: 570, width: 160, height: 280 },
      // Upper branch path (secret route to photograph)
      { x: 490, y: 470, width: 150, height: 20, oneWay: true },
      { x: 720, y: 410, width: 150, height: 20, oneWay: true },
      // Midground check
      { x: 1020, y: 490, width: 220, height: 360 },
      // High branch
      { x: 1320, y: 440, width: 150, height: 410 },
      { x: 1540, y: 390, width: 140, height: 460 },
      { x: 1740, y: 470, width: 180, height: 380 },
      // Forest exit
      { x: 2240, y: 420, width: 360, height: 430 }
    ],
    movingPlatforms: [
      { x: 1960, y: 460, width: 120, height: 20, targetX: 2180, targetY: 430, speed: 70 }
    ],
    crumblingPlatforms: [],
    spikes: [
      { x: 260, y: 740, width: 760, height: 30 },
      { x: 1240, y: 740, width: 80, height: 30 },
      { x: 1680, y: 740, width: 60, height: 30 },
      { x: 1920, y: 740, width: 320, height: 30 }
    ],
    checkpoints: [
      { x: 1040, y: 450, id: "cp_5_1" },
      { x: 1760, y: 430, id: "cp_5_2" }
    ],
    collectibles: [
      { x: 795, y: 350, id: "mem_5", name: "Faded Photograph", icon: "photo" }
    ],
    girl: { x: 2420, y: 374 },
    storyPrompt: "Ancient branches hide forgotten trails.",
    narrativeQuote: "I found your ribbon tangled in the brambles. It still smells like summer rain."
  },

  // ==========================================================================
  // LEVEL 6: FADING LIGHT
  // ==========================================================================
  {
    id: 6,
    name: "Fading Light",
    subtitle: "Chapter VI",
    theme: "darkness",
    weather: "mist",
    skyGradient: ["#03050e", "#080c1d", "#0e1329"],
    worldWidth: 2600,
    worldHeight: 850,
    playerStart: { x: 80, y: 480 },
    platforms: [
      { x: 0, y: 540, width: 260, height: 310 },
      // Stepping in dark twilight
      { x: 340, y: 510, width: 130, height: 340 },
      { x: 540, y: 460, width: 140, height: 390 },
      { x: 750, y: 430, width: 180, height: 420 },
      // Lantern checkpoint
      { x: 1020, y: 470, width: 220, height: 380 },
      // Narrow pillars
      { x: 1320, y: 450, width: 100, height: 400 },
      { x: 1500, y: 400, width: 100, height: 450 },
      { x: 1680, y: 440, width: 110, height: 410 },
      // High ruins
      { x: 1860, y: 380, width: 160, height: 470 },
      // Exit overlook
      { x: 2260, y: 390, width: 340, height: 460 }
    ],
    movingPlatforms: [
      { x: 2060, y: 390, width: 120, height: 20, targetX: 2210, targetY: 390, speed: 60 }
    ],
    crumblingPlatforms: [],
    spikes: [
      { x: 260, y: 760, width: 80, height: 30 },
      { x: 470, y: 760, width: 70, height: 30 },
      { x: 680, y: 760, width: 70, height: 30 },
      { x: 930, y: 760, width: 90, height: 30 },
      { x: 1240, y: 760, width: 620, height: 30 },
      { x: 2020, y: 760, width: 240, height: 30 }
    ],
    checkpoints: [
      { x: 1040, y: 430, id: "cp_6_1" },
      { x: 1880, y: 340, id: "cp_6_2" }
    ],
    collectibles: [
      { x: 1540, y: 330, id: "mem_6", name: "Silver Locket", icon: "locket" }
    ],
    girl: { x: 2440, y: 344 },
    storyPrompt: "Follow the glowing lanterns through the dark.",
    narrativeQuote: "The path is growing dim. Sometimes I wonder if I am chasing a shadow."
  },

  // ==========================================================================
  // LEVEL 7: BROKEN MEMORIES
  // ==========================================================================
  {
    id: 7,
    name: "Broken Memories",
    subtitle: "Chapter VII",
    theme: "darkness",
    weather: "mist",
    skyGradient: ["#02040b", "#060a19", "#0c1024"],
    worldWidth: 2800,
    worldHeight: 850,
    playerStart: { x: 80, y: 480 },
    platforms: [
      { x: 0, y: 540, width: 260, height: 310 },
      // Solid rests between collapsing sequences
      { x: 800, y: 500, width: 180, height: 350 },
      { x: 1540, y: 460, width: 200, height: 390 },
      // Final platform
      { x: 2440, y: 400, width: 360, height: 450 }
    ],
    movingPlatforms: [],
    crumblingPlatforms: [
      // Sequence 1: crumbling bridge
      { x: 320, y: 530, width: 110, height: 20 },
      { x: 480, y: 510, width: 110, height: 20 },
      { x: 640, y: 490, width: 110, height: 20 },

      // Sequence 2: rising crumbling staircase
      { x: 1040, y: 480, width: 100, height: 20 },
      { x: 1190, y: 440, width: 100, height: 20 },
      { x: 1350, y: 410, width: 100, height: 20 },

      // Sequence 3: final long crumbling gauntlet
      { x: 1800, y: 450, width: 110, height: 20 },
      { x: 1960, y: 430, width: 110, height: 20 },
      { x: 2130, y: 410, width: 110, height: 20 },
      { x: 2290, y: 390, width: 100, height: 20 }
    ],
    spikes: [
      { x: 260, y: 760, width: 540, height: 30 },
      { x: 980, y: 760, width: 560, height: 30 },
      { x: 1740, y: 760, width: 700, height: 30 }
    ],
    checkpoints: [
      { x: 820, y: 460, id: "cp_7_1" },
      { x: 1560, y: 420, id: "cp_7_2" }
    ],
    collectibles: [
      { x: 1230, y: 370, id: "mem_7", name: "Torn Diary Page", icon: "note" }
    ],
    girl: { x: 2600, y: 354 },
    storyPrompt: "Crumbling stones shatter beneath your feet. Keep moving forward.",
    narrativeQuote: "The memories are breaking apart. Was it really you who left, or was it me?"
  },

  // ==========================================================================
  // LEVEL 8: ALMOST THERE
  // ==========================================================================
  {
    id: 8,
    name: "Almost There",
    subtitle: "Chapter VIII",
    theme: "tension",
    weather: "mist",
    skyGradient: ["#020309", "#080c1f", "#141738"],
    worldWidth: 3000,
    worldHeight: 900,
    playerStart: { x: 80, y: 520 },
    platforms: [
      { x: 0, y: 580, width: 240, height: 320 },
      // Checkpoint 1
      { x: 780, y: 520, width: 180, height: 380 },
      // Checkpoint 2
      { x: 1680, y: 460, width: 180, height: 440 },
      // High bridge end
      { x: 2600, y: 390, width: 400, height: 510 }
    ],
    movingPlatforms: [
      { x: 300, y: 560, width: 110, height: 20, targetX: 470, targetY: 530, speed: 70 },
      { x: 1020, y: 510, width: 110, height: 20, targetX: 1220, targetY: 460, speed: 65 },
      { x: 1920, y: 460, width: 110, height: 20, targetX: 2080, targetY: 400, speed: 75 },
      { x: 2360, y: 410, width: 120, height: 20, targetX: 2520, targetY: 410, speed: 65 }
    ],
    crumblingPlatforms: [
      { x: 620, y: 530, width: 100, height: 20 },
      { x: 1380, y: 460, width: 90, height: 20 },
      { x: 1520, y: 460, width: 90, height: 20 },
      { x: 2200, y: 400, width: 100, height: 20 }
    ],
    spikes: [
      { x: 240, y: 800, width: 540, height: 30 },
      { x: 960, y: 800, width: 720, height: 30 },
      { x: 1860, y: 800, width: 740, height: 30 }
    ],
    checkpoints: [
      { x: 800, y: 480, id: "cp_8_1" },
      { x: 1700, y: 420, id: "cp_8_2" }
    ],
    collectibles: [
      { x: 1420, y: 390, id: "mem_8", name: "Porcelain Hairclip", icon: "hairclip" }
    ],
    girl: { x: 2800, y: 344 },
    storyPrompt: "Moving platforms and crumbling stones test your mastery.",
    narrativeQuote: "I can see you clearly now. Just a little further. Please, just wait for me."
  },

  // ==========================================================================
  // LEVEL 9: DON'T GIVE UP
  // ==========================================================================
  {
    id: 9,
    name: "Don't Give Up",
    subtitle: "Chapter IX",
    theme: "tension",
    weather: "rain",
    skyGradient: ["#010207", "#050814", "#0b0f24"],
    worldWidth: 3200,
    worldHeight: 900,
    playerStart: { x: 80, y: 520 },
    platforms: [
      { x: 0, y: 580, width: 240, height: 320 },
      // Safe resting points between storms
      { x: 740, y: 540, width: 160, height: 360 },
      { x: 1480, y: 480, width: 170, height: 420 },
      { x: 2240, y: 440, width: 180, height: 460 },
      // Sanctuary cliff
      { x: 2820, y: 390, width: 380, height: 510 }
    ],
    movingPlatforms: [
      { x: 300, y: 560, width: 100, height: 20, targetX: 440, targetY: 530, speed: 75 },
      { x: 1000, y: 510, width: 100, height: 20, targetX: 1140, targetY: 460, speed: 70 },
      { x: 1720, y: 470, width: 100, height: 20, targetX: 1860, targetY: 420, speed: 75 },
      { x: 2470, y: 430, width: 110, height: 20, targetX: 2720, targetY: 410, speed: 80 }
    ],
    crumblingPlatforms: [
      { x: 570, y: 540, width: 110, height: 20 },
      { x: 1260, y: 470, width: 110, height: 20 },
      { x: 2000, y: 440, width: 110, height: 20 }
    ],
    spikes: [
      { x: 240, y: 820, width: 500, height: 30 },
      { x: 900, y: 820, width: 580, height: 30 },
      { x: 1650, y: 820, width: 590, height: 30 },
      { x: 2420, y: 820, width: 400, height: 30 }
    ],
    checkpoints: [
      { x: 760, y: 500, id: "cp_9_1" },
      { x: 1500, y: 440, id: "cp_9_2" },
      { x: 2260, y: 400, id: "cp_9_3" }
    ],
    collectibles: [
      { x: 1290, y: 400, id: "mem_9", name: "Glass Star Bottle", icon: "bottle" }
    ],
    girl: { x: 3000, y: 344 },
    storyPrompt: "Rain pours down upon the ruins. Stand firm.",
    narrativeQuote: "The storm won't let me breathe. But even if my hands bleed, I won't turn back."
  },

  // ==========================================================================
  // LEVEL 10: GOODBYE
  // ==========================================================================
  {
    id: 10,
    name: "Goodbye",
    subtitle: "Chapter X",
    theme: "ending",
    weather: "fireflies",
    skyGradient: ["#050819", "#0b1233", "#17204e"],
    worldWidth: 2000,
    worldHeight: 750,
    playerStart: { x: 80, y: 480 },
    platforms: [
      // Serene return to the beautiful moonlit hilltop from Level 1
      { x: 0, y: 540, width: 340, height: 210 },
      { x: 420, y: 500, width: 220, height: 250 },
      { x: 720, y: 460, width: 220, height: 290 },
      { x: 1020, y: 420, width: 240, height: 330 },
      // The final cliff where she stands under the gigantic full moon
      { x: 1360, y: 380, width: 640, height: 370 }
    ],
    movingPlatforms: [],
    crumblingPlatforms: [],
    spikes: [],
    checkpoints: [
      { x: 740, y: 420, id: "cp_10_1" },
      { x: 1040, y: 380, id: "cp_10_2" }
    ],
    collectibles: [
      { x: 830, y: 400, id: "mem_10", name: "An Unopened Letter", icon: "letter" }
    ],
    girl: { x: 1680, y: 334 },
    storyPrompt: "You have reached the end of the road.",
    narrativeQuote: "I reached the edge. You are right in front of me..."
  }
];

// Helper query functions
window.GAME_LEVELS = GAME_LEVELS;
window.getLevelData = function(levelId) {
  return GAME_LEVELS.find(lvl => lvl.id === levelId) || GAME_LEVELS[0];
};
