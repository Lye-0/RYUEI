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

it("見本の到着状態は保存しても実機の成立条件にならない", () => {
  const s = {
    ...E.fresh(),
    room: 1,
    visited: [0, 1],
    model: { reverse: true, values: [3, 0, ...transportRoute(true).flat()] },
  };
  const restored = E.parse(JSON.stringify(s))!;
  expect(restored.model).toEqual(s.model);
  expect(restored.solved).toEqual([]);
  expect(E.correct(restored, "feed")).toBe(false);
  expect(E.input(restored, "feed", [2, 3]).values.feed).toEqual([2, 3]);
});
it("不正な見本データは破棄して本編の保存を読み込める", () => {
  const restored = E.parse(
    JSON.stringify({ ...E.fresh(), model: { reverse: false, values: [99] } }),
  )!;
  expect(restored).not.toBeNull();
  expect(restored.model).toBeUndefined();
});
