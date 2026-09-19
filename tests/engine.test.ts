import { describe, it, expect } from "vitest";
import { PUZZLES } from "../src/data";
import * as E from "../src/engine";
function solved(s: E.State, id: string) {
  const p = PUZZLES[id];
  let next = { ...s, room: p.room };
  for (const item of p.items ?? []) next = E.install(next, id, item);
  if (p.kind === "feed") {
    for (let i = 0; i < 6; i += 2) {
      next = E.input(next, id, [
        ...p.answer.slice(i, i + 2),
        ...E.values(next, id).slice(2),
      ]);
      next = E.advanceFeed(next, id);
    }
  } else next = E.input(next, id, [...p.answer]);
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
    s = E.unlockDoor(s, 1, "brassKey");
    expect(s.room).toBe(0);
    expect(E.move(s, 1, null)).toBe(s);
    s = E.openDoor(s, 1);
    expect(s.room).toBe(0);
    s = E.move(s, 1, null);
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
  it("案内軸は道具も見本の履歴もなく動き、送りだけはハンドルを要する", () => {
    let s = { ...E.fresh(), room: 1 };
    s = E.input(s, "feed", E.feedStep(s, "feed", 1));
    expect(s.values.feed).toEqual([0, 1]);
    expect(E.advanceFeed(s, "feed")).toBe(s);
    expect(s.seen).toEqual([]);
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

it("送りハンドルは一台だけに付き、取り外し・開蓋後に再利用できる", () => {
  let s = {
    ...E.fresh(),
    started: true,
    room: 1,
    visited: [0, 1, 5],
    inventory: ["crank", "handle"],
    collected: ["crank", "handle"],
  };
  expect(E.install(s, "feed", "handle")).toBe(s);
  s = E.install(s, "feed", "crank");
  expect(s.inventory).not.toContain("crank");
  expect(E.parse(JSON.stringify(s))?.installed.feed).toContain("crank");
  expect(
    E.install({ ...s, room: 5 }, "backfeed", "crank").installed.backfeed,
  ).toBeUndefined();
  s = E.detachCrank(s, "feed");
  expect(s.inventory.filter((x) => x === "crank")).toHaveLength(1);
  s = E.install(s, "feed", "crank");
  for (let i = 0; i < 6; i += 2) {
    s = E.input(s, "feed", [
      ...PUZZLES.feed.answer.slice(i, i + 2),
      ...E.values(s, "feed").slice(2),
    ]);
    s = E.advanceFeed(s, "feed");
  }
  s = E.open(s, "feed");
  expect(s.opened).toContain("feed");
  expect(s.installed.feed).not.toContain("crank");
  expect(s.inventory).toContain("crank");
  s = E.install({ ...s, room: 5 }, "backfeed", "crank");
  expect(s.installed.backfeed).toContain("crank");
});

it("旧保存の二重設置を現在の部屋の一台へ整理する", () => {
  const old = {
    ...E.fresh(),
    room: 5,
    visited: [0, 1, 5],
    inventory: ["crank"],
    collected: ["crank"],
    installed: { feed: ["crank"], backfeed: ["crank"] },
  };
  const restored = E.parse(JSON.stringify(old))!;
  expect(restored.inventory).not.toContain("crank");
  expect(restored.installed.feed).toEqual([]);
  expect(restored.installed.backfeed).toEqual(["crank"]);
  const done = E.parse(
    JSON.stringify({
      ...old,
      solved: ["feed", "backfeed"],
      opened: ["feed", "backfeed"],
    }),
  )!;
  expect(done.inventory.filter((x) => x === "crank")).toHaveLength(1);
  expect(done.installed.feed).toEqual([]);
  expect(done.installed.backfeed).toEqual([]);
});

it("三段送りは各4096通りの中で物理的な通過列だけが成立する", () => {
  for (const id of ["feed", "backfeed"]) {
    let count = 0;
    for (let n = 0; n < 4096; n++) {
      const a = Array.from({ length: 6 }, (_, i) => (n >> (i * 2)) & 3);
      let s = {
        ...E.fresh(),
        room: PUZZLES[id].room,
        installed: { [id]: ["crank"] },
      };
      for (let i = 0; i < 6; i += 2) {
        s = E.input(s, id, [...a.slice(i, i + 2), ...E.values(s, id).slice(2)]);
        s = E.advanceFeed(s, id);
        if (i < 4) expect(s.solved).not.toContain(id);
      }
      if (s.solved.includes(id)) count++;
    }
    expect(count).toBe(1);
  }
});
it("途中失敗は三段終了まで入力を止めず、復帰してやり直せる", () => {
  let s: E.State = {
    ...E.fresh(),
    started: true,
    room: 1,
    visited: [0, 1],
    collected: ["crank"],
    installed: { feed: ["crank"] },
  };
  s = E.advanceFeed(s, "feed");
  s = E.advanceFeed(s, "feed");
  expect(E.values(s, "feed")).toHaveLength(6);
  expect(E.parse(JSON.stringify(s))?.values.feed).toEqual(s.values.feed);
  s = E.advanceFeed(s, "feed");
  expect(s.solved).toEqual([]);
  s = E.resetFeed(s, "feed");
  expect(E.values(s, "feed")).toEqual([0, 0]);
});
