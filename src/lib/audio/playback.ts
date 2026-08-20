import {
  DEFAULT_GERMAN_VOICE_ID,
  localTts,
  type AudioResult,
  type GermanAudioTarget,
  type GermanVoiceId,
  type SpeechSpeed,
} from './tts';

export type AudioState = 'idle' | 'feedback' | 'generating' | 'speaking';

/**
 * Uygulamadaki tum kisa efektler. Hepsi `scripts/generate-sfx.ts` ile uretilen
 * OZGUN sinus tonlaridir; ucuncu taraf ses varligi kullanilmaz (§23).
 */
export type SoundEffect =
  | 'correct'
  | 'incorrect'
  | 'complete'
  | 'streak-5'
  | 'streak-10'
  | 'perfect'
  | 'goal';

/** Efekt seviyeleri: telaffuzun ustune binmesin diye bilerek kisik. */
const EFFECT_VOLUME: Record<SoundEffect, number> = {
  correct: 0.48,
  incorrect: 0.48,
  complete: 0.5,
  'streak-5': 0.42,
  'streak-10': 0.46,
  perfect: 0.5,
  goal: 0.4,
};

export interface AudioHandle {
  currentTime: number;
  volume: number;
  onended: ((event: Event) => unknown) | null;
  onerror: ((event: Event) => unknown) | null;
  play(): Promise<void>;
  pause(): void;
}

export type AudioFactory = (src: string) => AudioHandle;
export interface TimerDriver {
  set(callback: () => void, delayMs: number): ReturnType<typeof setTimeout>;
  clear(timer: ReturnType<typeof setTimeout>): void;
}

interface AudioControllerOptions {
  createAudio?: AudioFactory;
  requestSpeech?: (
    target: GermanAudioTarget,
    speed: SpeechSpeed,
    voice: GermanVoiceId,
    signal: AbortSignal,
  ) => Promise<AudioResult>;
  timer?: TimerDriver;
}

const browserFactory: AudioFactory = (src) => new Audio(src);
/**
 * `clear` bilerek sarmalanir: ciplak `clearTimeout` referansi bir nesnenin
 * yontemi olarak cagrildiginda tarayici "Illegal invocation" firlatir. Bu,
 * ogrenci geri bildirim sesi ile telaffuz arasindaki kisa beklemede "Devam"a
 * bastiginda dersi kilitliyordu.
 */
export const browserTimer: TimerDriver = {
  set: (callback, delayMs) => setTimeout(callback, delayMs),
  clear: (timer) => clearTimeout(timer),
};

/**
 * Uygulamadaki TEK ses sahibi. Egzersiz bağlamı değiştiğinde fetch, gecikme,
 * HTMLAudio ve devam callback'leri aynı generation ile geçersizleşir.
 */
export class AudioController {
  private active: AudioHandle | null = null;
  private finishActive: (() => void) | null = null;
  private abort: AbortController | null = null;
  private delayTimer: ReturnType<typeof setTimeout> | null = null;
  private finishDelay: (() => void) | null = null;
  private generation = 0;
  private contextId: string | null = null;
  private currentState: AudioState = 'idle';
  private readonly createAudio: AudioFactory;
  private readonly requestSpeech: NonNullable<AudioControllerOptions['requestSpeech']>;
  private readonly timer: TimerDriver;

  constructor(options: AudioControllerOptions | AudioFactory = {}) {
    const normalized = typeof options === 'function' ? { createAudio: options } : options;
    this.createAudio = normalized.createAudio ?? browserFactory;
    this.requestSpeech = normalized.requestSpeech ?? ((target, speed, voice, signal) => localTts.speak(target, speed, voice, signal));
    this.timer = normalized.timer ?? browserTimer;
  }

  get state(): AudioState { return this.currentState; }

  /** Yeni egzersiz mount olduğunda önce çağrılır; eski bağlamdan hiçbir şey kalmaz. */
  activate(contextId: string) {
    this.cancel();
    this.contextId = contextId;
  }

  /** Route/egzersiz unmount olduğunda sadece kendi bağlamını iptal eder. */
  dispose(contextId?: string) {
    if (contextId && this.contextId !== contextId) return;
    this.cancel();
    this.contextId = null;
  }

  cancel() {
    this.generation += 1;
    this.abort?.abort();
    this.abort = null;
    if (this.delayTimer) this.timer.clear(this.delayTimer);
    this.delayTimer = null;
    this.finishDelay?.();
    this.finishDelay = null;
    if (this.active) {
      this.active.onended = null;
      this.active.onerror = null;
      this.active.pause();
      this.active.currentTime = 0;
    }
    this.active = null;
    this.finishActive?.();
    this.finishActive = null;
    this.currentState = 'idle';
  }

