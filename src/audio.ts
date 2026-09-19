let requested = false;
let context: AudioContext | undefined;
let rain: AudioBufferSourceNode | undefined;
let level: GainNode | undefined;
export async function ambience(on: boolean) {
  requested = on;
  if (!on) {
    if (level) level.gain.value = 0;
    return;
  }
  context ??= new AudioContext();
  await context.resume();
  if (!requested) return;
  if (!rain) {
    const buffer = context.createBuffer(
      1,
      context.sampleRate * 3,
      context.sampleRate,
    );
    const a = buffer.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * 0.28;
    rain = context.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    level = context.createGain();
    rain.connect(filter).connect(level).connect(context.destination);
    rain.start();
  }
  if (level) level.gain.value = 0.12;
}
export function tick(solved = false) {
  if (!context || !level || level.gain.value === 0) return;
  const o = context.createOscillator(),
    g = context.createGain();
  o.type = "sine";
  o.frequency.value = solved ? 440 : 150;
  g.gain.setValueAtTime(0.06, context.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
  o.connect(g).connect(context.destination);
  o.start();
  o.stop(context.currentTime + 0.18);
}

// A short wooden landing sound; never starts audio when sound is disabled.
export function caseLanding() {
  if (!requested || !context || !level || level.gain.value === 0) return;
  const now = context.currentTime;
  for (const [delay, hz, gain] of [
    [0, 170, 0.1],
    [0.065, 95, 0.055],
  ]) {
    const oscillator = context.createOscillator(),
      envelope = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(hz, now + delay);
    oscillator.frequency.exponentialRampToValueAtTime(
      hz * 0.45,
      now + delay + 0.09,
    );
    envelope.gain.setValueAtTime(gain, now + delay);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);
    oscillator.connect(envelope).connect(context.destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.15);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
}
