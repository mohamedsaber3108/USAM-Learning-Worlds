/**
 * Phase 19: Asset Loading Utilities
 *
 * Efficient loading and caching of images, audio, and fonts
 */

/* -------------------------------- Image Preloading --------------------------- */

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage));
}

/* -------------------------------- Audio Management --------------------------- */

export class AudioManager {
  private cache = new Map<string, HTMLAudioElement>();
  private loading = new Map<string, Promise<void>>();
  private volume = 1;
  private muted = false;

  /**
   * Preload an audio file
   */
  async preload(url: string): Promise<void> {
    if (this.cache.has(url)) return;
    if (this.loading.has(url)) return this.loading.get(url);

    const promise = new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = url;
      audio.volume = this.volume;
      audio.muted = this.muted;

      audio.addEventListener("canplaythrough", () => {
        this.cache.set(url, audio);
        this.loading.delete(url);
        resolve();
      });

      audio.addEventListener("error", () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load audio: ${url}`));
      });
    });

    this.loading.set(url, promise);
    return promise;
  }

  /**
   * Play an audio file
   */
  async play(url: string, options?: { loop?: boolean; volume?: number }): Promise<void> {
    let audio = this.cache.get(url);

    if (!audio) {
      await this.preload(url);
      audio = this.cache.get(url);
    }

    if (!audio) return;

    audio.currentTime = 0;
    audio.loop = options?.loop ?? false;
    if (options?.volume !== undefined) {
      audio.volume = options.volume;
    }

    try {
      await audio.play();
    } catch (error) {
      console.error(`Failed to play audio: ${url}`, error);
    }
  }

  /**
   * Stop an audio file
   */
  stop(url: string): void {
    const audio = this.cache.get(url);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Pause an audio file
   */
  pause(url: string): void {
    const audio = this.cache.get(url);
    if (audio) {
      audio.pause();
    }
  }

  /**
   * Resume an audio file
   */
  resume(url: string): void {
    const audio = this.cache.get(url);
    if (audio) {
      audio.play();
    }
  }

  /**
   * Set volume for all audio (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.cache.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.cache.forEach((audio) => {
      audio.muted = muted;
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    this.cache.clear();
    this.loading.clear();
  }

  /**
   * Get cached audio element
   */
  get(url: string): HTMLAudioElement | undefined {
    return this.cache.get(url);
  }

  /**
   * Check if audio is playing
   */
  isPlaying(url: string): boolean {
    const audio = this.cache.get(url);
    return audio ? !audio.paused : false;
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();

/* -------------------------------- Font Preloading ---------------------------- */

/**
 * Preload a font
 */
export function preloadFont(fontFamily: string, options?: { weight?: string; style?: string }): Promise<void> {
  const { weight = "400", style = "normal" } = options || {};

  return new Promise((resolve, reject) => {
    const font = new FontFace(fontFamily, `local('${fontFamily}')`, {
      weight,
      style,
    });

    font
      .load()
      .then(() => {
        document.fonts.add(font);
        resolve();
      })
      .catch(reject);
  });
}

/* -------------------------------- Asset Preloading --------------------------- */

/**
 * Preload multiple assets
 */
export async function preloadAssets(assets: {
  images?: string[];
  audio?: string[];
  fonts?: Array<{ family: string; weight?: string; style?: string }>;
}): Promise<void> {
  const promises: Promise<void>[] = [];

  if (assets.images) {
    promises.push(preloadImages(assets.images));
  }

  if (assets.audio) {
    promises.push(...assets.audio.map((url) => audioManager.preload(url)));
  }

  if (assets.fonts) {
    promises.push(...assets.fonts.map((font) => preloadFont(font.family, font)));
  }

  await Promise.all(promises);
}

/* -------------------------------- Resource Hints ----------------------------- */

/**
 * Add preconnect hint for domain
 */
export function preconnect(url: string): void {
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Add prefetch hint for resource
 */
export function prefetch(url: string, type?: "image" | "script" | "style" | "font"): void {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  if (type) link.as = type;
  document.head.appendChild(link);
}

/**
 * Add preload hint for resource
 */
export function preload(url: string, type: "image" | "script" | "style" | "font"): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
}

/* -------------------------------- Example Usage ------------------------------ */

/**
 * Preload world assets
 *
 * ```typescript
 * await preloadAssets({
 *   images: [
 *     '/worlds/coding/background.webp',
 *     '/characters/koda.webp',
 *   ],
 *   audio: [
 *     '/worlds/coding/ambient.mp3',
 *     '/worlds/coding/success.mp3',
 *   ],
 * });
 * ```
 */

/**
 * Use audio manager
 *
 * ```typescript
 * // Preload
 * await audioManager.preload('/sounds/success.mp3');
 *
 * // Play
 * await audioManager.play('/sounds/success.mp3');
 *
 * // Stop
 * audioManager.stop('/sounds/success.mp3');
 *
 * // Set volume
 * audioManager.setVolume(0.5);
 * ```
 */
