/**
 * DON'T LET HER FALL - Entities
 * Player, Girl, Moving Platform, Crumbling Platform, Checkpoint, Collectibles, and Particle System.
 */

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================
class ParticleSystem {
  constructor(maxParticles = 600) {
    this.particles = [];
    this.maxParticles = maxParticles;
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#ffffff',
        alpha: 1,
        maxLife: 1,
        life: 0,
        drag: 0.98,
        gravity: 0,
        type: 'dust'
      });
    }
  }

  emit(x, y, count, options = {}) {
    let emitted = 0;
    for (let i = 0; i < this.particles.length; i++) {
      if (emitted >= count) break;
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x + (options.spreadX ? (Math.random() * 2 - 1) * options.spreadX : 0);
        p.y = y + (options.spreadY ? (Math.random() * 2 - 1) * options.spreadY : 0);
        
        const speed = options.speed || (Math.random() * 60 + 20);
        const angle = options.angle !== undefined ? options.angle + (Math.random() * 2 - 1) * (options.angleSpread || 0.4) : Math.random() * Math.PI * 2;
        
        p.vx = Math.cos(angle) * speed + (options.baseVx || 0);
        p.vy = Math.sin(angle) * speed + (options.baseVy || 0);
        p.size = options.size || (Math.random() * 2.5 + 1.5);
        p.color = options.color || '#bca7f8';
        p.alpha = options.alpha !== undefined ? options.alpha : 1.0;
        p.maxLife = options.life || (Math.random() * 0.8 + 0.4);
        p.life = p.maxLife;
        p.drag = options.drag || 0.96;
        p.gravity = options.gravity || 0;
        p.type = options.type || 'dust';
        emitted++;
      }
    }
  }

  emitDustPuff(x, y) {
    this.emit(x, y, 6, {
      speed: 40,
      angle: -Math.PI / 2,
      angleSpread: Math.PI / 3,
      color: 'rgba(188, 167, 248, 0.4)',
      size: 2.2,
      life: 0.35,
      gravity: 50
    });
  }

  emitMemoryBurst(x, y) {
    this.emit(x, y, 35, {
      speed: 120,
      color: '#f9d877',
      size: 3,
      life: 0.9,
      drag: 0.94
    });
    this.emit(x, y, 20, {
      speed: 80,
      color: '#ffffff',
      size: 2,
      life: 1.2,
      drag: 0.92
    });
  }

  emitCheckpointSparks(x, y) {
    this.emit(x, y, 22, {
      speed: 70,
      angle: -Math.PI / 2,
      angleSpread: Math.PI / 4,
      color: '#ffc371',
      size: 2.5,
      life: 0.8,
      gravity: -30
    });
  }

  emitDeathDissolve(x, y) {
    this.emit(x, y, 45, {
      speed: 140,
      color: '#0d132b',
      size: 4,
      life: 0.8,
      drag: 0.92
    });
    this.emit(x, y, 30, {
      speed: 90,
      color: '#bca7f8',
      size: 2.5,
      life: 1.1,
      drag: 0.95
    });
  }

  update(dt) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy = (p.vy + p.gravity * dt) * Math.pow(p.drag, dt * 60);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }
  }

  render(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.active) {
        const progress = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = p.alpha * progress;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * progress), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  clear() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].active = false;
    }
  }
}

// ============================================================================
// THE BOY (PLAYER)
// ============================================================================
class Player {
  constructor(x = 100, y = 300) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.width = 22;
    this.height = 42;
    
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1: Right, -1: Left
    this.onGround = false;
    this.wasOnGround = false;
    
    this.coyoteTimer = 0;
    this.isDying = false;
    this.deathTimer = 0;
    
    // Animation properties
    this.state = 'IDLE'; // IDLE, RUN, JUMP, FALL, LAND, DIE
    this.animTime = 0;
    this.squashStretchX = 1;
    this.squashStretchY = 1;
    
