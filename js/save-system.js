/**
 * DON'T LET HER FALL - Save System
 * Manages player progression, unlocked levels, collected memories, and preferences.
 */
class SaveSystem {
  static STORAGE_KEY = 'DONT_LET_HER_FALL_SAVE_V1';

  constructor() {
    this.data = this.getDefaults();
    this.load();
  }

  getDefaults() {
    return {
      version: 1,
      unlockedLevel: 1,
      completedLevels: [],
      collectedMemories: {}, // { [levelNumber]: [memoryId, ...] }
      hasSeenEnding: false,
      settings: {
        musicVolume: 0.6,
        sfxVolume: 0.7,
        muted: false,
        screenShake: true,
        reducedMotion: false
      }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(SaveSystem.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Merge safely with defaults
          this.data = {
            ...this.getDefaults(),
            ...parsed,
            settings: {
              ...this.getDefaults().settings,
              ...(parsed.settings || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn('Could not read save data from localStorage, using memory defaults:', e);
      this.data = this.getDefaults();
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(SaveSystem.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not persist save data to localStorage:', e);
    }
  }

  hasProgress() {
    return (
      this.data.unlockedLevel > 1 ||
      this.data.completedLevels.length > 0 ||
      this.getTotalCollectedCount() > 0 ||
      this.data.hasSeenEnding
    );
  }

  unlockLevel(levelNum) {
    if (levelNum > this.data.unlockedLevel && levelNum <= 10) {
      this.data.unlockedLevel = levelNum;
      this.save();
    }
  }

  completeLevel(levelNum) {
    if (!this.data.completedLevels.includes(levelNum)) {
      this.data.completedLevels.push(levelNum);
    }
    this.unlockLevel(levelNum + 1);
    this.save();
  }

  isLevelUnlocked(levelNum) {
    return levelNum <= this.data.unlockedLevel;
  }

  isLevelCompleted(levelNum) {
    return this.data.completedLevels.includes(levelNum);
  }

  collectMemory(levelNum, memoryId) {
    if (!this.data.collectedMemories[levelNum]) {
      this.data.collectedMemories[levelNum] = [];
    }
    if (!this.data.collectedMemories[levelNum].includes(memoryId)) {
      this.data.collectedMemories[levelNum].push(memoryId);
      this.save();
      return true;
    }
    return false;
  }

  isMemoryCollected(levelNum, memoryId) {
    const list = this.data.collectedMemories[levelNum];
    return list ? list.includes(memoryId) : false;
  }

  getMemoriesForLevel(levelNum) {
    return this.data.collectedMemories[levelNum] || [];
  }

  getTotalCollectedCount() {
    let count = 0;
    for (const key in this.data.collectedMemories) {
      count += (this.data.collectedMemories[key] || []).length;
    }
    return count;
  }

  markEndingSeen() {
    this.data.hasSeenEnding = true;
    this.save();
  }

  updateSettings(partialSettings) {
    this.data.settings = {
      ...this.data.settings,
      ...partialSettings
    };
    this.save();
  }

  getSettings() {
    return this.data.settings;
  }

  resetProgress() {
    const savedSettings = { ...this.data.settings };
    this.data = this.getDefaults();
    this.data.settings = savedSettings; // preserve audio & visual settings
    this.save();
  }
}

// Global instance
window.gameSave = new SaveSystem();
