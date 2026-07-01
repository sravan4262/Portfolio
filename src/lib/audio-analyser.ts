// Shared Web Audio graph so the talking avatar can react to whatever clip is
// playing. A MediaElementSource can only be created once per <audio> element,
// so we cache one per element and route src → analyser → speakers.

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
const sources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

export function getAnalyser(el: HTMLAudioElement): AnalyserNode | null {
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  if (!ctx || !analyser) {
    ctx = new AC();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    analyser.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();

  if (!sources.has(el)) {
    try {
      const src = ctx.createMediaElementSource(el);
      src.connect(analyser);
      sources.set(el, src);
    } catch {
      // already wired or not allowed — analyser just won't see this element
    }
  }
  return analyser;
}
