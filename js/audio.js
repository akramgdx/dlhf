/**
 * DON'T LET HER FALL - Audio System
 * High-fidelity procedural Web Audio API synthesizer for ambient music and sound effects.
 * 100% self-contained, lightweight, zero external file dependencies.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    
    // Gain Nodes
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    
    // Ambient Music State
    this.currentTheme = null;
    this.musicTimer = null;
    this.currentTrackNodes = [];
    this.ambientSoundNode = null;
    this.rainNode = null;
    
    // Settings defaults
    this.musicVolume = 0.6;
    this.sfxVolume = 0.7;
    this.isMuted = false;
    
    // Apply initial settings from save
    if (window.gameSave) {
      const s = window.gameSave.getSettings();
      this.musicVolume = s.musicVolume;
      this.sfxVolume = s.sfxVolume;
      this.isMuted = s.muted;
    }
  }

  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API not supported on this browser.');
        return;
      }
      this.ctx = new AudioCtx();
      
      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music Channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to initialize AudioContext:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // ==========================================================================
  // PROCEDURAL AMBIENT MUSIC ENGINE
  // ==========================================================================

  playTheme(themeName) {
    if (this.currentTheme === themeName) return;
    this.ensureContext();
    this.stopMusic(1.5);
    this.currentTheme = themeName;

    if (!this.ctx) return;

    // Crossfade in new theme
    setTimeout(() => {
      if (this.currentTheme !== themeName) return;
      switch (themeName) {
        case 'menu':
          this.startMenuTheme();
          break;
        case 'peaceful': // Levels 1 - 2
          this.startPeacefulTheme();
          break;
        case 'melancholy': // Levels 3 - 5
          this.startMelancholyTheme();
          break;
        case 'darkness': // Levels 6 - 7
          this.startDarknessTheme();
          break;
        case 'tension': // Levels 8 - 9
          this.startTensionTheme();
          break;
        case 'ending': // Level 10 & Finale
          this.startEndingTheme();
          break;
      }
    }, 400);
  }

  stopMusic(fadeDuration = 1.0) {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }

    if (this.ctx && this.currentTrackNodes.length > 0) {
      const now = this.ctx.currentTime;
      this.currentTrackNodes.forEach(({ gain, osc }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch (e) {}
          }, fadeDuration * 1000 + 100);
        } catch (e) {}
      });
      this.currentTrackNodes = [];
    }

    if (this.ambientSoundNode) {
      try {
        this.ambientSoundNode.stop();
        this.ambientSoundNode.disconnect();
      } catch (e) {}
      this.ambientSoundNode = null;
    }

    if (this.rainNode) {
      try {
        this.rainNode.stop();
        this.rainNode.disconnect();
      } catch (e) {}
      this.rainNode = null;
    }

    this.currentTheme = null;
  }

  // Synthesize a warm ambient piano note with natural attack, decay, and warmth
  playPianoNote(freq, time, duration = 3.5, gainLevel = 0.22) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Use gentle triangle wave softened with warm low-pass
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(250, time + duration);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);

    this.currentTrackNodes.push({ osc, gain });
    setTimeout(() => {
      const idx = this.currentTrackNodes.findIndex(n => n.osc === osc);
      if (idx !== -1) this.currentTrackNodes.splice(idx, 1);
    }, (duration + 0.2) * 1000);
  }

  // Atmospheric wind generator
  startWindAmbient(intensity = 0.08) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    whiteNoise.start();
    this.ambientSoundNode = whiteNoise;
  }

  // Rain sound generator for Level 9
  startRainSound() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const rainNoise = this.ctx.createBufferSource();
    rainNoise.buffer = buffer;
    rainNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    rainNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    rainNoise.start();
    this.rainNode = rainNoise;
  }

  // --- THEMES ---

  startMenuTheme() {
    this.startWindAmbient(0.04);
    // Emotional slow progression: Am9 -> Fmaj7 -> C -> Em7
    const chords = [
      [220, 261.63, 329.63, 392],    // A3, C4, E4, G4
      [174.61, 261.63, 329.63, 440], // F3, C4, E4, A4
      [130.81, 261.63, 329.63, 392], // C3, C4, E4, G4
      [164.81, 246.94, 329.63, 392]  // E3, B3, E4, G4
    ];
    let step = 0;

    const playCycle = () => {
      if (this.currentTheme !== 'menu' || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[step % chords.length];

      currentChord.forEach((freq, idx) => {
        this.playPianoNote(freq, now + idx * 0.45, 5.0, 0.16);
      });

      step++;
    };

    playCycle();
    this.musicTimer = setInterval(playCycle, 4800);
  }

  startPeacefulTheme() {
    this.startWindAmbient(0.05);
    // C Major / A Minor calm arpeggios
    const notes = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
      174.61, 261.63, 329.63, 392.00, // F3, C4, E4, G4
      196.00, 246.94, 293.66, 392.00  // G3, B3, D4, G4
    ];
    let idx = 0;

    const playArp = () => {
      if (this.currentTheme !== 'peaceful' || !this.ctx) return;
      const note = notes[idx % notes.length];
      this.playPianoNote(note, this.ctx.currentTime, 3.2, 0.14);
      idx++;
    };

    playArp();
    this.musicTimer = setInterval(playArp, 1100);
  }

  startMelancholyTheme() {
    this.startWindAmbient(0.06);
    // Deeper minor chords: Dm -> Am -> Bb -> F
    const chords = [
      [146.83, 220.00, 261.63, 349.23], // D3, A3, C4, F4
      [110.00, 220.00, 261.63, 329.63], // A2, A3, C4, E4
      [116.54, 233.08, 293.66, 349.23], // Bb2, Bb3, D4, F4
      [174.61, 261.63, 349.23, 440.00]  // F3, C4, F4, A4
    ];
    let step = 0;

    const playCycle = () => {
      if (this.currentTheme !== 'melancholy' || !this.ctx) return;
      const chord = chords[step % chords.length];
      const now = this.ctx.currentTime;
      chord.forEach((freq, i) => {
        this.playPianoNote(freq, now + i * 0.35, 4.8, 0.15);
      });
      step++;
    };

    playCycle();
    this.musicTimer = setInterval(playCycle, 4200);
  }

  startDarknessTheme() {
    this.startWindAmbient(0.09);
    // Sparse, eerie minor intervals
    const notes = [130.81, 155.56, 196.00, 233.08, 123.47, 146.83];
    let step = 0;

    const playSparse = () => {
      if (this.currentTheme !== 'darkness' || !this.ctx) return;
      const f = notes[step % notes.length];
      this.playPianoNote(f, this.ctx.currentTime, 5.0, 0.18);
      step++;
    };

    playSparse();
    this.musicTimer = setInterval(playSparse, 2400);
  }

  startTensionTheme() {
    this.startWindAmbient(0.08);
    this.startRainSound();
    // Driving melancholic progression with high emotional intensity
    const chords = [
      [110.00, 220.00, 329.63, 392.00], // Am7
      [130.81, 261.63, 329.63, 440.00], // C6
      [146.83, 220.00, 293.66, 349.23], // Dm
      [164.81, 246.94, 329.63, 392.00]  // Em
    ];
    let step = 0;

    const playCycle = () => {
      if (this.currentTheme !== 'tension' || !this.ctx) return;
      const chord = chords[step % chords.length];
      const now = this.ctx.currentTime;
      chord.forEach((f, i) => {
        this.playPianoNote(f, now + i * 0.25, 3.6, 0.18);
      });
      step++;
    };

    playCycle();
    this.musicTimer = setInterval(playCycle, 3200);
  }

  startEndingTheme() {
    this.startWindAmbient(0.04);
    // Extremely emotional, tender, resolving piano progression
    const phrases = [
      [220.00, 261.63, 329.63, 440.00, 523.25], // Am(add9)
      [174.61, 261.63, 329.63, 440.00],         // Fmaj7
      [130.81, 196.00, 261.63, 329.63, 392.00], // Cmaj9
      [196.00, 246.94, 293.66, 392.00, 493.88], // Gsus4
      [110.00, 164.81, 220.00, 329.63]          // Solitary A minor resolution
    ];
    let step = 0;

    const playCycle = () => {
      if (this.currentTheme !== 'ending' || !this.ctx) return;
      const phrase = phrases[step % phrases.length];
      const now = this.ctx.currentTime;
      phrase.forEach((freq, idx) => {
        this.playPianoNote(freq, now + idx * 0.45, 6.0, 0.18);
      });
      step++;
    };

    playCycle();
    this.musicTimer = setInterval(playCycle, 4600);
  }

  // ==========================================================================
  // PROCEDURAL SOUND EFFECTS (SFX)
  // ==========================================================================

  playJump() {
    this.ensureContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playLand() {
    this.ensureContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  playMemory() {
    this.ensureContext();
    if (!this.ctx) return;
    // Magical pentatonic shimmering chime cascade
    const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // E5, G#5, B5, E6, G#6
    const now = this.ctx.currentTime;

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 1.6);
    });
  }

  playCheckpoint() {
    this.ensureContext();
    if (!this.ctx) return;
    // Warm harmonic singing bowl chime
    const freqs = [392.00, 587.33, 783.99]; // G4, D5, G5
    const now = this.ctx.currentTime;

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 / (i + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 2.0);
    });
  }

  playCrumble() {
    this.ensureContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.3);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playDeath() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dissolution breath sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  playRespawn() {
    this.ensureContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playLevelComplete() {
    this.ensureContext();
    if (!this.ctx) return;
    const freqs = [329.63, 392.00, 493.88, 659.25, 783.99, 987.77];
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 2.2);
    });
  }

  playUIClick() {
    this.ensureContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }
}

// Global instance
window.gameAudio = new AudioManager();
