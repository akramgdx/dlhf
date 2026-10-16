/**
 * DON'T LET HER FALL - Application Bootstrapper
 * Initializes audio, game engine, input hooks, and orientation listeners.
 */

window.addEventListener('DOMContentLoaded', () => {
  // Initialize master game engine
  window.gameEngine = new GameEngine();
  window.gameEngine.init();

  // First interaction audio unlock
  const unlockAudio = () => {
    if (window.gameAudio) {
      window.gameAudio.init();
      if (window.gameEngine.state === 'MENU' && !window.gameAudio.currentTheme) {
        window.gameAudio.playTheme('menu');
      }
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });

  // Update Continue button label based on existing progress
  const updateContinueBtn = () => {
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue && window.gameSave) {
      if (!window.gameSave.hasProgress()) {
        btnContinue.style.opacity = '0.5';
        btnContinue.title = 'No saved journey yet';
      } else {
        btnContinue.style.opacity = '1.0';
        btnContinue.title = `Resume Chapter ${window.gameSave.data.unlockedLevel}`;
      }
    }
  };
  updateContinueBtn();

  // Check mobile device orientation
  const checkOrientation = () => {
    const portraitHint = document.getElementById('portrait-hint');
    if (!portraitHint) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 768;

    if (isPortrait && isMobile && window.gameState === 'PLAYING') {
      portraitHint.classList.remove('hidden');
    } else {
      portraitHint.classList.add('hidden');
    }
  };

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);

  // Development helper: allow unlocking all levels for testing
  window.unlockAllLevels = () => {
    if (window.gameSave) {
      for (let i = 1; i <= 10; i++) {
        window.gameSave.unlockLevel(i);
        window.gameSave.completeLevel(i);
      }
      if (window.gameUI) window.gameUI.renderLevelGrid();
      console.log("%cAll 10 chapters unlocked for testing.", "color: #bca7f8; font-weight: bold;");
    }
  };

  console.log("%cDON'T LET HER FALL%c - Initialized successfully.", "color: #bca7f8; font-weight: bold;", "color: inherit;");
});
