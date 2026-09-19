// The two openings in each partition, measured from the bottom detent.
// Viewed from the crescent end. The opposite end reverses order and swaps sides.
export const PARTITIONS: readonly (readonly [number, number])[] = [
  [0, 3],
  [2, 1],
  [3, 2],
];
export function transportRoute(reverse = false): number[][] {
  return reverse
    ? [...PARTITIONS].reverse().map(([l, r]) => [r, l])
    : PARTITIONS.map((p) => [...p]);
}
export function transportProgress(
  attempt: number[][],
  reverse = false,
): number {
  const route = transportRoute(reverse);
  let passed = 0;
  for (const pair of attempt) {
    if (
      passed >= 3 ||
      pair[0] !== route[passed][0] ||
      pair[1] !== route[passed][1]
    )
      break;
    passed++;
  }
  return passed;
}