    // Scarf simulation points
    this.scarfSegments = [
      { x: x, y: y },
      { x: x - 6, y: y + 4 },
      { x: x - 12, y: y + 8 },
      { x: x - 18, y: y + 12 }
    ];
  }

  reset(x = this.spawnX, y = this.spawnY) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.wasOnGround = false;
    this.coyoteTimer = 0;
    this.isDying = false;
    this.deathTimer = 0;
    this.state = 'IDLE';
    this.animTime = 0;
    this.squashStretchX = 1;
    this.squashStretchY = 1;

    for (let i = 0; i < this.scarfSegments.length; i++) {
      this.scarfSegments[i].x = this.x;
      this.scarfSegments[i].y = this.y + 12;
    }
  }

  setSpawn(x, y) {
    this.spawnX = x;
    this.spawnY = y;
  }

  kill(particles) {
    if (this.isDying) return;
    this.isDying = true;
    this.deathTimer = 0.55;
    this.vx = 0;
    this.vy = 0;

    if (particles) {
      particles.emitDeathDissolve(this.x + this.width / 2, this.y + this.height / 2);
    }
    if (window.gameAudio) {
      window.gameAudio.playDeath();
    }
    if (window.gameCamera) {
      window.gameCamera.addTrauma(0.5);
    }
  }

  update(dt, input, platforms, movingPlatforms, crumblingPlatforms, particles) {
    if (this.isDying) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.reset(this.spawnX, this.spawnY);
        if (particles) {
          particles.emitCheckpointSparks(this.x + this.width / 2, this.y + this.height / 2);
        }
        if (window.gameAudio) {
          window.gameAudio.playRespawn();
        }
      }
      return;
    }

    this.animTime += dt;
    this.wasOnGround = this.onGround;

    // 1. Horizontal movement input
    let moveDir = 0;
    if (input.isLeft()) moveDir -= 1;
    if (input.isRight()) moveDir += 1;

    if (moveDir !== 0) {
      this.facing = moveDir;
      const accel = this.onGround ? Physics.MOVE_ACCEL : Physics.MOVE_AIR_ACCEL;
      this.vx += moveDir * accel * dt;
      this.vx = Math.max(-Physics.MAX_RUN_SPEED, Math.min(Physics.MAX_RUN_SPEED, this.vx));
    } else {
      const friction = this.onGround ? Physics.GROUND_FRICTION : Physics.AIR_DRAG;
      this.vx *= Math.pow(friction, dt * 60);
      if (Math.abs(this.vx) < 5) this.vx = 0;
    }

    // 2. Coyote Time
    if (this.onGround) {
      this.coyoteTimer = Physics.COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // 3. Jump Logic
    const canJump = this.onGround || this.coyoteTimer > 0;
    if (input.isJumpJustPressed() && canJump) {
      this.vy = Physics.JUMP_FORCE;
      this.onGround = false;
      this.coyoteTimer = 0;
      input.consumeJumpBuffer();
      
      // Jump squash/stretch
      this.squashStretchX = 0.75;
      this.squashStretchY = 1.35;

      if (particles) {
        particles.emitDustPuff(this.x + this.width / 2, this.y + this.height);
      }
      if (window.gameAudio) {
        window.gameAudio.playJump();
      }
    }

    // 4. Variable Jump Height
    let currentGravity = Physics.GRAVITY;
    if (!input.isJumpHeld() && this.vy < 0) {
      currentGravity *= Physics.LOW_JUMP_GRAVITY_MULT;
    }

    // Apply gravity
    this.vy += currentGravity * dt;
    this.vy = Math.min(this.vy, Physics.MAX_FALL_SPEED);

    // 5. Apply Horizontal Movement and check Collisions
    this.x += this.vx * dt;
    for (const p of platforms) {
      Physics.resolvePlatformCollision(this, p);
    }

    // 6. Apply Vertical Movement and check Collisions
    this.y += this.vy * dt;
    this.onGround = false;

    // Check static platforms
    for (const p of platforms) {
      const res = Physics.resolvePlatformCollision(this, p);
      if (res.onGround) {
        this.onGround = true;
      }
    }

    // Check moving platforms
    for (const mp of movingPlatforms) {
      const res = Physics.resolvePlatformCollision(this, mp);
      if (res.onGround) {
        this.onGround = true;
        // Carry with platform
        this.x += mp.vx * dt;
        this.y += mp.vy * dt;
      }
    }

    // Check crumbling platforms
    for (const cp of crumblingPlatforms) {
      if (cp.state === 'COLLAPSED') continue;
      const res = Physics.resolvePlatformCollision(this, cp);
      if (res.onGround) {
        this.onGround = true;
        cp.triggerStepped();
      }
    }

    // 7. Landing Impact Event
    if (!this.wasOnGround && this.onGround) {
      this.squashStretchX = 1.3;
      this.squashStretchY = 0.7;
      if (particles) {
        particles.emitDustPuff(this.x + this.width / 2, this.y + this.height);
      }
      if (window.gameAudio && this.vy > 120) {
        window.gameAudio.playLand();
      }
    }

    // Recover squash and stretch
    this.squashStretchX += (1 - this.squashStretchX) * Math.min(1, dt * 12);
    this.squashStretchY += (1 - this.squashStretchY) * Math.min(1, dt * 12);

    // 8. Update State
    if (!this.onGround) {
      this.state = this.vy < 0 ? 'JUMP' : 'FALL';
    } else if (Math.abs(this.vx) > 15) {
      this.state = 'RUN';
    } else {
      this.state = 'IDLE';
    }

    // 9. Update Scarf Simulation
    this.updateScarf(dt);
  }

  updateScarf(dt) {
    const headX = this.x + (this.facing === 1 ? 6 : this.width - 6);
    const headY = this.y + 14;

    this.scarfSegments[0].x = headX;
    this.scarfSegments[0].y = headY;

    const segmentDist = 5;
    for (let i = 1; i < this.scarfSegments.length; i++) {
      const prev = this.scarfSegments[i - 1];
      const cur = this.scarfSegments[i];

      // Wind & inertia
      const lagVx = -this.vx * 0.08 * (i / 2);
      const wave = Math.sin(this.animTime * 8 + i) * 1.5;
      cur.y += (prev.y + wave - cur.y) * Math.min(1, dt * 14);
      cur.x += (prev.x - this.facing * segmentDist + lagVx - cur.x) * Math.min(1, dt * 14);

      // Keep distance
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const dist = Math.hypot(dx, dy);
      if (dist > segmentDist) {
        cur.x = prev.x + (dx / dist) * segmentDist;
        cur.y = prev.y + (dy / dist) * segmentDist;
      }
    }
  }

  render(ctx) {
    if (this.isDying) return;

    ctx.save();
    const centerX = this.x + this.width / 2;
    const bottomY = this.y + this.height;

    // Apply squash and stretch anchored at the feet
    ctx.translate(centerX, bottomY);
    ctx.scale(this.squashStretchX, this.squashStretchY);
    ctx.scale(this.facing, 1);
    ctx.translate(-centerX, -bottomY);

    const bx = this.x;
    const by = this.y;

    // 1. Render Flowing Scarf (subtle purple/pale accent)
    ctx.strokeStyle = '#bca7f8';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.scarfSegments[0].x, this.scarfSegments[0].y);
    for (let i = 1; i < this.scarfSegments.length; i++) {
      ctx.lineTo(this.scarfSegments[i].x, this.scarfSegments[i].y);
    }
    ctx.stroke();

    // 2. Render Boy Silhouette (Pitch Dark with soft outline)
    ctx.fillStyle = '#060914';

    // A. Legs (articulated walking/jumping cycle)
    const legLength = 16;
    let leg1Angle = 0;
    let leg2Angle = 0;

    if (this.state === 'RUN') {
      const runCycle = this.animTime * 14;
      leg1Angle = Math.sin(runCycle) * 0.65;
      leg2Angle = -Math.sin(runCycle) * 0.65;
    } else if (this.state === 'JUMP') {
      leg1Angle = -0.4;
      leg2Angle = -0.2;
    } else if (this.state === 'FALL') {
      leg1Angle = 0.2;
      leg2Angle = 0.35;
    }

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#060914';

    // Back leg
    ctx.beginPath();
    ctx.moveTo(bx + 11, by + 28);
    ctx.lineTo(bx + 11 + Math.sin(leg2Angle) * legLength, by + 28 + Math.cos(leg2Angle) * legLength);
    ctx.stroke();

    // Front leg
    ctx.beginPath();
    ctx.moveTo(bx + 11, by + 28);
    ctx.lineTo(bx + 11 + Math.sin(leg1Angle) * legLength, by + 28 + Math.cos(leg1Angle) * legLength);
    ctx.stroke();

    // B. Torso & Trench Coat Silhouette
    ctx.beginPath();
    ctx.moveTo(bx + 7, by + 14); // Left shoulder
    ctx.lineTo(bx + 15, by + 14); // Right shoulder
    ctx.lineTo(bx + 17, by + 28); // Right waist
    ctx.lineTo(bx + (this.state === 'RUN' ? 4 : 5), by + 32); // Coat tail fluttering
    ctx.lineTo(bx + 5, by + 28); // Left waist
    ctx.closePath();
    ctx.fill();

    // C. Head & Messy Silhouette Hair
    const breath = this.state === 'IDLE' ? Math.sin(this.animTime * 3) * 0.8 : 0;
    ctx.beginPath();
    ctx.arc(bx + 11, by + 8 + breath, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Hair wisps
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + 6 + breath);
    ctx.lineTo(bx + 2, by + 3 + breath);
    ctx.lineTo(bx + 7, by + 4 + breath);
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// THE GIRL (SILHOUETTE APPARITION / OBJECTIVE)
// ============================================================================
class Girl {
  constructor(x = 800, y = 300) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 46;
    this.animTime = 0;
    this.isFading = false;
    this.fadeAlpha = 1.0;
  }

  update(dt, particles) {
    this.animTime += dt;

    // Emit gentle starlight particles ascending from her silhouette
    if (particles && Math.random() < 0.28) {
      particles.emit(
        this.x + Math.random() * this.width,
        this.y + Math.random() * this.height,
        1,
        {
          speed: 15,
          angle: -Math.PI / 2,
          angleSpread: 0.3,
          color: '#ffffff',
          size: 1.8,
          life: 1.4,
          alpha: 0.8
        }
      );
    }

    if (this.isFading) {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - dt * 1.2);
    }
  }

  triggerFade(particles) {
    this.isFading = true;
    if (particles) {
      for (let i = 0; i < 40; i++) {
        particles.emit(
          this.x + Math.random() * this.width,
          this.y + Math.random() * this.height,
          1,
          {
            speed: Math.random() * 50 + 20,
            angle: -Math.PI / 2 + (Math.random() * 0.8 - 0.4),
            color: '#f9d877',
            size: 2.5,
            life: 1.6
          }
        );
      }
    }
  }

  render(ctx) {
    if (this.fadeAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.fadeAlpha;

    const bx = this.x;
    const by = this.y;
    const floatY = Math.sin(this.animTime * 2.2) * 2;

    // Ethereal Outer Glow
    const gradient = ctx.createRadialGradient(
      bx + 12, by + 22 + floatY, 4,
      bx + 12, by + 22 + floatY, 32
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    gradient.addColorStop(0.5, 'rgba(188, 167, 248, 0.2)');
    gradient.addColorStop(1, 'rgba(188, 167, 248, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bx + 12, by + 22 + floatY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Dark Silhouette
    ctx.fillStyle = '#060914';

    // Dress Silhouette
    const wind = Math.sin(this.animTime * 3.5) * 3;
    ctx.beginPath();
    ctx.moveTo(bx + 7, by + 14 + floatY);
    ctx.lineTo(bx + 17, by + 14 + floatY);
    ctx.lineTo(bx + 23 + wind, by + 42 + floatY);
    ctx.lineTo(bx + 2, by + 42 + floatY);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(bx + 12, by + 8 + floatY, 5.8, 0, Math.PI * 2);
    ctx.fill();

    // Windblown Hair & Ribbon
    ctx.beginPath();
    ctx.moveTo(bx + 8, by + 6 + floatY);
    ctx.quadraticCurveTo(bx - 6 + wind, by + 10 + floatY, bx - 10 + wind * 1.5, by + 22 + floatY);
    ctx.lineTo(bx + 10, by + 11 + floatY);
    ctx.closePath();
    ctx.fill();

    // Pale Hair Ribbon
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(bx + 8, by + 7 + floatY);
    ctx.lineTo(bx - 3 + wind, by + 14 + floatY);
    ctx.stroke();

    ctx.restore();
  }
}

// ============================================================================
// MOVING PLATFORM
// ============================================================================
class MovingPlatform {
  constructor(x, y, width, height, targetX, targetY, speed = 40) {
    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.vx = 0;
    this.vy = 0;
    this.t = 0;

    this.totalDistance = Math.hypot(targetX - x, targetY - y);
  }

  update(dt) {
    if (this.totalDistance === 0) return;

    this.t += (this.speed / this.totalDistance) * dt;
    // Ping-pong sinusoidal easing
    const wave = (Math.sin(this.t * Math.PI - Math.PI / 2) + 1) / 2;

    const prevX = this.x;
    const prevY = this.y;

    this.x = this.startX + (this.targetX - this.startX) * wave;
    this.y = this.startY + (this.targetY - this.startY) * wave;

    this.vx = (this.x - prevX) / dt;
    this.vy = (this.y - prevY) / dt;
  }

  render(ctx) {
    ctx.save();
    // Platform Body (dark silhouette stone with glowing rune edge)
    ctx.fillStyle = '#080c1d';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Subtle edge highlight
    ctx.strokeStyle = 'rgba(188, 167, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Glowing motion core
    ctx.fillStyle = 'rgba(188, 167, 248, 0.6)';
    ctx.fillRect(this.x + this.width / 2 - 8, this.y + 3, 16, 3);
    ctx.restore();
  }
}

// ============================================================================
// CRUMBLING PLATFORM
// ============================================================================
class CrumblingPlatform {
  constructor(x, y, width, height) {
    this.origX = x;
    this.origY = y;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.state = 'SOLID'; // SOLID, SHAKING, COLLAPSED, REGENERATING
    this.shakeTimer = 0;
    this.SHAKE_DURATION = 0.55;
    this.collapseTimer = 0;
    this.REGEN_TIME = 2.4;
    this.shakeOffset = 0;
  }

  triggerStepped() {
    if (this.state === 'SOLID') {
      this.state = 'SHAKING';
      this.shakeTimer = this.SHAKE_DURATION;
      if (window.gameAudio) {
        window.gameAudio.playCrumble();
      }
    }
  }

  update(dt, particles) {
    if (this.state === 'SHAKING') {
      this.shakeTimer -= dt;
      this.shakeOffset = (Math.random() * 2 - 1) * 3;

      if (particles && Math.random() < 0.3) {
        particles.emit(
          this.origX + Math.random() * this.width,
          this.origY + this.height,
          1,
          { speed: 20, gravity: 200, color: '#323c65', size: 2 }
        );
      }

      if (this.shakeTimer <= 0) {
        this.state = 'COLLAPSED';
        this.collapseTimer = this.REGEN_TIME;
        if (particles) {
          particles.emit(this.origX + this.width / 2, this.origY + this.height / 2, 12, {
            speed: 50,
            gravity: 180,
            color: '#1b2244',
            size: 3
          });
        }
      }
    } else if (this.state === 'COLLAPSED') {
      this.collapseTimer -= dt;
      if (this.collapseTimer <= 0) {
        this.state = 'SOLID';
        this.shakeOffset = 0;
        this.x = this.origX;
        this.y = this.origY;
      }
    }
  }

  render(ctx) {
    if (this.state === 'COLLAPSED') return;

    ctx.save();
    const renderX = this.origX + (this.state === 'SHAKING' ? this.shakeOffset : 0);

    ctx.fillStyle = '#080c1d';
    ctx.fillRect(renderX, this.origY, this.width, this.height);

    ctx.strokeStyle = this.state === 'SHAKING' ? 'rgba(224, 93, 93, 0.7)' : 'rgba(188, 167, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(renderX, this.origY, this.width, this.height);

    // Cracks inside platform
    ctx.beginPath();
    ctx.moveTo(renderX + 8, this.origY + 4);
    ctx.lineTo(renderX + 16, this.origY + 10);
    ctx.lineTo(renderX + 24, this.origY + 5);
    ctx.stroke();

    ctx.restore();
  }
}

// ============================================================================
// CHECKPOINT (ANCIENT LANTERN)
// ============================================================================
class Checkpoint {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.width = 24;
    this.height = 40;
    this.isActive = false;
    this.animTime = 0;
  }

  activate(particles) {
    if (this.isActive) return;
    this.isActive = true;

    if (particles) {
      particles.emitCheckpointSparks(this.x + 12, this.y + 16);
    }
    if (window.gameAudio) {
      window.gameAudio.playCheckpoint();
    }
  }

  update(dt, particles) {
    this.animTime += dt;
    if (this.isActive && particles && Math.random() < 0.25) {
      particles.emit(this.x + 12, this.y + 14, 1, {
        speed: 20,
        angle: -Math.PI / 2,
        angleSpread: 0.4,
        color: '#ffc371',
        size: 2,
        life: 0.6
      });
    }
  }

  render(ctx) {
    ctx.save();
    const bx = this.x;
    const by = this.y;

    // Pedestal
    ctx.fillStyle = '#070b19';
    ctx.fillRect(bx + 4, by + 24, 16, 16);

    // Lantern Cage
    ctx.strokeStyle = '#232b4e';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 6, by + 10, 12, 14);

    if (this.isActive) {
      // Warm glowing flame
      const flicker = Math.sin(this.animTime * 8) * 1.5;
      const grad = ctx.createRadialGradient(bx + 12, by + 17, 2, bx + 12, by + 17, 18 + flicker);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ffc371');
      grad.addColorStop(1, 'rgba(255, 195, 113, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx + 12, by + 17, 18 + flicker, 0, Math.PI * 2);
      ctx.fill();

      // Flame core
      ctx.fillStyle = '#ffeedd';
      ctx.beginPath();
      ctx.arc(bx + 12, by + 17, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ============================================================================
// MEMORY COLLECTIBLE
// ============================================================================
class MemoryCollectible {
  constructor(x, y, id, name = 'Memory Fragment', icon = 'star') {
    this.x = x;
    this.y = y;
    this.id = id;
    this.name = name;
    this.icon = icon; // star, ribbon, locket, musicbox, flower
    this.width = 24;
    this.height = 24;
    this.isCollected = false;
    this.animTime = Math.random() * 5;
  }

  update(dt, particles) {
    this.animTime += dt;
    if (!this.isCollected && particles && Math.random() < 0.2) {
      particles.emit(this.x + 12, this.y + 12, 1, {
        speed: 15,
        color: '#f9d877',
        size: 1.5,
        life: 0.8
      });
    }
  }

  collect(particles) {
    if (this.isCollected) return;
    this.isCollected = true;
    if (particles) {
      particles.emitMemoryBurst(this.x + 12, this.y + 12);
    }
    if (window.gameAudio) {
      window.gameAudio.playMemory();
    }
  }

  render(ctx) {
    if (this.isCollected) return;

    ctx.save();
    const bx = this.x + 12;
    const by = this.y + 12 + Math.sin(this.animTime * 3) * 3;

    // Pulsing halo
    const pulse = Math.sin(this.animTime * 4) * 3;
    const grad = ctx.createRadialGradient(bx, by, 3, bx, by, 16 + pulse);
    grad.addColorStop(0, 'rgba(249, 216, 119, 0.9)');
    grad.addColorStop(0.5, 'rgba(188, 167, 248, 0.4)');
    grad.addColorStop(1, 'rgba(188, 167, 248, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, 16 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Icon Shape
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f9d877';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// Global exports
window.ParticleSystem = ParticleSystem;
window.Player = Player;
window.Girl = Girl;
window.MovingPlatform = MovingPlatform;
window.CrumblingPlatform = CrumblingPlatform;
window.Checkpoint = Checkpoint;
window.MemoryCollectible = MemoryCollectible;
