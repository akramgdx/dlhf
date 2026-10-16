/**
 * DON'T LET HER FALL - Core Game Engine
 * Orchestrates game state, requestAnimationFrame loop with clamped delta time,
 * entity updates, level transitions, checkpoints, hazards, and completion conditions.
 */
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new GameRenderer(this.canvas);
    this.camera = window.gameCamera;
    this.particles = new ParticleSystem(700);

    // Game States: 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_COMPLETE', 'ENDING'
    this.state = 'MENU';
    window.gameState = this.state;

    this.currentLevelId = 1;
    this.levelData = null;

    // Entities
    this.player = null;
    this.girl = null;
    this.platforms = [];
    this.movingPlatforms = [];
    this.crumblingPlatforms = [];
    this.spikes = [];
    this.checkpoints = [];
    this.collectibles = [];

    // Loop timing
    this.lastTime = performance.now();
    this.isRunning = false;

    // Level completion transition flag
    this.isLevelFinishing = false;
  }

  init() {
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  startLevel(levelId) {
    this.currentLevelId = Math.max(1, Math.min(10, levelId));
    this.levelData = window.getLevelData(this.currentLevelId);
    if (!this.levelData) return;

    this.state = 'PLAYING';
    window.gameState = this.state;
    this.isLevelFinishing = false;

    // Set camera bounds for level dimensions
    this.camera.setBounds(0, 0, this.levelData.worldWidth, this.levelData.worldHeight);

    // 1. Initialize Player
    const pStart = this.levelData.playerStart || { x: 100, y: 300 };
    this.player = new Player(pStart.x, pStart.y);
    this.camera.reset(pStart.x, pStart.y);

    // 2. Initialize Girl
    const gPos = this.levelData.girl || { x: this.levelData.worldWidth - 150, y: 300 };
    this.girl = new Girl(gPos.x, gPos.y);

    // 3. Initialize Platforms & Geometry
    this.platforms = (this.levelData.platforms || []).map(p => ({ ...p }));

    // 4. Initialize Moving Platforms
    this.movingPlatforms = (this.levelData.movingPlatforms || []).map(
      mp => new MovingPlatform(mp.x, mp.y, mp.width, mp.height, mp.targetX, mp.targetY, mp.speed)
    );

    // 5. Initialize Crumbling Platforms
    this.crumblingPlatforms = (this.levelData.crumblingPlatforms || []).map(
      cp => new CrumblingPlatform(cp.x, cp.y, cp.width, cp.height)
    );

    // 6. Initialize Spikes
    this.spikes = (this.levelData.spikes || []).map(s => ({ ...s }));

    // 7. Initialize Checkpoints
    this.checkpoints = (this.levelData.checkpoints || []).map(
      cp => new Checkpoint(cp.x, cp.y, cp.id)
    );

    // 8. Initialize Collectibles
    this.collectibles = (this.levelData.collectibles || []).map(c => {
      const col = new MemoryCollectible(c.x, c.y, c.id, c.name, c.icon);
      if (window.gameSave && window.gameSave.isMemoryCollected(this.currentLevelId, c.id)) {
        col.isCollected = true;
      }
      return col;
    });

    // Reset particles
    this.particles.clear();

    // Hide UI menus, show HUD & touch controls
    if (window.gameUI) {
      window.gameUI.screens.mainMenu.classList.add('hidden');
      window.gameUI.screens.pause.classList.add('hidden');
      window.gameUI.screens.levelComplete.classList.add('hidden');
      window.gameUI.screens.ending.classList.add('hidden');
      this.updateHUDProgress();
    }

    if (window.gameInput) {
      window.gameInput.showTouchControls(true);
    }

    // Play appropriate music theme
    if (window.gameAudio) {
      window.gameAudio.playTheme(this.levelData.theme || 'peaceful');
    }

    // Display introductory story prompt
    if (window.gameStory && this.levelData.storyPrompt) {
      window.gameStory.showBanner(this.levelData.storyPrompt, 5);
    }
  }

  updateHUDProgress() {
    if (!window.gameUI || !this.levelData) return;
    const total = (this.levelData.collectibles || []).length;
    const collected = window.gameSave ? window.gameSave.getMemoriesForLevel(this.currentLevelId).length : 0;
    window.gameUI.updateHUD(this.levelData, collected, total);
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    window.gameState = this.state;
    if (window.gameUI) {
      window.gameUI.openScreen('pause');
    }
    if (window.gameInput) {
      window.gameInput.showTouchControls(false);
    }
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    window.gameState = this.state;
    if (window.gameUI) {
      window.gameUI.closeScreen('pause');
    }
    if (window.gameInput) {
      window.gameInput.showTouchControls(true);
    }
  }

  restartCurrentLevel() {
    this.startLevel(this.currentLevelId);
  }

  advanceToNextLevel() {
    if (this.currentLevelId === 10) {
      this.triggerEndingCinematic();
    } else {
      this.startLevel(this.currentLevelId + 1);
    }
  }

  returnToMainMenu() {
    this.state = 'MENU';
    window.gameState = this.state;
    this.isLevelFinishing = false;

    if (window.gameUI) {
      window.gameUI.hideHUD();
      window.gameUI.hideAllModals();
      window.gameUI.screens.mainMenu.classList.remove('hidden');
    }
    if (window.gameStory) {
      window.gameStory.hideBanner();
    }
    if (window.gameInput) {
      window.gameInput.showTouchControls(false);
    }
    if (window.gameAudio) {
      window.gameAudio.playTheme('menu');
    }
  }

  triggerLevelComplete() {
    if (this.isLevelFinishing) return;
    this.isLevelFinishing = true;

    // Trigger Girl fade
    if (this.girl) {
      this.girl.triggerFade(this.particles);
    }

    // Play level complete chime
    if (window.gameAudio) {
      window.gameAudio.playLevelComplete();
    }

    // Save completion
    if (window.gameSave) {
      window.gameSave.completeLevel(this.currentLevelId);
    }

    // After brief pause, show level complete modal or transition to ending
    setTimeout(() => {
      if (this.state !== 'PLAYING') return;

      if (this.currentLevelId === 10) {
        this.triggerEndingCinematic();
      } else {
        this.state = 'LEVEL_COMPLETE';
        window.gameState = this.state;
        if (window.gameInput) window.gameInput.showTouchControls(false);
        const total = (this.levelData.collectibles || []).length;
        const collected = window.gameSave ? window.gameSave.getMemoriesForLevel(this.currentLevelId).length : 0;
        if (window.gameUI) {
          window.gameUI.showLevelCompleteModal(this.levelData, collected, total);
        }
      }
    }, 1200);
  }

  triggerEndingCinematic() {
    this.state = 'ENDING';
    window.gameState = this.state;

    if (window.gameUI) {
      window.gameUI.hideHUD();
      window.gameUI.hideAllModals();
    }
    if (window.gameInput) {
      window.gameInput.showTouchControls(false);
    }

    if (window.gameStory) {
      window.gameStory.startEndingCinematic();
    }
  }

  // ==========================================================================
  // MAIN GAME LOOP
  // ==========================================================================

  loop(currentTime) {
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp dt to avoid physics tunneling during tab freeze
    const dt = Math.max(0.001, Math.min(0.08, rawDt));

    // Input state updates
    if (window.gameInput) {
      // Global Pause check
      if (window.gameInput.isPauseJustPressed()) {
        if (this.state === 'PLAYING') this.pauseGame();
        else if (this.state === 'PAUSED') this.resumeGame();
      }
      // Global Restart check
      if (window.gameInput.isRestartJustPressed() && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
        this.restartCurrentLevel();
      }
    }

    // Update
    this.update(dt);

    // Render
    this.render();

    // Clear single-frame triggers
    if (window.gameInput) {
      window.gameInput.update(dt);
    }

    if (this.isRunning) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  update(dt) {
    if (this.state === 'MENU') {
      return; // Handled in renderer.renderMainMenuBackdrop
    }

    if (this.state === 'PAUSED' || this.state === 'LEVEL_COMPLETE' || this.state === 'ENDING') {
      return;
    }

    // 1. Update Entities
    this.renderer.updateWeather(dt, this.levelData.weather || 'fireflies');
    this.particles.update(dt);

    for (const mp of this.movingPlatforms) {
      mp.update(dt);
    }

    for (const cp of this.crumblingPlatforms) {
      cp.update(dt, this.particles);
    }

    for (const cp of this.checkpoints) {
      cp.update(dt, this.particles);
    }

    for (const col of this.collectibles) {
      col.update(dt, this.particles);
    }

    if (this.girl) {
      this.girl.update(dt, this.particles);
    }

    // 2. Update Player
    if (this.player) {
      this.player.update(
        dt,
        window.gameInput,
        this.platforms,
        this.movingPlatforms,
        this.crumblingPlatforms,
        this.particles
      );

      // Hazard Collision (Spikes)
      for (const s of this.spikes) {
        if (Physics.checkHazardCollision(this.player, s)) {
          this.player.kill(this.particles);
          break;
        }
      }

      // Void death (falling off bottom of world)
      if (this.player.y > this.levelData.worldHeight + 80) {
        this.player.kill(this.particles);
      }

      // Checkpoint Trigger
      for (const cp of this.checkpoints) {
        if (!cp.isActive && Physics.aabbIntersect(this.player, cp)) {
          cp.activate(this.particles);
          this.player.setSpawn(cp.x, cp.y);
          if (window.gameUI) {
            window.gameUI.showToast("Checkpoint Reached");
          }
        }
      }

      // Collectible Trigger
      for (const col of this.collectibles) {
        if (!col.isCollected && Physics.aabbIntersect(this.player, col)) {
          col.collect(this.particles);
          if (window.gameSave) {
            window.gameSave.collectMemory(this.currentLevelId, col.id);
          }
          this.updateHUDProgress();
          if (window.gameStory) {
            window.gameStory.showMemoryPrompt(col.id);
          }
        }
      }

      // Goal Reach (The Girl)
      if (this.girl && !this.isLevelFinishing) {
        const dist = Math.hypot(
          (this.player.x + this.player.width / 2) - (this.girl.x + this.girl.width / 2),
          (this.player.y + this.player.height / 2) - (this.girl.y + this.girl.height / 2)
        );
        if (dist < 46) {
          this.triggerLevelComplete();
        }
      }

      // 3. Update Camera
      this.camera.update(dt, this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.player.vx);
    }
  }

  render() {
    const ctx = this.renderer.ctx;
    const vw = this.renderer.viewportWidth;
    const vh = this.renderer.viewportHeight;

    if (this.state === 'MENU') {
      this.renderer.renderMainMenuBackdrop(0.016);
      return;
    }

    // Active Gameplay Rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.scale(dpr * (this.canvas.width / (vw * dpr)), dpr * (this.canvas.height / (vh * dpr)));

    // 1. Parallax Sky & Background Layers
    this.renderer.renderBackground(this.camera, this.levelData);

    // 2. World Camera Transform
    this.camera.apply(ctx);

    // 3. Render Geometry
    this.renderer.renderPlatforms(this.platforms);
    this.renderer.renderSpikes(this.spikes);

    for (const mp of this.movingPlatforms) {
      mp.render(ctx);
    }

    for (const cp of this.crumblingPlatforms) {
      cp.render(ctx);
    }

    for (const cp of this.checkpoints) {
      cp.render(ctx);
    }

    for (const col of this.collectibles) {
      col.render(ctx);
    }

    if (this.girl) {
      this.girl.render(ctx);
    }

    if (this.player) {
      this.player.render(ctx);
    }

    // 4. World Particles
    this.particles.render(ctx);

    // Restore Camera
    this.camera.restore(ctx);

    // 5. Screen-space Weather & Atmospheric Effects
    this.renderer.renderWeather(this.levelData ? this.levelData.weather : 'fireflies');
    this.renderer.renderLighting(this.player, this.girl, this.checkpoints, this.collectibles);

    ctx.restore();
  }
}

// Global instance
window.GameEngine = GameEngine;
