/**
 * DON'T LET HER FALL - Physics Engine
 * Handles kinematic body movement, variable jump gravity, coyote time, and AABB collision resolution.
 */
class Physics {
  static GRAVITY = 960;
  static LOW_JUMP_GRAVITY_MULT = 2.4;
  static MAX_FALL_SPEED = 540;
  static MOVE_ACCEL = 1600;
  static MOVE_AIR_ACCEL = 1100;
  static GROUND_FRICTION = 0.80;
  static AIR_DRAG = 0.94;
  static MAX_RUN_SPEED = 220;
  static JUMP_FORCE = -420;
  static COYOTE_TIME = 0.12; // 120ms coyote time

  /**
   * Check if two Axis-Aligned Bounding Boxes intersect
   */
  static aabbIntersect(b1, b2) {
    return (
      b1.x < b2.x + b2.width &&
      b1.x + b1.width > b2.x &&
      b1.y < b2.y + b2.height &&
      b1.y + b1.height > b2.y
    );
  }

  /**
   * Resolves collision between player and a solid platform
   * Returns: { collided: boolean, onGround: boolean, hitCeiling: boolean, hitWall: boolean }
   */
  static resolvePlatformCollision(player, platform) {
    // Player bounding box (slightly forgiving hitbox)
    const px = player.x + 4;
    const py = player.y + 2;
    const pw = player.width - 8;
    const ph = player.height - 2;

    const bx = platform.x;
    const by = platform.y;
    const bw = platform.width;
    const bh = platform.height;

    // Fast reject
    if (px + pw <= bx || px >= bx + bw || py + ph <= by || py >= by + bh) {
      return { collided: false, onGround: false };
    }

    // Penetration depth on each axis
    const overlapLeft = (px + pw) - bx;
    const overlapRight = (bx + bw) - px;
    const overlapTop = (py + ph) - by;
    const overlapBottom = (by + bh) - py;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    // One-Way Platform handling
    if (platform.oneWay) {
      // Only collide if player was moving down and falling onto top
      if (player.vy >= 0 && (py + ph - player.vy * 0.05) <= by + 10) {
        player.y = by - player.height;
        player.vy = 0;
        return { collided: true, onGround: true };
      }
      return { collided: false, onGround: false };
    }

    // Solid block collision resolution
    if (minOverlapY < minOverlapX) {
      // Vertical collision
      if (overlapTop < overlapBottom && player.vy >= 0) {
        // Landing on top of platform
        player.y = by - player.height;
        player.vy = 0;
        return { collided: true, onGround: true };
      } else if (overlapBottom < overlapTop && player.vy < 0) {
        // Hitting ceiling
        player.y = by + bh;
        player.vy = 0;
        return { collided: true, hitCeiling: true };
      }
    } else {
      // Horizontal collision
      if (overlapLeft < overlapRight) {
        player.x = bx - player.width + 4;
        player.vx = 0;
        return { collided: true, hitWall: true };
      } else {
        player.x = bx + bw - 4;
        player.vx = 0;
        return { collided: true, hitWall: true };
      }
    }

    return { collided: true, onGround: false };
  }

  /**
   * Check hazard spike collision with forgiving triangular/pointed area
   */
  static checkHazardCollision(player, hazard) {
    const px = player.x + 6;
    const py = player.y + 6;
    const pw = player.width - 12;
    const ph = player.height - 8;

    return (
      px < hazard.x + hazard.width &&
      px + pw > hazard.x &&
      py < hazard.y + hazard.height &&
      py + ph > hazard.y
    );
  }
}

// Global instance
window.Physics = Physics;
