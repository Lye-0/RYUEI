import { CLUES, ITEMS, PUZZLES, ROOMS } from "./data";
export const SAVE_KEY = "ryuei:save:v1";
export type State = {
  version: 1;
  started: boolean;
  room: number;
  face: number;
  wall: number;
  visited: number[];
  doors: string[];
  inventory: string[];
  installed: Record<string, string[]>;
  solved: string[];
  opened: string[];
  collected: string[];
  values: Record<string, number[]>;
  seen: string[];
  hints: Record<string, number>;
  finished: boolean;
  sound: boolean;
  brightness: number;
  motion: boolean;
  elapsed: number;
};
export const fresh = (): State => ({
  version: 1,
  started: false,
  room: 0,
  face: 0,
  wall: 0,
  visited: [0],
  doors: [],
  inventory: [],
  installed: {},
  solved: [],
  opened: [],
  collected: [],
  values: {},
  seen: [],
  hints: {},
  finished: false,
  sound: false,
  brightness: 1,
  motion: true,
  elapsed: 0,
});
export const same = (a: number[], b: number[]) =>
  a.length === b.length && a.every((n, i) => n === b[i]);
export function available(s: State, id: string) {
  const p = PUZZLES[id];
  return (
    !!p &&
    p.room === s.room &&
    (!p.requires || p.requires.every((x) => s.solved.includes(x))) &&
    (!p.items || p.items.every((x) => s.installed[id]?.includes(x)))
  );
}
export const values = (s: State, id: string) =>
  s.values[id] ?? PUZZLES[id].initial;
