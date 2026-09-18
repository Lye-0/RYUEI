import { describe, it, expect } from "vitest";
import { PUZZLES } from "../src/data";
import * as E from "../src/engine";
function solved(s: E.State, id: string) {
  const p = PUZZLES[id];
  let next = { ...s, room: p.room };
  for (const item of p.items ?? []) next = E.install(next, id, item);
  next = E.input(next, id, [...p.answer]);
  next = E.solve(next, id);
  expect(next.solved).toContain(id);
  expect(next.inventory).toEqual(
    expect.arrayContaining(s.inventory.filter((x) => !p.items?.includes(x))),
  );
  next = E.open(next, id);
  for (const item of p.rewards ?? []) next = E.take(next, id, item);
  return next;
}
describe("写真館の状態と進行", () => {
  it("解錠・開蓋・取得が独立する", () => {
    let s = E.fresh();
    s = E.input(s, "panel", [0, 2, 1]);
    s = E.solve(s, "panel");
    expect(s.inventory).toEqual([]);
    expect(E.take(s, "panel", "brassKey")).toBe(s);
    s = E.open(s, "panel");
    s = E.take(s, "panel", "brassKey");
    expect(s.inventory).toEqual(["brassKey"]);
    expect(E.take(s, "panel", "brassKey")).toBe(s);
  });
  it("正しい物の明示選択で扉を開ける", () => {
    let s = solved(E.fresh(), "panel");
    expect(E.move(s, 1, null)).toBe(s);
    expect(E.move(s, 1, "lens")).toBe(s);
    s = E.move(s, 1, "brassKey");
    expect(s.room).toBe(1);
    expect(s.inventory).not.toContain("brassKey");
    expect(s.doors).toContain("gallery");
  });
  it("全仕掛けを実際の報酬と設置を使って解き、終了する", () => {
    let s = E.fresh();
    s.started = true;
    for (const id of [
      "panel",
      "frames",
      "rack",
      "lamp",
      "feed",
      "cut",
      "develop",
      "camera",
      "shutters",
      "panorama",
      "masks",
      "wall",
      "backfeed",
      "print",
      "beyond",
    ])
      s = solved(s, id);
    s = E.finish(s);
    expect(s.finished).toBe(true);
    expect(s.solved).toHaveLength(15);
    expect(s.inventory).toContain("crank");
    expect(s.inventory).toContain("portrait");
  });
  it("天井と床から直前の壁へ戻る", () => {
    for (let face = 0; face < 4; face++) {
      const s = { ...E.fresh(), face, wall: face };
      expect(E.turn(E.turn(s, "up"), "down").face).toBe(face);
      expect(E.turn(E.turn(s, "down"), "up").face).toBe(face);
    }
  });
  it("使い終えた部品を参照しても入力は変わらない", () => {
    let s = solved(E.fresh(), "panel");
    s.room = 2;
    s.inventory.push("crank");
    s.collected.push("crank");
    s.room = 1;
    s = E.install(s, "feed", "crank");
    s = E.input(s, "feed", [2, 0]);
    const before = s.values.feed;
    s = { ...s, room: 2 };
    s = E.observe(s, "model");
    expect(s.values.feed).toBe(before);
    expect(s.installed.feed).toContain("crank");
  });
  it("前提なし・別室からの解錠、未取得品の設置を拒否", () => {
    const s = E.fresh();
    expect(E.install(s, "feed", "crank")).toBe(s);
    expect(E.input(s, "feed", [2, 1])).toBe(s);
    expect(E.solve(s, "feed")).toBe(s);
    expect(E.finish(s)).toBe(s);
  });
  it("先の部屋や未訪問の部屋へ移動しない", () => {
    const s = E.fresh();
    expect(E.move(s, 5, null)).toBe(s);
    expect(E.move(s, 4, null, true)).toBe(s);
  });
  it("右の爪は左が引くまで動かない。裏室では逆", () => {
    let s = { ...E.fresh(), room: 1 };
    expect(E.feedStep(s, "feed", 1)).toEqual([0, 0]);
    s.values.feed = [2, 0];
    expect(E.feedStep(s, "feed", 1)).toEqual([2, 1]);
    s.values.backfeed = [0, 2];
    expect(E.feedStep(s, "backfeed", 0)).toEqual([1, 2]);
    s.values.feed = [2, 1];
    expect(E.feedStep(s, "feed", 0)).toEqual([0, 0]);
    expect(s.values.feed).toEqual([2, 1]);
    s.values.backfeed = [1, 2];
    expect(E.feedStep(s, "backfeed", 1)).toEqual([0, 0]);
  });
  it("不正な並びと重複選択を保存しない", () => {
    expect(E.validValues("frames", [0, 0, 1, 2])).toBe(false);
    expect(E.validValues("rack", [2, 2])).toBe(false);
    expect(E.validValues("camera", [Infinity, 0, 0])).toBe(false);
  });
  it("途中入力・開蓋・未取得を復元できる", () => {
    let s = E.fresh();
    s.started = true;
    s = E.input(s, "panel", [0, 2, 1]);
    s = E.open(E.solve(s, "panel"), "panel");
    expect(E.parse(JSON.stringify(s))).toEqual(s);
    expect(E.parse("{")).toBe(null);
    expect(E.parse(JSON.stringify({ ...s, inventory: ["unknown"] }))).toBe(
      null,
    );
  });
});
