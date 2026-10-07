/**
 * Sacred Temple Sound Synthesizer using Web Audio API
 * Generates an authentic brass temple bell / ghanti resonance (fundamental + octaves + slow ring decay)
 */

let audioCtx: AudioContext | null = null;

export const playTempleBellChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Master Gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.3, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
    masterGain.connect(audioCtx.destination);

    // Harmonics for a rich brass temple bell (A4 fundamental ~ 432Hz / 528Hz healing resonance)
    const frequencies = [432, 864, 1296, 1728, 2592];
    const gains = [0.6, 0.35, 0.2, 0.1, 0.05];

    frequencies.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Sine wave with subtle frequency wobble for authentic brass overtone
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      // Decay profile
      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx === 0 ? 3.0 : 1.8 - idx * 0.2));

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 3.2);
    });
  } catch {
    // Graceful fallback if audio context is blocked
  }
};