export function install(s: State, id: string, item: string): State {
  const p = PUZZLES[id];
  if (
    !p ||
    p.room !== s.room ||
    !p.items?.includes(item) ||
    !s.inventory.includes(item) ||
    s.installed[id]?.includes(item)
  )
    return s;
  return {
    ...s,
    inventory: ITEMS[item].reusable
      ? s.inventory
      : s.inventory.filter((x) => x !== item),
    installed: { ...s.installed, [id]: [...(s.installed[id] ?? []), item] },
  };
}
export function input(s: State, id: string, next: number[]): State {
  if (!available(s, id) || s.solved.includes(id) || !validValues(id, next))
    return s;
  return { ...s, values: { ...s.values, [id]: next } };
}
export function validValues(id: string, a: unknown): a is number[] {
  const p = PUZZLES[id];
  if (!p || !Array.isArray(a) || !a.every((n) => Number.isInteger(n) && n >= 0))
    return false;
  if (["sequence", "develop"].includes(p.kind))
    return a.length <= p.answer.length && a.every((n) => n < p.labels.length);
  if (["select", "map"].includes(p.kind))
    return (
      a.length <= p.labels.length &&
      new Set(a).size === a.length &&
      a.every((n) => n < p.labels.length)
    );
  if (p.kind === "order")
    return (
      a.length === p.initial.length &&
      new Set(a).size === a.length &&
      a.every((n) => n < p.initial.length)
    );
  return a.length === p.initial.length && a.every((n) => n < (p.size ?? 4));
}
export function correct(s: State, id: string) {
  const p = PUZZLES[id],
    v = values(s, id);
  return p.kind === "select"
    ? same([...v].sort(), [...p.answer].sort())
    : same(v, p.answer);
}
export function solve(s: State, id: string): State {
  if (!available(s, id) || s.solved.includes(id) || !correct(s, id)) return s;
  return { ...s, solved: [...s.solved, id] };
}
export function open(s: State, id: string): State {
  if (
    PUZZLES[id]?.room !== s.room ||
    !s.solved.includes(id) ||
    s.opened.includes(id)
  )
    return s;
  return { ...s, opened: [...s.opened, id] };
}
export function take(s: State, id: string, item: string): State {
  if (
    PUZZLES[id]?.room !== s.room ||
    !s.opened.includes(id) ||
    !PUZZLES[id].rewards?.includes(item) ||
    s.collected.includes(item)
  )
    return s;
  return {
    ...s,
    collected: [...s.collected, item],
    inventory: [...s.inventory, item],
  };
}
export function turn(s: State, dir: "left" | "right" | "up" | "down"): State {
  if (s.face === 4) return dir === "down" ? { ...s, face: s.wall } : s;
  if (s.face === 5) return dir === "up" ? { ...s, face: s.wall } : s;
  if (dir === "up" || dir === "down")
    return { ...s, wall: s.face, face: dir === "up" ? 4 : 5 };
  const face = (s.face + (dir === "left" ? 3 : 1)) % 4;
  return { ...s, face, wall: face };
}
export const neighbors: Record<number, number[]> = {
  0: [1],
  1: [0, 2, 3, 4],
  2: [1],
  3: [1, 4],
  4: [1, 3, 5],
  5: [4],
};
export function doorRequirement(s: State, to: number) {
  if (s.room === 0 && to === 1 && !s.doors.includes("gallery"))
    return "brassKey";
  if (to === 3 && !s.doors.includes("darkroom")) return "archiveKey";
  return null;
}
export function move(
  s: State,
  to: number,
  selected: string | null,
  fast = false,
): State {
  if (
    !Number.isInteger(to) ||
    !ROOMS[to] ||
    (!fast && !neighbors[s.room].includes(to)) ||
    (fast && !s.visited.includes(to))
  )
    return s;
  if (to === 5 && !s.opened.includes("wall")) return s;
  const key = doorRequirement(s, to);
  if (key && (!s.inventory.includes(key) || selected !== key)) return s;
  return {
    ...s,
    room: to,
    face: to === 0 ? 0 : to === 4 ? 0 : 0,
    wall: 0,
    visited: [...new Set([...s.visited, to])],
    inventory: key ? s.inventory.filter((x) => x !== key) : s.inventory,
    doors: key
      ? [...s.doors, key === "brassKey" ? "gallery" : "darkroom"]
      : s.doors,
  };
}
export function feedStep(s: State, id: string, i: number) {
  const a = [...values(s, id)];
  const lead = id === "backfeed" ? 1 : 0;
  if (i !== lead && a[lead] < 2) return a;
  if (i === lead) {
    a[i] = a[i] >= 2 ? 0 : a[i] + 1;
    a[1 - lead] = 0;
  } else {
    a[i] = a[i] === 0 ? 1 : 0;
  }
  return a;
}
export function observe(s: State, id: string): State {
  const c = CLUES[id];
  if (!c || c.requires?.some((x) => !s.solved.includes(x))) return s;
  return { ...s, seen: [...new Set([...s.seen, id])] };
}
export function finish(s: State): State {
  return s.room === 5 && s.solved.includes("beyond")
    ? { ...s, finished: true }
    : s;
}
export function parse(raw: string | null): State | null {
  try {
    if (!raw) return null;
    const a = JSON.parse(raw);
    if (
      a.version !== 1 ||
      !Number.isInteger(a.room) ||
      !ROOMS[a.room] ||
      !Number.isInteger(a.face) ||
      a.face < 0 ||
      a.face > 5
    )
      return null;
    for (const k of [
      "visited",
      "doors",
      "inventory",
      "solved",
      "opened",
      "collected",
      "seen",
    ])
      if (!Array.isArray(a[k]) || new Set(a[k]).size !== a[k].length)
        return null;
    if (
      !a.visited.every((x: number) => Number.isInteger(x) && ROOMS[x]) ||
      !a.visited.includes(a.room) ||
      !a.doors.every((x: string) => ["gallery", "darkroom"].includes(x))
    )
      return null;
    if (
      !a.inventory.every((x: string) => ITEMS[x]) ||
      !a.collected.every((x: string) => ITEMS[x]) ||
      !a.inventory.every((x: string) => a.collected.includes(x)) ||
      !a.solved.every((x: string) => PUZZLES[x]) ||
      !a.opened.every((x: string) => a.solved.includes(x)) ||
      !a.seen.every((x: string) => CLUES[x])
    )
      return null;
    if (
      !a.installed ||
      !a.values ||
      !a.hints ||
      typeof a.installed !== "object" ||
      typeof a.values !== "object" ||
      typeof a.hints !== "object"
    )
      return null;
    if (
      !Object.entries(a.installed).every(
        ([id, items]) =>
          PUZZLES[id] &&
          Array.isArray(items) &&
          new Set(items).size === items.length &&
          items.every(
            (x) => PUZZLES[id].items?.includes(x) && a.collected.includes(x),
          ),
      )
    )
      return null;
    if (!Object.entries(a.values).every(([id, v]) => validValues(id, v)))
      return null;
    return {
      ...fresh(),
      ...a,
      wall: Number.isInteger(a.wall) && a.wall >= 0 && a.wall < 4 ? a.wall : 0,
      sound: a.sound === true,
      motion: a.motion !== false,
      brightness: Number.isFinite(a.brightness)
        ? Math.min(1.4, Math.max(0.8, a.brightness))
        : 1,
      elapsed: Number.isFinite(a.elapsed) ? Math.max(0, a.elapsed) : 0,
      finished: a.finished === true && a.solved.includes("beyond"),
      hints: Object.fromEntries(
        Object.entries(a.hints).filter(
          ([k, v]) =>
            PUZZLES[k] &&
            Number.isInteger(v) &&
            Number(v) >= 0 &&
            Number(v) <= 3,
        ),
      ),
    };
  } catch {
    return null;
  }
}
