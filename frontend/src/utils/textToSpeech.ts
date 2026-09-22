export class TextToSpeechService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static isPlaying = false;
  private static isPaused = false;
  private static playbackRate = 1.0;
  private static onStateChangeCallback: ((state: 'playing' | 'paused' | 'stopped', currentTime: number, duration: number) => void) | null = null;
  private static timerInterval: number | null = null;
  private static elapsedSeconds = 0;
  private static totalEstimatedSeconds = 0;
  private static currentText = '';
  private static currentLang: 'id' | 'en' = 'id';

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // Extract clean plain text from HTML content
  public static extractPlainTextFromHTML(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  // Format seconds to MM:SS string
  public static formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  public static setSpeed(speed: number) {
    this.playbackRate = speed;
    if (this.isPlaying) {
      const remainingText = this.currentText;
      this.play(remainingText, this.currentLang, this.onStateChangeCallback || undefined);
    }
  }

  public static getSpeed(): number {
    return this.playbackRate;
  }

  // Start or resume playing speech
  public static play(
    text: string, 
    lang: 'id' | 'en', 
    onStateChange?: (state: 'playing' | 'paused' | 'stopped', currentTime: number, duration: number) => void
  ) {
    if (!this.synth) return;

    this.currentLang = lang;
    if (onStateChange) {
      this.onStateChangeCallback = onStateChange;
    }

    // If currently paused with exact same text, resume
    if (this.isPaused && this.currentText === text) {
      this.synth.resume();
      this.isPlaying = true;
      this.isPaused = false;
      this.startTimer();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('playing', this.elapsedSeconds, this.totalEstimatedSeconds);
      }
      return;
    }

    // Stop any active speech before starting new
    this.stop();

    this.currentText = text;

    // Estimate duration taking playback rate into account: ~2.2 words per second at 1.0x
    const words = text.trim().split(/\s+/).length;
    const baseSeconds = Math.max(8, Math.ceil(words / 2.2));
    this.totalEstimatedSeconds = Math.ceil(baseSeconds / this.playbackRate);
    this.elapsedSeconds = 0;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'id-ID';
    utterance.rate = this.playbackRate;
    utterance.pitch = 1.0;

    // Find native voice matching language
    const voices = this.synth.getVoices();
    const targetLangPrefix = lang === 'en' ? 'en' : 'id';
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.startTimer();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('playing', this.elapsedSeconds, this.totalEstimatedSeconds);
      }
    };

    utterance.onend = () => {
      this.stop();
    };

    utterance.onerror = () => {
      this.stop();
    };

    this.synth.speak(utterance);
  }

  // Pause speech
  public static pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPlaying = false;
      this.isPaused = true;
      this.stopTimer();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('paused', this.elapsedSeconds, this.totalEstimatedSeconds);
      }
    }
  }

  // Stop speech completely & reset state
  public static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.stopTimer();
    const duration = this.totalEstimatedSeconds;
    this.elapsedSeconds = 0;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('stopped', 0, duration);
    }
  }

  public static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public static getIsPaused(): boolean {
    return this.isPaused;
  }

  private static startTimer() {
    this.stopTimer();
    this.timerInterval = window.setInterval(() => {
      if (this.isPlaying && !this.isPaused) {
        this.elapsedSeconds++;
        if (this.elapsedSeconds > this.totalEstimatedSeconds) {
          this.totalEstimatedSeconds = this.elapsedSeconds + 5;
        }
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('playing', this.elapsedSeconds, this.totalEstimatedSeconds);
        }
      }
    }, 1000);
  }

  private static stopTimer() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
