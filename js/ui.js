/**
 * DON'T LET HER FALL - UI Manager
 * Handles menu navigation, modal dialogs, settings bindings, level selection grid,
 * in-game HUD, pause menu, and level completion interstitials.
 */
class UIManager {
  constructor() {
    this.screens = {
      mainMenu: document.getElementById('screen-main-menu'),
      levelSelect: document.getElementById('screen-level-select'),
      story: document.getElementById('screen-story'),
      settings: document.getElementById('screen-settings'),
      credits: document.getElementById('screen-credits'),
      pause: document.getElementById('screen-pause'),
      levelComplete: document.getElementById('screen-level-complete'),
      ending: document.getElementById('screen-ending'),
      confirmModal: document.getElementById('modal-confirm')
    };

    this.hud = document.getElementById('game-hud');
    this.hudLevelTitle = document.getElementById('hud-level-title');
    this.hudMemoryCount = document.getElementById('hud-memory-count');
    this.toastNotification = document.getElementById('toast-notification');
    this.toastText = document.getElementById('toast-text');
    this.toastTimer = null;

    // Settings elements
    this.sliderMusic = document.getElementById('slider-music');
    this.labelMusicVol = document.getElementById('label-music-vol');
    this.sliderSfx = document.getElementById('slider-sfx');
    this.labelSfxVol = document.getElementById('label-sfx-vol');
    this.checkMute = document.getElementById('check-mute');
    this.checkScreenShake = document.getElementById('check-screenshake');
    this.checkReducedMotion = document.getElementById('check-reducedmotion');
    this.btnQuickMute = document.getElementById('btn-quick-mute');
    this.quickMuteLabel = document.getElementById('quick-mute-label');
    this.quickMuteIcon = document.getElementById('quick-mute-icon');

    // Level Select Grid
    this.levelGrid = document.getElementById('level-grid');

    // Confirm dialog callbacks
    this.onConfirmCallback = null;

    this.bindEvents();
    this.syncSettingsUI();
  }

