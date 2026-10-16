/**
 * DON'T LET HER FALL - Renderer & Visual Engine
 * Manages canvas scaling, multi-layer parallax backgrounds, weather effects,
 * silhouette geometry, lighting, and cinematic transitions.
 */
class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    
    // Virtual logical resolution
    this.virtualWidth = 960;
    this.virtualHeight = 540;
    
    this.scale = 1;
    this.viewportX = 0;
    this.viewportY = 0;
    this.viewportWidth = 960;
    this.viewportHeight = 540;
    
    this.animTime = 0;
    
    // Star field
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random() * 0.7,
        size: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        blinkSpeed: Math.random() * 2 + 1
      });
    }

    // Weather particles
    this.weatherParticles = [];
    for (let i = 0; i < 110; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.virtualWidth,
        y: Math.random() * this.virtualHeight,
        vx: 0,
        vy: 0,
        size: 1.5,
        alpha: 0.5,
        seed: Math.random() * 100
      });
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 150));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    // Physical canvas buffer
    this.canvas.width = Math.round(windowW * dpr);
    this.canvas.height = Math.round(windowH * dpr);

    // CSS display size
    this.canvas.style.width = `${windowW}px`;
    this.canvas.style.height = `${windowH}px`;

    // Maintain 16:9 aspect ratio or best fit
    const targetAspect = this.virtualWidth / this.virtualHeight;
    const windowAspect = windowW / windowH;

    if (windowAspect > targetAspect) {
      // Letterbox left/right
      this.viewportHeight = this.virtualHeight;
      this.viewportWidth = this.virtualHeight * windowAspect;
    } else {
      // Pillarbox top/bottom
      this.viewportWidth = this.virtualWidth;
      this.viewportHeight = this.virtualWidth / windowAspect;
    }

    if (window.gameCamera) {
      window.gameCamera.setViewport(this.viewportWidth, this.viewportHeight);
    }
  }

  updateWeather(dt, weatherType = 'fireflies') {
    this.animTime += dt;

    for (let i = 0; i < this.weatherParticles.length; i++) {
      const p = this.weatherParticles[i];

      if (weatherType === 'rain') {
        p.vx = -70;
        p.vy = 520;
        p.size = 1.2;
        p.alpha = 0.45;
      } else if (weatherType === 'leaves') {
        p.vx = Math.sin(this.animTime * 2 + p.seed) * 35 - 45;
        p.vy = 45;
        p.size = 2.4;
        p.alpha = 0.65;
      } else { // Fireflies / mist dust
        p.vx = Math.sin(this.animTime * 1.5 + p.seed) * 18;
        p.vy = Math.cos(this.animTime * 1.2 + p.seed) * 14 - 10;
        p.size = 1.8;
        p.alpha = 0.4 + Math.sin(this.animTime * 3 + p.seed) * 0.35;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Wrap around screen
      if (p.x < 0) p.x += this.viewportWidth;
      if (p.x > this.viewportWidth) p.x -= this.viewportWidth;
      if (p.y < 0) p.y += this.viewportHeight;
      if (p.y > this.viewportHeight) p.y -= this.viewportHeight;
    }
  }

  // ==========================================================================
  // PARALLAX BACKGROUND RENDERING
  // ==========================================================================

  renderBackground(camera, levelData) {
    const ctx = this.ctx;
    const camX = camera ? camera.x : 0;
    const camY = camera ? camera.y : 0;
    const vw = this.viewportWidth;
    const vh = this.viewportHeight;

    // 1. Sky Gradient
    const skyColors = levelData && levelData.skyGradient ? levelData.skyGradient : ["#070b19", "#0e1533", "#1a234f"];
    const skyGrad = ctx.createLinearGradient(0, 0, 0, vh);
    skyGrad.addColorStop(0, skyColors[0]);
    skyGrad.addColorStop(0.55, skyColors[1]);
    skyGrad.addColorStop(1, skyColors[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, vw, vh);

    // 2. Stars
    ctx.save();
    for (const s of this.stars) {
      const starX = (s.x * vw - camX * 0.02) % vw;
      const actualX = starX < 0 ? starX + vw : starX;
      const starY = s.y * vh - camY * 0.02;
      const twinkle = s.alpha * (0.6 + 0.4 * Math.sin(this.animTime * s.blinkSpeed));
      
      ctx.fillStyle = `rgba(240, 243, 255, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(actualX, starY, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Giant Luminous Moon
    ctx.save();
    const moonX = vw * 0.75 - camX * 0.03;
    const moonY = vh * 0.28 - camY * 0.03;
    const moonRadius = 52;

    // Soft moon aura
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2.8);
    moonGlow.addColorStop(0, 'rgba(235, 238, 255, 0.4)');
    moonGlow.addColorStop(0.5, 'rgba(188, 167, 248, 0.15)');
    moonGlow.addColorStop(1, 'rgba(188, 167, 248, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Moon Disc
    ctx.fillStyle = '#f2f0f8';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Parallax Layer 1: Distant Mountains (factor 0.08)
    this.renderMountainLayer(camX * 0.08, vh * 0.62, '#121835', 180, 80);

    // 5. Parallax Layer 2: Midground Tree Silhouettes & Arches (factor 0.22)
    this.renderMidgroundLayer(camX * 0.22, vh * 0.74, '#0a0f26');

    // 6. Parallax Layer 3: Closer Mist & Foothills (factor 0.45)
    this.renderFoothillsLayer(camX * 0.45, vh * 0.84, '#070b19');
  }

  renderMountainLayer(offsetX, baseY, color, wavelength, height) {
    const ctx = this.ctx;
    const vw = this.viewportWidth;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, this.viewportHeight);
    for (let x = 0; x <= vw + 50; x += 30) {
      const y = baseY - Math.sin((x + offsetX) / wavelength) * height - Math.cos((x + offsetX) / (wavelength * 0.6)) * (height * 0.35);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw, this.viewportHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderMidgroundLayer(offsetX, baseY, color) {
    const ctx = this.ctx;
    const vw = this.viewportWidth;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, this.viewportHeight);

    for (let x = 0; x <= vw + 40; x += 40) {
      const wave = Math.sin((x + offsetX) / 120) * 45;
      const peakY = baseY - wave;
      ctx.lineTo(x, peakY);

      // Render pine tree peak silhouette
      if (Math.abs(Math.sin((x + offsetX) * 0.1)) > 0.4) {
        ctx.lineTo(x + 10, peakY - 35);
        ctx.lineTo(x + 20, peakY);
      }
    }

    ctx.lineTo(vw, this.viewportHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderFoothillsLayer(offsetX, baseY, color) {
    const ctx = this.ctx;
    const vw = this.viewportWidth;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, this.viewportHeight);
    for (let x = 0; x <= vw + 50; x += 50) {
      const y = baseY - Math.sin((x + offsetX) / 90) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw, this.viewportHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ==========================================================================
  // LEVEL GEOMETRY RENDERING (PLATFORMS, HAZARDS)
  // ==========================================================================

  renderPlatforms(platforms) {
    const ctx = this.ctx;
    ctx.save();

    for (const p of platforms) {
      // Solid silhouette body
      ctx.fillStyle = '#060914';
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Soft moonlight top rim
      ctx.strokeStyle = 'rgba(188, 167, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.width, p.y);
      ctx.stroke();

      // Grassy wisp silhouettes along top surface
      ctx.fillStyle = '#060914';
      for (let gx = p.x + 8; gx < p.x + p.width - 8; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, p.y);
        ctx.lineTo(gx + 2, p.y - 4);
        ctx.lineTo(gx + 4, p.y);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  renderSpikes(spikes) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#0a0d1d';
    ctx.strokeStyle = 'rgba(224, 93, 93, 0.65)';
    ctx.lineWidth = 1.2;

    for (const s of spikes) {
      const count = Math.max(1, Math.floor(s.width / 16));
      const spikeWidth = s.width / count;

      for (let i = 0; i < count; i++) {
        const sx = s.x + i * spikeWidth;
        const sy = s.y + s.height;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + spikeWidth / 2, s.y);
        ctx.lineTo(sx + spikeWidth, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // WEATHER & FOREGROUND ATMOSPHERE
  // ==========================================================================

  renderWeather(weatherType = 'fireflies') {
    const ctx = this.ctx;
    ctx.save();

    for (const p of this.weatherParticles) {
      if (weatherType === 'rain') {
        ctx.strokeStyle = `rgba(188, 197, 248, ${p.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + 12);
        ctx.stroke();
      } else if (weatherType === 'leaves') {
        ctx.fillStyle = `rgba(138, 123, 232, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.7, this.animTime * 2 + p.seed, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Glowing Fireflies
        const glow = ctx.createRadialGradient(p.x, p.y, 0.5, p.x, p.y, p.size * 2.5);
        glow.addColorStop(0, `rgba(249, 216, 119, ${p.alpha})`);
        glow.addColorStop(1, 'rgba(249, 216, 119, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Atmospheric Vignette & Soft Lighting Pass
  renderLighting(player, girl, checkpoints, collectibles) {
    const ctx = this.ctx;
    const vw = this.viewportWidth;
    const vh = this.viewportHeight;

    ctx.save();
    // Vignette
    const vignette = ctx.createRadialGradient(vw / 2, vh / 2, vw * 0.35, vw / 2, vh / 2, vw * 0.75);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(3, 5, 15, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, vw, vh);
    ctx.restore();
  }

  // ==========================================================================
  // MAIN MENU CINEMATIC BACKDROP
  // ==========================================================================

  renderMainMenuBackdrop(dt) {
    this.animTime += dt;
    this.updateWeather(dt, 'fireflies');

    const ctx = this.ctx;
    const vw = this.viewportWidth;
    const vh = this.viewportHeight;

    // Scale canvas to view
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.scale(dpr * (this.canvas.width / (vw * dpr)), dpr * (this.canvas.height / (vh * dpr)));

    // Peaceful Night Sky
    this.renderBackground(null, {
      skyGradient: ["#070b19", "#0e1533", "#1a234f"]
    });

    // Foreground Hill
    ctx.fillStyle = '#060914';
    ctx.beginPath();
    ctx.moveTo(0, vh);
    ctx.quadraticCurveTo(vw * 0.5, vh * 0.72, vw, vh * 0.85);
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // Ancient Lone Tree Silhouette on Left Hill
    ctx.beginPath();
    const tx = vw * 0.22;
    const ty = vh * 0.76;
    ctx.moveTo(tx - 12, ty);
    ctx.quadraticCurveTo(tx - 6, ty - 60, tx, ty - 120);
    ctx.quadraticCurveTo(tx + 8, ty - 60, tx + 14, ty);
    ctx.fill();

    // Foliage canopy
    ctx.beginPath();
    ctx.arc(tx - 25, ty - 130, 45, 0, Math.PI * 2);
    ctx.arc(tx + 25, ty - 140, 50, 0, Math.PI * 2);
    ctx.arc(tx, ty - 165, 48, 0, Math.PI * 2);
    ctx.fill();

    // Boy Silhouette under tree
    const boyX = vw * 0.28;
    const boyY = vh * 0.73;
    ctx.fillStyle = '#060914';

    // Scarf trailing gently
    const wind = Math.sin(this.animTime * 3) * 6;
    ctx.strokeStyle = '#bca7f8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(boyX + 5, boyY - 22);
    ctx.quadraticCurveTo(boyX - 10 + wind, boyY - 20, boyX - 22 + wind * 1.5, boyY - 14);
    ctx.stroke();

    // Boy Body
    ctx.beginPath();
    ctx.arc(boyX + 5, boyY - 30, 6, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.fillRect(boyX, boyY - 24, 10, 18); // Coat
    ctx.fillRect(boyX + 2, boyY - 6, 3, 10); // Leg 1
    ctx.fillRect(boyX + 7, boyY - 6, 3, 10); // Leg 2

    // Girl Silhouette far away on the right ridge
    const girlX = vw * 0.76;
    const girlY = vh * 0.78;

    // Soft starlight aura
    const girlGlow = ctx.createRadialGradient(girlX + 6, girlY - 20, 2, girlX + 6, girlY - 20, 26);
    girlGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    girlGlow.addColorStop(0.5, 'rgba(188, 167, 248, 0.15)');
    girlGlow.addColorStop(1, 'rgba(188, 167, 248, 0)');
    ctx.fillStyle = girlGlow;
    ctx.beginPath();
    ctx.arc(girlX + 6, girlY - 20, 26, 0, Math.PI * 2);
    ctx.fill();

    // Girl dress silhouette
    ctx.fillStyle = '#060914';
    ctx.beginPath();
    ctx.arc(girlX + 6, girlY - 28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(girlX + 3, girlY - 23);
    ctx.lineTo(girlX + 9, girlY - 23);
    const gwind = Math.sin(this.animTime * 3.5) * 4;
    ctx.lineTo(girlX + 14 + gwind, girlY);
    ctx.lineTo(girlX - 2, girlY);
    ctx.closePath();
    ctx.fill();

    // Fireflies floating between them
    this.renderWeather('fireflies');

    // Subtle dark vignette
    this.renderLighting();

    ctx.restore();
  }
}

// Global instance
window.GameRenderer = GameRenderer;
