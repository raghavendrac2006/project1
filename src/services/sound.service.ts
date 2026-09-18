/**
 * sound.service.ts
 * Synthesized Web Audio acoustic engine for SAMAGRA.
 * Generates calibrated, zero-latency micro-sounds completely in-browser
 * without external audio files or network overhead.
 */

const STORAGE_KEY = 'samagra_sound_enabled'

class SoundService {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      this.enabled = stored === null ? true : stored === 'true'
    } catch {
      this.enabled = true
    }
  }

  /**
   * Initializes or resumes the AudioContext on user interaction
   * (conforming to modern browser autoplay policies).
   */
  private getContext(): AudioContext | null {
    if (!this.enabled) return null
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      return this.ctx
    } catch {
      return null
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    try {
      localStorage.setItem(STORAGE_KEY, String(this.enabled))
    } catch {
      // ignore
    }
    if (this.enabled) {
      this.tactileClick()
    }
    return this.enabled
  }

  public setEnabled(val: boolean): void {
    this.enabled = val
    try {
      localStorage.setItem(STORAGE_KEY, String(val))
    } catch {
      // ignore
    }
  }

  /**
   * Triggers hardware haptic vibration if supported (mobile/tablets)
   */
  public haptic(pattern: number | number[] = 15): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern)
      }
    } catch {
      // ignore
    }
  }

  /**
   * 1. High-frequency subtle acoustic sonar ping for live telemetry stream events.
   */
  public radarPing(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1480, now)
      osc.frequency.exponentialRampToValueAtTime(1850, now + 0.08)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.22)
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * 2. Crisp electronic query chime when biometric verification is requested.
   */
  public biometricPrompt(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      this.haptic([10, 20])
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'triangle'

      osc1.frequency.setValueAtTime(659.25, now) // E5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1) // A5

      osc2.frequency.setValueAtTime(329.63, now) // E4
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.1)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.28)
      osc2.stop(now + 0.28)
    } catch {
      // ignore
    }
  }

  /**
   * 3. Crystalline dual-tone harmonic chord (880Hz + 1320Hz) on successful biometric attestation.
   */
  public biometricSuccess(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      this.haptic([15, 30, 25])
      const now = ctx.currentTime

      const freqs = [880, 1320, 1760] // A5, E6, A6 harmonics
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.05)

        gain.gain.setValueAtTime(0.07 / (idx + 1), now + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.05)
        osc.stop(now + idx * 0.05 + 0.45)
      })
    } catch {
      // ignore
    }
  }

  /**
   * 4. Deep sub-bass drop with resonant filter sweep for Emergency Lockdown.
   */
  public emergencyLockdown(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      this.haptic([40, 60, 80])
      const now = ctx.currentTime

      // Sub-bass oscillator
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.5)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(600, now)
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.5)
      filter.Q.setValueAtTime(4, now)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.6)
    } catch {
      // ignore
    }
  }

  /**
   * 5. Clean 8ms micro-transient for tactile UI clicks.
   */
  public tactileClick(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      this.haptic(8)
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.015)

      gain.gain.setValueAtTime(0.03, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.015)
    } catch {
      // ignore
    }
  }

  /**
   * 6. Ascending frequency sweep on perimeter shield activation.
   */
  public shieldEngage(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService()
