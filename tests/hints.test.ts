import { describe, it, expect } from "vitest";
import { fresh } from "../src/engine";
import { recommendedHint, hintSituation, operationHint } from "../src/hints";

describe("進行に合うヒント", () => {
  it("開始時は受付の側板を選ぶ", () =>
    expect(recommendedHint(fresh())).toBe("panel"));
  it("開けた後は謎の答えでなく未取得の道具を案内する", () => {
    const s = { ...fresh(), solved: ["panel"], opened: ["panel"] };
    expect(hintSituation(s, "panel")).toEqual({
      steps: false,
      text: expect.stringContaining("廊下の鍵"),
    });
  });
  it("完了済みの場所から、今の部屋で進められる未完了の場所へ移る", () => {
    const s = {
      ...fresh(),
      room: 2,
      visited: [0, 1, 2],
      solved: ["panel", "frames"],
      collected: ["brassKey", "archiveKey", "bulb"],
      inventory: ["bulb"],
    };
    expect(recommendedHint(s, "frames")).toBe("rack");
  });
  it("前提が未達の仕掛けより、道具がそろった仕掛けを選ぶ", () => {
    const s = {
      ...fresh(),
      room: 4,
      visited: [0, 1, 2, 3, 4],
      solved: [
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
      ],
      collected: [
        "brassKey",
        "archiveKey",
        "bulb",
        "crank",
        "plate",
        "scissors",
        "lens",
        "mask",
        "print",
        "cable",
        "handle",
        "finalPlate",
      ],
      inventory: ["mask", "handle"],
    };
    expect(recommendedHint(s)).toBe("masks");
    expect(hintSituation(s, "wall").steps).toBe(false);
  });
  it("調べている未完了の仕掛けを優先する", () => {
    const s = { ...fresh(), room: 2, visited: [0, 1, 2] };
    expect(recommendedHint(s, "lamp")).toBe("lamp");
    expect(hintSituation(s, "lamp").text).toContain("電球");
  });
  it("すでに一度動かした灯りの残り回数を案内する", () => {
    const s = { ...fresh(), values: { lamp: [1] } };
    expect(operationHint(s, "lamp")).toContain("1回");
  });
  it("選択済みの金具をもう一度解除するよう案内しない", () => {
    const s = { ...fresh(), values: { panel: [0, 1] } };
    const text = operationHint(s, "panel");
    expect(text).toContain("下の押さえ");
    expect(text).not.toContain("上の押さえ");
  });
  it("途中まで正しい押し順なら残りだけを案内する", () => {
    const s = { ...fresh(), values: { shutters: [2, 2] } };
    expect(operationHint(s, "shutters")).toContain("上灯 → 左灯 → 左灯");
  });
  it("最後の扉は最後の写真が未完成なら焼付けを案内する", () => {
    const s = { ...fresh(), solved: ["backfeed"] };
    expect(hintSituation(s, "beyond").text).toContain("最後の焼付け");
  });
});
