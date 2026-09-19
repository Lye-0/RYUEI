import { describe, expect, it } from "vitest";
import { ITEMS, PUZZLES, ROOMS } from "../src/data";
import { MASTER, MECHANISMS, sceneNodes } from "../src/sceneGeometry";
import { itemPortrait } from "../src/SceneDocument";
import catalog from "../src/assets.json";
import * as E from "../src/engine";
describe("写真・操作・保存の整合", () => {
  it("取得物の写真が採用済み画像だけを参照する", () => {
    for (const id of Object.keys(ITEMS)) {
      const p = itemPortrait(id);
      expect(catalog).toHaveProperty(p.sheet + ":" + p.tile);
    }
  });
  it("全視点と開閉・空の収納が採用済み画像を参照する", () => {
    for (let r = 0; r < ROOMS.length; r++)
      for (let f = 0; f < 6; f++)
        expect(catalog).toHaveProperty(
          MASTER[r + ":" + f]
            ? MASTER[r + ":" + f] + ":0"
            : ROOMS[r].id + ":" + f,
        );
    for (const m of Object.values(MECHANISMS)) {
      if (m.state) {
        expect(catalog).toHaveProperty(m.state + "-open:0");
        if (m.pickups) expect(catalog).toHaveProperty(m.state + "-empty:0");
      }
    }
  });
  it("小さな受け渡し口を人の通路として扱わない", () => {
    expect(
      sceneNodes(3, 3).some((n) => n.type === "door" && n.target === "4"),
    ).toBe(false);
    expect(
      sceneNodes(4, 3).some((n) => n.type === "door" && n.target === "3"),
    ).toBe(false);
    expect(E.move({ ...E.fresh(), room: 3 }, 4, null).room).toBe(3);
  });
  it("作業灯と無関係な引き出しは直接開き、照明の謎を勝手に解かない", () => {
    const s = { ...E.fresh(), room: 2 };
    const open = E.open(s, "lamp");
    expect(open.opened).toContain("lamp");
    expect(open.solved).not.toContain("lamp");
    expect(E.take(open, "lamp", "scissors").inventory).toContain("scissors");
  });
  it("旧版の移動済み扉と作業灯の保存データを復元する", () => {
    const old: any = {
      ...E.fresh(),
      room: 1,
      visited: [0, 1, 4],
      doors: ["gallery"],
      values: { lamp: [0, 2] },
    };
    delete old.openDoors;
    const restored = E.parse(JSON.stringify(old));
    expect(restored?.openDoors).toEqual(["gallery", "studio"]);
    expect(restored?.values.lamp).toEqual([2]);
  });
  it("開扉前に終了しない", () => {
    const s = { ...E.fresh(), room: 5, solved: ["beyond"] };
    expect(E.finish(s)).toBe(s);
    expect(E.finish(E.open(s, "beyond")).finished).toBe(true);
  });
  it("紙と乾板はそれぞれ一度ずつ枠へ入り、取り違えで失われない", () => {
    let s = {
      ...E.fresh(),
      room: 5,
      inventory: ["paper", "finalPlate"],
      collected: ["paper", "finalPlate"],
    };
    expect(E.install(s, "print", "brassKey")).toBe(s);
    s = E.install(s, "print", "finalPlate");
    expect(s.inventory).toEqual(["paper"]);
    s = E.install(s, "print", "paper");
    expect(s.installed.print).toEqual(["finalPlate", "paper"]);
    expect(s.inventory).toEqual([]);
  });
  it("受付の押さえは独立し、順序の暗号にしない", () => {
    for (const order of [
      [2, 1, 0],
      [1, 0, 2],
      [0, 2, 1],
    ])
      expect(
        E.solve(E.input(E.fresh(), "panel", order), "panel").solved,
      ).toContain("panel");
  });
});

it("旧版の受付の重複入力だけで進行全体を消さない", () => {
  const old = { ...E.fresh(), started: true, values: { panel: [0, 0, 2] } };
  const parsed = E.parse(JSON.stringify(old));
  expect(parsed?.started).toBe(true);
  expect(parsed?.values.panel).toEqual([0, 2]);
});

it("旧版の答え合わせ待ちだった灯りも、物の位置から復元する", () => {
  const old = {
    ...E.fresh(),
    values: { lamp: [0, 2] },
    installed: { lamp: ["bulb"] },
    collected: ["bulb"],
  };
  expect(E.parse(JSON.stringify(old))?.solved).toContain("lamp");
});
