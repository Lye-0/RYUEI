import { ITEMS, PUZZLES, ROOMS } from "./data";
import * as E from "./engine";

const missingRequirements = (s: E.State, id: string) =>
  [
    ...(PUZZLES[id].requires ?? []),
    ...(id === "beyond" ? ["print"] : []),
  ].filter((x) => !s.solved.includes(x));
const missingItems = (s: E.State, id: string) =>
  (PUZZLES[id].items ?? []).filter(
    (x) => !s.installed[id]?.includes(x) && !s.inventory.includes(x),
  );
export function hintComplete(s: E.State, id: string) {
  const p = PUZZLES[id];
  return (
    s.solved.includes(id) &&
    (!p.rewards?.length || p.rewards.every((x) => s.collected.includes(x))) &&
    (id !== "beyond" || s.finished)
  );
}
export function recommendedHint(s: E.State, focused?: string) {
  const candidates = Object.values(PUZZLES).filter(
    (p) => s.visited.includes(p.room) && !hintComplete(s, p.id),
  );
  const score = (id: string) => {
    const p = PUZZLES[id];
    return (
      (id === focused ? 1000 : 0) +
      (p.room === s.room ? 30 : 0) +
      (s.solved.includes(id)
        ? 800
        : !missingRequirements(s, id).length && !missingItems(s, id).length
          ? 700
          : 100)
    );
  };
  return (
    candidates.sort((a, b) => score(b.id) - score(a.id))[0]?.id ??
    Object.values(PUZZLES).find((p) => p.room === s.room)?.id ??
    "panel"
  );
}
export function hintSituation(
  s: E.State,
  id: string,
): { text: string; steps: boolean } {
  const p = PUZZLES[id];
  if (s.solved.includes(id)) {
    const remaining = p.rewards?.filter((x) => !s.collected.includes(x)) ?? [];
    if (remaining.length)
      return {
        text: s.opened.includes(id)
          ? "仕掛けは解けています。中にある「" +
            remaining.map((x) => ITEMS[x].name).join("」「") +
            "」を押して拾ってください。"
          : "仕掛けは解けています。" +
            (id === "panel" ? "金具の左側にある木の板" : "収納の取っ手") +
            "を押すと、中の物を取れます。",
        steps: false,
      };
    if (id === "beyond" && !s.finished)
      return {
        text: s.opened.includes(id)
          ? "扉は開いています。開いた戸口を押して外へ進んでください。"
          : "留め具は解除されています。扉の下半分を押して開けてください。",
        steps: false,
      };
    if (s.inventory.includes("brassKey"))
      return {
        text: "受付の側板は完了しています。「廊下の鍵」を持ち物から選び、受付右側の扉を調べて鍵を使ってください。",
        steps: false,
      };
    if (s.inventory.includes("archiveKey"))
      return {
        text: "この仕掛けは完了しています。「暗室の鍵」で、展示廊下にある赤いガラスの扉を開けられます。修整室も調べてください。",
        steps: false,
      };
    return {
      text: "この仕掛けは完了しています。ほかの未完了の場所を選ぶと、そこから進めるためのヒントを読めます。",
      steps: false,
    };
  }
  const requirements = missingRequirements(s, id);
  if (requirements.length)
    return {
      text:
        "先に" +
        requirements
          .map(
            (x) =>
              ROOMS[PUZZLES[x].room].name + "の「" + PUZZLES[x].name + "」",
          )
          .join("と") +
        "を解く必要があります。",
      steps: false,
    };
  const missing = missingItems(s, id);
  if (missing.length)
    return {
      text: missing
        .map((x) => {
          const mounted = Object.keys(s.installed).find((key) =>
            s.installed[key]?.includes(x),
          );
          if (mounted)
            return (
              "「" +
              ITEMS[x].name +
              "」は" +
              ROOMS[PUZZLES[mounted].room].name +
              "の「" +
              PUZZLES[mounted].name +
              "」に付いています。装置のハンドルを押して外してください。"
            );
          const source = Object.values(PUZZLES).find((p) =>
            p.rewards?.includes(x),
          )!;
          return (
            "「" +
            ITEMS[x].name +
            "」が必要です。" +
            ROOMS[source.room].name +
            "の「" +
            source.name +
            "」で手に入ります。"
          );
        })
        .join(" "),
      steps: false,
    };
  const install = (p.items ?? []).filter((x) => !s.installed[id]?.includes(x));
  const locations: Record<string, string> = {
    lamp: "ランプの傘の内側",
    feed: "搬送口の上にある四角い穴",
    backfeed: "送り口の四角い穴",
    camera: "カメラ右側のレンズ位置",
    shutters: "三つのボタンの下にある差し込み口",
    develop: "黒いトレー",
    panorama: "四枚の写真を掛ける場所",
    masks: "三つ並んだガラス枠",
    wall: "背景幕の右側にある巻き上げ軸",
    cut: "切り抜く台紙",
    print: "中央の焼付け枠",
  };
  if (install.length)
    return {
      text:
        "持ち物の「" +
        install.map((x) => ITEMS[x].name).join("」「") +
        "」を選び、" +
        (locations[id] ?? "使う場所") +
        "を押してください。" +
        (install.length > 1 ? "一つずつ取り付けます。" : ""),
      steps: false,
    };
  return {
    text: ROOMS[p.room].name + "の「" + p.name + "」を進められます。",
    steps: true,
  };
}
export function operationHint(s: E.State, id: string) {
  const p = PUZZLES[id],
    v = E.values(s, id);
  if (p.kind === "select") {
    const wrong = v.filter((x) => !p.answer.includes(x)),
      needed = p.answer.filter((x) => !v.includes(x));
    return (
      (wrong.length
        ? "選び直すため、「" +
          wrong.map((i) => p.labels[i]).join("」「") +
          "」をもう一度押してください。 "
        : "") +
      (needed.length
        ? "「" +
          needed.map((i) => p.labels[i]).join("」「") +
          "」を押してください。"
        : "選ぶ場所は合っています。") +
      (id === "panel"
        ? "三つが縦になったら、金具の左の木の板を押して開けます。"
        : id === "rack"
          ? "その後、棚の下の引き出しの取っ手を押します。"
          : "切り抜いた中の三枚の板を押して拾います。")
    );
  }
  if (p.kind === "settings" || p.kind === "rotate") {
    const turns = p.answer.map(
      (x, i) => (x - v[i] + (p.size ?? 4)) % (p.size ?? 4),
    );
    const names =
      id === "camera"
        ? [
            "下部の左のつまみ（撮影位置）",
            "下部の中央のつまみ（焦点）",
            "下部の右のつまみ（高さ）",
          ]
        : id === "lamp"
          ? ["ランプの傘"]
          : ["左のガラス", "中央のガラス", "右のガラス"];
    return (
      "今の状態から、" +
      turns
        .map((n, i) => names[i] + (n ? "を" + n + "回押す" : "はそのまま"))
        .join("、") +
      "。"
    );
  }
  if (p.kind === "feed") {
    const queue = [{ v, path: [] as number[] }],
      seen = new Set<string>();
    while (queue.length) {
      const q = queue.shift()!;
      if (E.same(q.v, p.answer))
        return q.path.length
          ? "今の位置から、" +
              q.path
                .map((i) => (i === 0 ? "左のレバー" : "右のレバー"))
                .join(" → ") +
              "の順に押してください。その後、収納の取っ手を押します。"
          : "レバーの位置は合っています。収納の取っ手を押してください。";
      const key = q.v.join();
      if (seen.has(key)) continue;
      seen.add(key);
      for (const i of [0, 1])
        queue.push({
          v: E.feedStep({ ...s, values: { ...s.values, [id]: q.v } }, id, i),
          path: [...q.path, i],
        });
    }
  }
  if (p.kind === "sequence" || p.kind === "develop") {
    const prefix =
      v.length < p.answer.length && v.every((x, i) => x === p.answer[i]);
    const rest = prefix ? p.answer.slice(v.length) : p.answer;
    const fill = !prefix ? Math.max(0, p.answer.length - v.length) : 0;
    return (
      (fill
        ? "今の入力は途中で異なっています。「" +
          p.labels[0] +
          "」を" +
          fill +
          "回押して一区切りにしてください。続いて、"
        : "今の状態から、") +
      rest.map((i) => p.labels[i]).join(" → ") +
      "の順に押してください。"
    );
  }
  return p.hint[2];
}