  bindEvents() {
    // Main Menu Buttons
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameSave && window.gameSave.hasProgress()) {
        this.showConfirm(
          'Start a New Journey?',
          'Starting a new game will reset your chapter progress to Chapter 1. Collected memories will be reset.',
          () => {
            window.gameSave.resetProgress();
            this.hideAllModals();
            if (window.gameEngine) window.gameEngine.startLevel(1);
          }
        );
      } else {
        this.hideAllModals();
        if (window.gameEngine) window.gameEngine.startLevel(1);
      }
    });

    document.getElementById('btn-continue')?.addEventListener('click', () => {
      this.playClick();
      const current = window.gameSave ? window.gameSave.data.unlockedLevel : 1;
      this.hideAllModals();
      if (window.gameEngine) window.gameEngine.startLevel(current);
    });

    document.getElementById('btn-level-select')?.addEventListener('click', () => {
      this.playClick();
      this.openLevelSelect();
    });

    document.getElementById('btn-story')?.addEventListener('click', () => {
      this.playClick();
      this.openScreen('story');
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      this.playClick();
      this.openScreen('settings');
    });

    document.getElementById('btn-credits')?.addEventListener('click', () => {
      this.playClick();
      this.openScreen('credits');
    });

    // Close Modal Buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.playClick();
        const targetId = btn.getAttribute('data-close');
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add('hidden');
      });
    });

    // Quick Mute in footer
    this.btnQuickMute?.addEventListener('click', () => {
      if (window.gameAudio) {
        const isMuted = window.gameAudio.toggleMute();
        if (window.gameSave) {
          window.gameSave.updateSettings({ muted: isMuted });
        }
        this.syncSettingsUI();
      }
    });

    // Settings Sliders & Checkboxes
    this.sliderMusic?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) / 100;
      this.labelMusicVol.textContent = `${e.target.value}%`;
      if (window.gameAudio) window.gameAudio.setMusicVolume(val);
      if (window.gameSave) window.gameSave.updateSettings({ musicVolume: val });
    });

    this.sliderSfx?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) / 100;
      this.labelSfxVol.textContent = `${e.target.value}%`;
      if (window.gameAudio) window.gameAudio.setSfxVolume(val);
      if (window.gameSave) window.gameSave.updateSettings({ sfxVolume: val });
    });

    this.checkMute?.addEventListener('change', (e) => {
      const isMuted = e.target.checked;
      if (window.gameAudio) window.gameAudio.setMuted(isMuted);
      if (window.gameSave) window.gameSave.updateSettings({ muted: isMuted });
      this.syncSettingsUI();
    });

    this.checkScreenShake?.addEventListener('change', (e) => {
      if (window.gameSave) window.gameSave.updateSettings({ screenShake: e.target.checked });
    });

    this.checkReducedMotion?.addEventListener('change', (e) => {
      if (window.gameSave) window.gameSave.updateSettings({ reducedMotion: e.target.checked });
    });

    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      this.playClick();
      this.showConfirm(
        'Reset All Progress?',
        'This will erase all unlocked chapters and collected memories permanently.',
        () => {
          if (window.gameSave) {
            window.gameSave.resetProgress();
            this.showToast('Save progress cleared.');
            this.renderLevelGrid();
          }
        }
      );
    });

    // In-game HUD pause button
    document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine && window.gameEngine.state === 'PLAYING') {
        window.gameEngine.pauseGame();
      }
    });

    // Pause Menu actions
    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine) window.gameEngine.resumeGame();
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine) window.gameEngine.restartCurrentLevel();
    });

    document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
      this.playClick();
      this.openScreen('settings');
    });

    document.getElementById('btn-pause-level-select')?.addEventListener('click', () => {
      this.playClick();
      this.openLevelSelect();
    });

    document.getElementById('btn-pause-main-menu')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine) window.gameEngine.returnToMainMenu();
    });

    // Completion Interstitial actions
    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine) window.gameEngine.advanceToNextLevel();
    });

    document.getElementById('btn-replay-level')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine) window.gameEngine.restartCurrentLevel();
    });

    // Ending screen actions
    document.getElementById('btn-ending-replay-cinematic')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameStory) window.gameStory.startEndingCinematic();
    });

    document.getElementById('btn-ending-play-again')?.addEventListener('click', () => {
      this.playClick();
      this.hideAllModals();
      if (window.gameEngine) window.gameEngine.startLevel(1);
    });

    document.getElementById('btn-ending-level-select')?.addEventListener('click', () => {
      this.playClick();
      this.openLevelSelect();
    });

    document.getElementById('btn-ending-main-menu')?.addEventListener('click', () => {
      this.playClick();
      if (window.gameEngine) window.gameEngine.returnToMainMenu();
    });

    // Confirmation Modal actions
    document.getElementById('btn-confirm-yes')?.addEventListener('click', () => {
      this.playClick();
      this.screens.confirmModal.classList.add('hidden');
      if (this.onConfirmCallback) {
        this.onConfirmCallback();
        this.onConfirmCallback = null;
      }
    });

    document.getElementById('btn-confirm-no')?.addEventListener('click', () => {
      this.playClick();
      this.screens.confirmModal.classList.add('hidden');
      this.onConfirmCallback = null;
    });

    // Portrait dismiss button
    document.getElementById('btn-dismiss-portrait')?.addEventListener('click', () => {
      document.getElementById('portrait-hint')?.classList.add('hidden');
    });
  }

  playClick() {
    if (window.gameAudio) window.gameAudio.playUIClick();
  }

  syncSettingsUI() {
    if (!window.gameSave) return;
    const s = window.gameSave.getSettings();

    if (this.sliderMusic) {
      this.sliderMusic.value = Math.round(s.musicVolume * 100);
      if (this.labelMusicVol) this.labelMusicVol.textContent = `${this.sliderMusic.value}%`;
    }

    if (this.sliderSfx) {
      this.sliderSfx.value = Math.round(s.sfxVolume * 100);
      if (this.labelSfxVol) this.labelSfxVol.textContent = `${this.sliderSfx.value}%`;
    }

    if (this.checkMute) {
      this.checkMute.checked = s.muted;
    }

    if (this.checkScreenShake) {
      this.checkScreenShake.checked = s.screenShake;
    }

    if (this.checkReducedMotion) {
      this.checkReducedMotion.checked = s.reducedMotion;
    }

    if (this.quickMuteLabel) {
      this.quickMuteLabel.textContent = s.muted ? 'Audio: Muted' : 'Audio: Enabled';
    }
    if (this.quickMuteIcon) {
      this.quickMuteIcon.textContent = s.muted ? '🔇' : '🔊';
    }
  }

  openScreen(screenName) {
    const screenEl = this.screens[screenName];
    if (screenEl) {
      screenEl.classList.remove('hidden');
    }
  }

  closeScreen(screenName) {
    const screenEl = this.screens[screenName];
    if (screenEl) {
      screenEl.classList.add('hidden');
    }
  }

  hideAllModals() {
    for (const key in this.screens) {
      if (key !== 'mainMenu') {
        this.screens[key].classList.add('hidden');
      }
    }
  }

  showConfirm(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    this.onConfirmCallback = onConfirm;
    this.screens.confirmModal.classList.remove('hidden');
  }

  showToast(text, duration = 2.4) {
    if (!this.toastNotification || !this.toastText) return;
    this.toastText.textContent = text;
    this.toastNotification.classList.remove('hidden');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastNotification.classList.add('hidden');
    }, duration * 1000);
  }

  openLevelSelect() {
    this.renderLevelGrid();
    this.openScreen('levelSelect');
  }

  renderLevelGrid() {
    if (!this.levelGrid || !window.GAME_LEVELS) return;
    this.levelGrid.innerHTML = '';

    const unlockedMax = window.gameSave ? window.gameSave.data.unlockedLevel : 1;

    window.GAME_LEVELS.forEach(lvl => {
      const isUnlocked = lvl.id <= unlockedMax;
      const isCompleted = window.gameSave ? window.gameSave.isLevelCompleted(lvl.id) : false;
      const memories = window.gameSave ? window.gameSave.getMemoriesForLevel(lvl.id) : [];
      const hasMemory = memories.length > 0;

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${lvl.id === unlockedMax ? 'current' : ''}`;
      
      card.innerHTML = `
        <div class="level-card-number">${lvl.id}</div>
        <div class="level-card-name">${lvl.name}</div>
        <div class="level-card-status">
          ${isCompleted ? '<span>&#10003; Cleared</span>' : (isUnlocked ? '<span>Available</span>' : '<span>&#128274; Locked</span>')}
          ${hasMemory ? '<span class="memory-badge" title="Memory Found">&#9733;</span>' : ''}
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.playClick();
          this.hideAllModals();
          if (window.gameEngine) {
            window.gameEngine.startLevel(lvl.id);
          }
        });
      }

      this.levelGrid.appendChild(card);
    });
  }

  updateHUD(levelData, collectedCount, totalCount) {
    if (!this.hud) return;
    this.hud.classList.remove('hidden');
    if (this.hudLevelTitle && levelData) {
      this.hudLevelTitle.textContent = `${levelData.subtitle || ''} — ${levelData.name}`;
    }
    if (this.hudMemoryCount) {
      this.hudMemoryCount.textContent = `${collectedCount} / ${totalCount}`;
    }
  }

  hideHUD() {
    if (this.hud) this.hud.classList.add('hidden');
  }

  showLevelCompleteModal(levelData, collectedCount, totalCount) {
    document.getElementById('comp-level-num').textContent = `${levelData.subtitle.toUpperCase()} COMPLETED`;
    document.getElementById('comp-level-name').textContent = levelData.name;
    document.getElementById('comp-story-text').textContent = `"${levelData.narrativeQuote}"`;
    document.getElementById('comp-memory-stat').textContent = `${collectedCount} / ${totalCount}`;
    
    // If level 10, button says "FINALE"
    const nextBtn = document.getElementById('btn-next-level');
    if (nextBtn) {
      nextBtn.textContent = levelData.id === 10 ? "DISCOVER THE TRUTH \u2192" : "CONTINUE JOURNEY \u2192";
    }

    this.openScreen('levelComplete');
  }
}

// Global instance
window.gameUI = new UIManager();
