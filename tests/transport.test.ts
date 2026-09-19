import { expect, it } from "vitest";
import { transportRoute, transportProgress } from "../src/transport";
import { PUZZLES } from "../src/data";
import * as E from "../src/engine";
it("反対端では順序と左右を交換し高さを保つ", () => {
  expect(transportRoute(true)).toEqual([
    [2, 3],
    [1, 2],
    [3, 0],
  ]);
  expect(PUZZLES.feed.answer).toEqual(transportRoute().flat());
  expect(PUZZLES.backfeed.answer).toEqual(transportRoute(true).flat());
});
it("見本は最初の不一致でケースが止まり復帰まで後続の送りは空回りする", () => {
  expect(
    transportProgress([
      [0, 3],
      [0, 0],
      [3, 2],
    ]),
  ).toBe(1);
  expect(transportProgress(transportRoute())).toBe(3);
  expect(transportProgress(transportRoute(true), true)).toBe(3);
});
it("ハンドルなしでは軸を動かせるが送り履歴を作れない", () => {
  const s = { ...E.fresh(), room: 1 };
  expect(E.input(s, "feed", [3, 2]).values.feed).toEqual([3, 2]);
  expect(E.input(s, "feed", [0, 3, 0, 3])).toBe(s);
});
it("旧版で解いた収納の取得状況を維持する", () => {
  const s = {
    ...E.fresh(),
    room: 1,
    visited: [0, 1],
    solved: ["feed"],
    opened: ["feed"],
    collected: ["crank", "lens"],
    inventory: ["crank", "lens"],
    values: { feed: [2, 1] },
  };
  const loaded = E.parse(JSON.stringify(s))!;
  expect(loaded.solved).toContain("feed");
  expect(loaded.opened).toContain("feed");
  expect(loaded.collected).toContain("lens");
});
