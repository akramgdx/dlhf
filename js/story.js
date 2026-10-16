/**
 * DON'T LET HER FALL - Story & Narrative Engine
 * Handles story fragments, memory descriptions, and the final emotional cinematic sequence.
 */

const STORY_MEMORIES = {
  mem_1: {
    title: "A Folded Note",
    text: "'Wait for me by the hill when the stars appear.' But the years have washed away the handwriting."
  },
  mem_2: {
    title: "Pale Blue Ribbon",
    text: "She used to wear this on warm summer afternoons. It slipped through my fingers so easily."
  },
  mem_3: {
    title: "Dried Forget-Me-Not",
    text: "Pressed between yellowed pages. A promise whispered before the long winter began."
  },
  mem_4: {
    title: "Silver Music Box",
    text: "It only played one gentle melody. The gears have rusted, yet I hear it in every breath of wind."
  },
  mem_5: {
    title: "Faded Photograph",
    text: "Two silhouettes standing by the shore. One of their faces has blurred into the white paper."
  },
  mem_6: {
    title: "Silver Locket",
    text: "Empty inside. You promised to place our portrait here once the journey was over."
  },
  mem_7: {
    title: "Torn Diary Page",
    text: "'The doctors asked him to say goodbye. But he still packs his coat, saying he has to find me.'"
  },
  mem_8: {
    title: "Porcelain Hairclip",
    text: "Found near the ruined bridge. The last place we stood side by side."
  },
  mem_9: {
    title: "Glass Star Bottle",
    text: "A thousand folded paper stars. Every single one was a wish that this was all just a dream."
  },
  mem_10: {
    title: "An Unopened Letter",
    text: "'Please let me go, my love. The distance between us was never the miles... it was time.'"
  }
};

class StoryManager {
  constructor() {
    this.banner = document.getElementById('story-banner');
    this.bannerText = document.getElementById('story-banner-text');
    this.bannerTimer = null;

    // Cinematic screen elements
    this.endingScreen = document.getElementById('screen-ending');
    this.endingLine1 = document.getElementById('ending-line-1');
    this.endingLine2 = document.getElementById('ending-line-2');
    this.endingLine3 = document.getElementById('ending-line-3');
    this.endingActions = document.getElementById('ending-actions');
    this.endingTotalMemories = document.getElementById('ending-total-memories');
    this.btnSkipEnding = document.getElementById('btn-skip-ending');

    this.cinematicPhase = 0;
    this.cinematicTime = 0;
    this.cinematicActive = false;
    this.skipAvailable = false;
    this.cinematicTimeouts = [];

    if (this.banner) {
      this.banner.addEventListener('click', () => this.hideBanner());
    }
    if (this.btnSkipEnding) {
      this.btnSkipEnding.addEventListener('click', () => this.fastForwardEnding());
    }
  }

  showBanner(text, autoHideSeconds = 6) {
    if (!this.banner || !this.bannerText) return;
    this.bannerText.textContent = text;
    this.banner.classList.remove('hidden');

    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    if (autoHideSeconds > 0) {
      this.bannerTimer = setTimeout(() => {
        this.hideBanner();
      }, autoHideSeconds * 1000);
    }
  }

  hideBanner() {
    if (!this.banner) return;
    this.banner.classList.add('hidden');
    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
      this.bannerTimer = null;
    }
  }

  showMemoryPrompt(memoryId) {
    const mem = STORY_MEMORIES[memoryId];
    if (mem) {
      this.showBanner(`"${mem.text}" — ${mem.title}`, 7.5);
    }
  }

  // ==========================================================================
  // FINAL EMOTIONAL CINEMATIC SEQUENCE
  // ==========================================================================

  startEndingCinematic(onComplete) {
    this.cinematicActive = true;
    this.onCompleteCallback = onComplete;
    this.clearCinematicTimeouts();

    if (window.gameAudio) {
      window.gameAudio.playTheme('ending');
    }

    if (window.gameSave) {
      window.gameSave.markEndingSeen();
    }

    // Reset UI elements
    this.endingScreen.classList.remove('hidden');
    this.endingLine1.classList.remove('visible');
    this.endingLine2.classList.remove('visible');
    this.endingLine3.classList.remove('visible');
    this.endingActions.classList.add('hidden');
    this.btnSkipEnding.classList.add('hidden');

    // Show skip after 2.5s
    const t0 = setTimeout(() => {
      this.btnSkipEnding.classList.remove('hidden');
    }, 2500);
    this.cinematicTimeouts.push(t0);

    // Sequence Line 1
    const t1 = setTimeout(() => {
      this.endingLine1.classList.add('visible');
    }, 1800);
    this.cinematicTimeouts.push(t1);

    // Sequence Line 2
    const t2 = setTimeout(() => {
      this.endingLine2.classList.add('visible');
    }, 5500);
    this.cinematicTimeouts.push(t2);

    // Sequence Line 3
    const t3 = setTimeout(() => {
      this.endingLine3.classList.add('visible');
    }, 9500);
    this.cinematicTimeouts.push(t3);

    // Actions & Tally
    const t4 = setTimeout(() => {
      this.showEndingActions();
    }, 13500);
    this.cinematicTimeouts.push(t4);
  }

  showEndingActions() {
    this.endingLine1.classList.add('visible');
    this.endingLine2.classList.add('visible');
    this.endingLine3.classList.add('visible');
    this.btnSkipEnding.classList.add('hidden');

    const total = window.gameSave ? window.gameSave.getTotalCollectedCount() : 10;
    this.endingTotalMemories.textContent = `Memories Recovered: ${total} / 10`;
    this.endingActions.classList.remove('hidden');
  }

  fastForwardEnding() {
    this.clearCinematicTimeouts();
    this.showEndingActions();
  }

  clearCinematicTimeouts() {
    for (const t of this.cinematicTimeouts) {
      clearTimeout(t);
    }
    this.cinematicTimeouts = [];
  }
}

// Global instance
window.gameStory = new StoryManager();
