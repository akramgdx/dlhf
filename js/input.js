/**
 * DON'T LET HER FALL - Input Manager
 * Handles desktop keyboard inputs, mobile multi-touch pointer events, and gamepad support.
 */
class InputManager {
  constructor() {
    // Current input states
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      pause: false,
      restart: false,
      action: false
    };

    // Single-frame edge triggers
    this.justPressed = {
      jump: false,
      pause: false,
      restart: false,
      action: false
    };

    // Jump buffering
    this.jumpBufferTimer = 0;
    this.JUMP_BUFFER_WINDOW = 0.14; // 140ms jump buffer

    // Active touch tracking (pointerId -> action)
    this.activePointers = new Map();

    // DOM references for virtual touch buttons
    this.touchContainer = document.getElementById('touch-controls');
    this.btnTouchLeft = document.getElementById('touch-left');
    this.btnTouchRight = document.getElementById('touch-right');
    this.btnTouchJump = document.getElementById('touch-jump');

    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.enabled = true;

    this.bindEvents();
    this.setupTouchControls();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e), { passive: false });
    window.addEventListener('keyup', (e) => this.onKeyUp(e), { passive: false });

    // Window blur / visibility change resets all keys
    window.addEventListener('blur', () => this.resetInputs());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetInputs();
    });
  }

  isTyping(e) {
    const tag = e.target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
  }

  onKeyDown(e) {
    if (this.isTyping(e)) return;

    // Check gameplay keys
    let handled = false;

    switch (e.code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        handled = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        handled = true;
        break;
      case 'KeyW':
      case 'ArrowUp':
      case 'Space':
        if (!this.keys.jump) {
          this.justPressed.jump = true;
          this.jumpBufferTimer = this.JUMP_BUFFER_WINDOW;
        }
        this.keys.jump = true;
        this.keys.up = true;
        handled = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = true;
        handled = true;
        break;
      case 'Escape':
      case 'KeyP':
        this.justPressed.pause = true;
        this.keys.pause = true;
        handled = true;
        break;
      case 'KeyR':
        this.justPressed.restart = true;
        this.keys.restart = true;
        handled = true;
        break;
      case 'Enter':
        this.justPressed.action = true;
        this.keys.action = true;
        handled = true;
        break;
    }

    if (handled && window.gameState === 'PLAYING') {
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (this.isTyping(e)) return;

    switch (e.code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'KeyW':
      case 'ArrowUp':
      case 'Space':
        this.keys.jump = false;
        this.keys.up = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = false;
        break;
      case 'Escape':
      case 'KeyP':
        this.keys.pause = false;
        break;
      case 'KeyR':
        this.keys.restart = false;
        break;
      case 'Enter':
        this.keys.action = false;
        break;
    }
  }

  setupTouchControls() {
    if (!this.touchContainer) return;

    // Show touch controls if on touch-capable device
    if (this.isTouchDevice) {
      this.touchContainer.classList.remove('hidden');
    }

    const bindButton = (element, action) => {
      if (!element) return;

      const handleStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { element.setPointerCapture(e.pointerId); } catch (_) {}
        this.activePointers.set(e.pointerId, action);
        element.classList.add('active');

        if (action === 'jump') {
          this.keys.jump = true;
          this.justPressed.jump = true;
          this.jumpBufferTimer = this.JUMP_BUFFER_WINDOW;
        } else if (action === 'left') {
          this.keys.left = true;
        } else if (action === 'right') {
          this.keys.right = true;
        }
      };

      const handleEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { element.releasePointerCapture(e.pointerId); } catch (_) {}
        this.activePointers.delete(e.pointerId);
        element.classList.remove('active');

        if (action === 'jump') {
          this.keys.jump = false;
        } else if (action === 'left') {
          this.keys.left = false;
        } else if (action === 'right') {
          this.keys.right = false;
        }
      };

      element.addEventListener('pointerdown', handleStart);
      element.addEventListener('pointerup', handleEnd);
      element.addEventListener('pointercancel', handleEnd);
      element.addEventListener('lostpointercapture', handleEnd);
    };

    bindButton(this.btnTouchLeft, 'left');
    bindButton(this.btnTouchRight, 'right');
    bindButton(this.btnTouchJump, 'jump');
  }

  showTouchControls(show) {
    if (!this.touchContainer) return;
    if (show && this.isTouchDevice) {
      this.touchContainer.classList.remove('hidden');
    } else {
      this.touchContainer.classList.add('hidden');
    }
  }

  resetInputs() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
    for (const k in this.justPressed) {
      this.justPressed[k] = false;
    }
    this.activePointers.clear();
    this.jumpBufferTimer = 0;

    if (this.btnTouchLeft) this.btnTouchLeft.classList.remove('active');
    if (this.btnTouchRight) this.btnTouchRight.classList.remove('active');
    if (this.btnTouchJump) this.btnTouchJump.classList.remove('active');
  }

  update(dt) {
    // Jump buffer countdown
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.jumpBufferTimer <= 0) {
        this.jumpBufferTimer = 0;
      }
    }

    // Reset single-frame triggers
    this.justPressed.jump = false;
    this.justPressed.pause = false;
    this.justPressed.restart = false;
    this.justPressed.action = false;
  }

  hasJumpBuffered() {
    return this.jumpBufferTimer > 0;
  }

  consumeJumpBuffer() {
    this.jumpBufferTimer = 0;
  }

  isLeft() {
    return this.enabled && this.keys.left;
  }

  isRight() {
    return this.enabled && this.keys.right;
  }

  isJumpHeld() {
    return this.enabled && this.keys.jump;
  }

  isJumpJustPressed() {
    return this.enabled && (this.justPressed.jump || this.hasJumpBuffered());
  }

  isPauseJustPressed() {
    return this.justPressed.pause;
  }

  isRestartJustPressed() {
    return this.justPressed.restart;
  }

  isActionJustPressed() {
    return this.justPressed.action;
  }
}

// Global instance
window.gameInput = new InputManager();
