import { expect, it, vi } from "vitest";
import { ambience, caseLanding } from "../src/audio";
it("到着音は音の有効時だけ鳴り、無効に戻した後も鳴らない", async () => {
  let count = 0;
  const node = () => ({
    connect: () => node(),
    start: () => {},
    stop: () => {},
    disconnect: () => {},
    frequency: {
      value: 0,
      setValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    },
  });
  class FakeAudioContext {
    sampleRate = 8;
    currentTime = 0;
    destination = {};
    resume() {
      return Promise.resolve();
    }
    createBuffer() {
      return { getChannelData: () => new Float32Array(24) };
    }
    createBufferSource() {
      return node();
    }
    createBiquadFilter() {
      return node();
    }
    createGain() {
      return {
        ...node(),
        gain: {
          value: 0,
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
      };
    }
    createOscillator() {
      count++;
      return node();
    }
  }
  vi.stubGlobal("AudioContext", FakeAudioContext);
  try {
    caseLanding();
    expect(count).toBe(0);
    await ambience(true);
    caseLanding();
    expect(count).toBe(2);
    await ambience(false);
    caseLanding();
    expect(count).toBe(2);
  } finally {
    vi.unstubAllGlobals();
  }
});
