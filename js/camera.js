/**
 * DON'T LET HER FALL - Camera System
 * Smooth following camera with deadzone, velocity lookahead, world bounds, and screen shake.
 */
class Camera {
  constructor(viewportWidth = 960, viewportHeight = 540) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    // Follow dynamics
    this.smoothSpeed = 5.0; // Lerp factor
    this.lookaheadDistance = 45;
    this.currentLookahead = 0;

    // World bounding box
    this.minX = 0;
    this.maxX = 3000;
    this.minY = 0;
    this.maxY = 1200;

    // Screen Shake Trauma System
    this.trauma = 0; // 0 to 1
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;
    this.maxShakeOffset = 14;
    this.maxShakeAngle = 0.04;
  }

  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setBounds(minX, minY, maxX, maxY) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = Math.max(maxX, minX + this.viewportWidth);
    this.maxY = Math.max(maxY, minY + this.viewportHeight);
  }

  reset(x, y) {
    this.x = x - this.viewportWidth * 0.4;
    this.y = y - this.viewportHeight * 0.6;
    this.currentLookahead = 0;
    this.clamp();
    this.trauma = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;
  }

  addTrauma(amount) {
    const s = window.gameSave ? window.gameSave.getSettings() : { screenShake: true, reducedMotion: false };
    if (!s.screenShake || s.reducedMotion) return;
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt, targetX, targetY, targetVx = 0) {
    // Velocity lookahead
    const targetLook = Math.sign(targetVx) * this.lookaheadDistance;
    this.currentLookahead += (targetLook - this.currentLookahead) * Math.min(1, dt * 3.5);

    // Target center coordinates
    const desiredX = (targetX + this.currentLookahead) - this.viewportWidth * 0.42;
    const desiredY = targetY - this.viewportHeight * 0.58;

    // Smooth lerp
    const lerpFactor = 1 - Math.exp(-this.smoothSpeed * dt);
    this.x += (desiredX - this.x) * lerpFactor;
    this.y += (desiredY - this.y) * lerpFactor;

    this.clamp();

    // Process screen shake
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.5);
      const shakePower = this.trauma * this.trauma; // Non-linear decay
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.maxShakeOffset * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.maxShakeOffset * shakePower;
      this.shakeAngle = (Math.random() * 2 - 1) * this.maxShakeAngle * shakePower;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAngle = 0;
    }
  }

  clamp() {
    const clampMaxX = Math.max(this.minX, this.maxX - this.viewportWidth);
    const clampMaxY = Math.max(this.minY, this.maxY - this.viewportHeight);

    this.x = Math.max(this.minX, Math.min(this.x, clampMaxX));
    this.y = Math.max(this.minY, Math.min(this.y, clampMaxY));
  }

  apply(ctx) {
    ctx.save();
    // Center of screen for rotational shake
    const cx = this.viewportWidth * 0.5;
    const cy = this.viewportHeight * 0.5;

    ctx.translate(cx, cy);
    if (this.shakeAngle !== 0) {
      ctx.rotate(this.shakeAngle);
    }
    ctx.translate(-cx, -cy);

    // Camera translation
    ctx.translate(
      -Math.round(this.x + this.shakeOffsetX),
      -Math.round(this.y + this.shakeOffsetY)
    );
  }

  restore(ctx) {
    ctx.restore();
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x + this.shakeOffsetX,
      y: screenY + this.y + this.shakeOffsetY
    };
  }
}

// Global instance
window.gameCamera = new Camera();