  async speakGerman(
    contextId: string,
    target: GermanAudioTarget,
    speed: SpeechSpeed,
    voice: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
  ): Promise<void> {
    const generation = this.begin(contextId);
    await this.requestThenPlay(contextId, generation, target, speed, voice);
  }

  /**
   * Geri bildirim dizisi (§25):
   *   dogru/yanlis efekti → (varsa) seri kutlama efekti → kanonik Almanca.
   *
   * Tek generation altinda calisir: ogrenci hemen "Devam" derse ya da egzersiz
   * degisirse sirada bekleyen her sey (gecikme, fetch, calan ses) iptal olur.
   */
  async playFeedback(
    contextId: string,
    effect: 'correct' | 'incorrect' | 'complete',
    target: GermanAudioTarget | undefined,
    soundEffectsEnabled: boolean,
    speed: SpeechSpeed,
    voice: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
    options: { milestone?: SoundEffect } = {},
  ): Promise<void> {
    const generation = this.begin(contextId);
    if (soundEffectsEnabled) {
      this.currentState = 'feedback';
      await this.playUrl(`/audio/${effect}.wav`, contextId, generation, EFFECT_VOLUME[effect]);
      if (!this.isCurrent(contextId, generation)) return;
      await this.delay(contextId, generation, 85);
      if (options.milestone && this.isCurrent(contextId, generation)) {
        await this.playUrl(
          `/audio/${options.milestone}.wav`,
          contextId,
          generation,
          EFFECT_VOLUME[options.milestone],
        );
        if (!this.isCurrent(contextId, generation)) return;
        await this.delay(contextId, generation, 120);
      }
    }
    if (target && this.isCurrent(contextId, generation)) {
      await this.requestThenPlay(contextId, generation, target, speed, voice);
    }
  }

  /**
   * Tek bir efekt (ders tamamlama, mukemmel ders, gunluk hedef).
   * Ses efektleri kapaliysa hicbir sey calmaz ama cagri guvenlidir.
   */
  async playEffect(contextId: string, effect: SoundEffect, soundEffectsEnabled: boolean): Promise<void> {
    if (!soundEffectsEnabled) return;
    const generation = this.begin(contextId);
    this.currentState = 'feedback';
    await this.playUrl(`/audio/${effect}.wav`, contextId, generation, EFFECT_VOLUME[effect]);
  }

  private begin(contextId: string) {
    this.cancel();
    this.contextId = contextId;
    return this.generation;
  }

  private isCurrent(contextId: string, generation: number) {
    return this.contextId === contextId && this.generation === generation;
  }

  private async requestThenPlay(
    contextId: string,
    generation: number,
    target: GermanAudioTarget,
    speed: SpeechSpeed,
    voice: GermanVoiceId,
  ) {
    if (!this.isCurrent(contextId, generation)) return;
    const abort = new AbortController();
    this.abort = abort;
    this.currentState = 'generating';
    try {
      const result = await this.requestSpeech(target, speed, voice, abort.signal);
      if (!this.isCurrent(contextId, generation) || abort.signal.aborted) return;
      this.abort = null;
      await this.playUrl(result.url, contextId, generation, 0.86);
    } catch (error) {
      // Egzersiz değişimi beklenen bir abort yoludur; UI'ye hata taşınmaz.
      if (!abort.signal.aborted && this.isCurrent(contextId, generation)) throw error;
    } finally {
      if (this.isCurrent(contextId, generation) && !this.active) this.currentState = 'idle';
    }
  }

  private async delay(contextId: string, generation: number, milliseconds: number) {
    await new Promise<void>((resolve) => {
      this.finishDelay = resolve;
      this.delayTimer = this.timer.set(() => {
        this.delayTimer = null;
        this.finishDelay = null;
        resolve();
      }, milliseconds);
      if (!this.isCurrent(contextId, generation)) resolve();
    });
  }

  private async playUrl(url: string, contextId: string, generation: number, volume: number) {
    if (!this.isCurrent(contextId, generation)) return;
    const audio = this.createAudio(url);
    audio.volume = volume;
    this.active = audio;
    this.currentState = 'speaking';
    await new Promise<void>((resolve) => {
      const finish = () => {
        if (this.active === audio) this.active = null;
        if (this.finishActive === finish) this.finishActive = null;
        resolve();
      };
      this.finishActive = finish;
      audio.onended = finish;
      audio.onerror = finish;
      audio.play().catch(finish);
      if (!this.isCurrent(contextId, generation)) finish();
    });
  }
}

export const audioController = new AudioController();
