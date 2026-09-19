import { CLUES, ROOMS, type Rect } from "./data";
export type Point = [number, number];
export type Quad = [Point, Point, Point, Point];
export const quad = ([x, y, w, h]: Rect): Quad => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];
export type Mechanism = {
  room: number;
  face: number;
  bounds: Rect;
  focus: Rect;
  controls: Rect[];
  open: Rect;
  fittings?: Rect[];
  pickups?: Rect[];
  state?: string;
  patch?: Rect;
  surfaces?: Quad[];
};
export const MECHANISMS: Record<string, Mechanism> = {
  panel: {
    room: 0,
    face: 0,
    bounds: [0, 44, 40, 44],
    focus: [0, 40, 55, 55],
    controls: [
      [24, 47, 10, 5],
      [30, 62, 10, 5],
      [24, 78, 10, 5],
    ],
    open: [3, 54, 19, 23],
    pickups: [[23, 62, 13, 6]],
    state: "reception-counter",
    patch: [0, 43, 40, 47],
  },
  frames: {
    room: 1,
    face: 1,
    bounds: [7, 17, 68, 34],
    focus: [4, 8, 74, 74],
    controls: [
      [9.5, 18.5, 12.5, 17.5],
      [27, 18.5, 12.5, 17.5],
      [44.5, 18.5, 12.5, 17.5],
      [61.5, 18.5, 12.5, 17.5],
    ],
    open: [38, 43, 5, 5],
    pickups: [
      [26, 43.8, 12, 4.5],
      [46, 42, 10, 6],
    ],
    state: "gallery-frames",
    patch: [19.5, 39, 42, 18],
  },
  rack: {
    room: 2,
    face: 1,
    bounds: [17, 23, 66, 49],
    focus: [9, 17, 78, 78],
    controls: [
      [18, 24, 19, 17],
      [40, 24, 19, 17],
      [62, 24, 19, 17],
      [18, 44, 19, 17],
      [40, 44, 19, 17],
      [62, 44, 19, 17],
    ],
    open: [46, 65, 8, 6],
    state: "retouch-rack",
    patch: [15, 64, 71, 15],
    pickups: [
      [29, 65, 14, 6],
      [54, 65, 17, 6],
    ],
  },
  lamp: {
    room: 2,
    face: 0,
    bounds: [10, 24, 37, 34],
    focus: [7, 18, 86, 72],
    controls: [[20, 24, 26, 13]],
    open: [67, 63, 9, 4],
    fittings: [[36, 27, 9, 5]],
    state: "retouch-lamp",
    patch: [50, 60, 46, 16],
    pickups: [[60, 62, 27, 6]],
  },
  feed: {
    room: 1,
    face: 3,
    bounds: [70, 30, 24, 27],
    focus: [65, 25, 35, 35],
    controls: [
      [73, 43, 7, 10],
      [87, 43, 7, 10],
    ],
    open: [75, 37, 15, 4],
    fittings: [[80, 31, 4, 4]],
    pickups: [[80, 38, 5, 4]],
    state: "gallery-feed",
    patch: [72, 34, 21, 9],
  },
  cut: {
    room: 2,
    face: 3,
    bounds: [30, 27, 36, 23],
    focus: [29, 24, 38, 38],
    controls: [
      [38.5, 30, 6, 4.8],
      [45.8, 30, 6, 4.8],
      [53, 30, 6.4, 4.8],
      [37.7, 35.9, 6.5, 4.7],
      [45.5, 35.9, 6.3, 4.7],
      [53.4, 35.9, 6.7, 4.7],
      [36.3, 41.7, 7.1, 5.5],
      [45, 41.7, 7, 5.5],
      [53.5, 41.7, 7.5, 5.5],
    ],
    open: [32, 28, 30, 22],
    fittings: [[32, 28, 30, 22]],
    pickups: [[36, 29, 25, 20]],
  },
  develop: {
    room: 3,
    face: 0,
    bounds: [4, 55, 92, 27],
    focus: [0, 19, 100, 100],
    controls: [
      [5, 55, 25, 7],
      [32, 55, 22, 7],
      [56, 55, 23, 7],
      [81, 56, 14, 6],
    ],
    open: [45, 73, 9, 4],
    fittings: [[32, 55, 22, 7]],
    state: "darkroom-develop",
    patch: [2, 69, 96, 23],
    pickups: [[35, 71, 23, 9]],
  },
  camera: {
    room: 4,
    face: 3,
    bounds: [29, 25, 29, 33],
    focus: [26, 24, 39, 39],
    controls: [
      [33, 44, 2.8, 2.8],
      [36, 44, 2.8, 2.8],
      [39, 44, 2.8, 2.8],
    ],
    open: [38, 50, 4, 3],
    fittings: [[54, 33, 4, 5]],
    state: "studio-camera",
    patch: [29, 48, 18, 9],
    pickups: [[34, 49, 9, 3]],
    surfaces: [
      [
        [32.5, 30.5],
        [43.4, 30],
        [43.4, 43],
        [32.5, 43],
      ],
    ],
  },
  shutters: {
    room: 4,
    face: 0,
    bounds: [7, 36, 10, 18],
    focus: [3, 32, 24, 24],
    controls: [
      [9.7, 40.8, 1.8, 1.8],
      [11.7, 40.8, 1.8, 1.8],
      [13.6, 41, 1.8, 1.8],
    ],
    open: [10.8, 49, 2.8, 2],
    fittings: [[11, 44.2, 2.4, 2.4]],
    state: "studio-shutters",
    patch: [7, 48, 13, 7],
    pickups: [[10.5, 49, 4, 3.5]],
  },
  panorama: {
    room: 3,
    face: 3,
    bounds: [9, 23, 26, 35],
    focus: [3, 21, 43, 43],
    controls: [
      [9.5, 25.5, 6, 12],
      [16, 25.5, 6, 12],
      [22.5, 25.5, 6, 12],
      [29.1, 25.4, 5.8, 12],
    ],
    open: [17, 54, 5, 3],
    fittings: [[10, 25, 25, 13]],
    state: "darkroom-panorama",
    patch: [10, 51, 19, 8],
    pickups: [[15, 52.5, 11.5, 2]],
  },
  masks: {
    room: 3,
    face: 1,
    bounds: [31, 43, 36, 15],
    focus: [31, 40, 36, 26],
    controls: [
      [34.8, 47.3, 7.8, 6.4],
      [45.1, 47.3, 7.5, 6.4],
      [55.1, 47.3, 7.7, 6.4],
    ],
    open: [35, 47, 28, 7],
    fittings: [[35, 47, 28, 7]],
    surfaces: [
      [
        [35, 47.3],
        [42.6, 47.3],
        [42.2, 53.5],
        [34.4, 53.5],
      ],
      [
        [45.1, 47.3],
        [52.5, 47.3],
        [52.6, 53.5],
        [44.8, 53.5],
      ],
      [
        [55.1, 47.3],
        [62.3, 47.3],
        [63.1, 53.5],
        [55.2, 53.5],
      ],
    ],
  },
  wall: {
    room: 4,
    face: 0,
    bounds: [25, 7, 61, 66],
    focus: [49, 26, 48, 48],
    controls: [[79, 40, 8, 10]],
    open: [79, 40, 8, 10],
    fittings: [[79, 42, 6, 6]],
    state: "studio-curtain",
    patch: [24, 6, 60, 68],
  },
  backfeed: {
    room: 5,
    face: 0,
    bounds: [86, 13, 12, 28],
    focus: [77, 12, 23, 34],
    controls: [
      [87.5, 13.5, 3, 12],
      [92, 13.5, 3, 12],
    ],
    open: [90, 35, 4, 3],
    fittings: [[90.3, 27, 4, 4]],
    state: "backroom-feed",
    patch: [87, 33, 11, 12],
    pickups: [[89.5, 35, 6, 3]],
  },
  print: {
    room: 5,
    face: 1,
    bounds: [33, 39, 45, 18],
    focus: [27, 28, 56, 56],
    controls: [
      [34, 44, 7, 10],
      [44, 52, 9, 3],
      [55, 52, 10, 3],
      [66, 52, 10, 3],
    ],
    open: [66, 52, 10, 3],
    fittings: [
      [49, 43, 9, 5],
      [49, 43, 9, 5],
    ],
    pickups: [[68, 52, 7, 3]],
  },
  beyond: {
    room: 5,
    face: 0,
    bounds: [32, 5, 47, 78],
    focus: [29, 22, 52, 52],
    controls: [
      [34, 36, 12, 7],
      [50, 36, 12, 7],
      [66, 36, 12, 7],
    ],
    open: [36, 46, 38, 31],
  },
};
export const MASTER: Record<string, string> = {
  "0:0": "reception-north",
  "1:1": "gallery-east",
  "1:3": "gallery-west",
  "2:0": "retouch-north",
  "2:1": "retouch-east",
  "2:3": "retouch-cut-board",
  "3:0": "darkroom-north",
  "3:1": "darkroom-glass-board",
  "3:3": "darkroom-west",
  "4:0": "studio-north",
  "4:3": "studio-west",
  "5:0": "backroom-north",
  "5:1": "backroom-east",
};
export const CLUE_PLACEMENTS: Record<string, Record<string, Rect>> = {
  "0:1": { position: [8.2, 10.8, 29.2, 38], outside: [48, 20, 25, 30] },
  "0:3": { old: [53, 4.5, 7.2, 9.4] },
  "4:1": { shutter: [25, 10, 10, 48] },
  "4:2": { history: [1.3, 19.6, 21.6, 29.4], architecture: [80, 23, 17, 20] },
  "5:1": { printProcess: [40, 6.5, 32, 24] },
  "5:3": { reverse: [64.8, 9.5, 11.6, 9.5] },
  "1:1": {
    shadows: [28.3, 53.4, 10.8, 13.4],
    history: [41.5, 53.4, 10.8, 13.4],
  },
  "2:0": { model: [51, 32, 25, 27], cut: [18.7, 53.5, 11.5, 2.3] },
  "2:1": { mirror: [5.3, 29.5, 4.3, 13], architecture: [66, 5, 10, 12] },
  "3:0": { bath: [23.5, 29.5, 53, 12] },
  "4:0": { memory: [46.5, 52, 15, 26], layout: [8, 7, 10, 15] },
};
export function sceneNodes(room: number, face: number) {
  const nodes = ROOMS[room].views[face].filter(
    (n) =>
      !(
        ((room === 3 && face === 3) || (room === 4 && face === 3)) &&
        n.type === "door"
      ) &&
      !(n.target === "exit") &&
      !(room === 1 && face === 2 && n.target === "layout") &&
      !(room === 2 && face === 3 && n.target === "cut" && n.type === "clue") &&
      !(room === 2 && face === 2 && n.target === "mirror"),
  );
  const placements = CLUE_PLACEMENTS[`${room}:${face}`];
  const result = nodes.map((n) => ({
    ...n,
    rect:
      n.type === "puzzle"
        ? MECHANISMS[n.target].bounds
        : (placements?.[n.target] ?? n.rect),
  }));
  for (const [id, r] of Object.entries(placements ?? {}))
    if (!result.some((n) => n.target === id))
      result.push({
        id,
        label: CLUES[id].name,
        type: "clue",
        target: id,
        rect: r,
      });
  for (const n of result) {
    if (n.type === "door") {
      if (room === 0 && face === 0) n.rect = [66, 4, 31, 70];
      if (room === 1 && face === 1) n.rect = [82, 3, 17, 83];
      if (room === 1 && face === 3) n.rect = [9, 8, 30, 77];
      if (room === 1 && face === 0) n.rect = [25, 5, 55, 76];
      if (room === 1 && face === 2) n.rect = [30, 5, 42, 81];
      if (room === 2 && face === 2) n.rect = [6, 5, 44, 86];
      if (room === 3 && face === 2) n.rect = [31, 6, 38, 83];
      if (room === 4 && face === 0) n.rect = [43, 20, 21, 49];
      if (room === 4 && face === 2) n.rect = [28, 11, 41, 84];
      if (room === 5 && face === 2) n.rect = [28, 7, 42, 78];
    }
  }
  return result;
}
export function focusRect(r: Rect, minimum = 0): Rect {
  const size = Math.min(100, Math.max(minimum, Math.max(r[2], r[3]) * 1.2));
  return [
    Math.max(0, Math.min(100 - size, r[0] + r[2] / 2 - size / 2)),
    Math.max(0, Math.min(100 - size, r[1] + r[3] / 2 - size / 2)),
    size,
    size,
  ];
}

// Photograph corners, measured in the same world coordinates as the background.
export const CLUE_SURFACES: Record<string, Quad> = {
  "2:0:cut": [
    [22, 53.6],
    [30.3, 53.6],
    [28.1, 55.5],
    [18.6, 55.5],
  ],
  "2:1:mirror": [
    [5.3, 29.5],
    [9.6, 29.5],
    [9.2, 42.5],
    [5.1, 42.5],
  ],
};
export const CUT_SURFACES: Quad[] = [
  [
    [39, 30],
    [44.8, 30],
    [44.3, 34.7],
    [38.2, 34.7],
  ],
  [
    [45.8, 30],
    [51.8, 30],
    [51.8, 34.7],
    [45.6, 34.7],
  ],
  [
    [53, 30],
    [58.7, 30],
    [59.4, 34.7],
    [53.1, 34.7],
  ],
  [
    [38.1, 35.9],
    [44.2, 35.9],
    [43.6, 40.7],
    [37.2, 40.7],
  ],
  [
    [45.5, 35.9],
    [51.8, 35.9],
    [51.9, 40.7],
    [45.2, 40.7],
  ],
  [
    [53.4, 35.9],
    [59.5, 35.9],
    [60.2, 40.7],
    [53.6, 40.7],
  ],
  [
    [36.9, 41.7],
    [43.5, 41.7],
    [42.9, 47.1],
    [35.9, 47.1],
  ],
  [
    [45.1, 41.7],
    [52, 41.7],
    [52, 47.1],
    [44.7, 47.1],
  ],
  [
    [53.7, 41.7],
    [60.4, 41.7],
    [61.3, 47.1],
    [54, 47.1],
  ],
];
export const PROCESS_SURFACES: Record<string, Quad[]> = {
  develop: [
    [
      [12, 55.8],
      [25, 55.8],
      [23.5, 58.5],
      [9.7, 58.5],
    ],
    [
      [37, 55.8],
      [49, 55.8],
      [50, 58.4],
      [35, 58.4],
    ],
    [
      [62, 55.9],
      [72, 55.9],
      [75, 58.6],
      [61, 58.6],
    ],
    [
      [84, 57],
      [90, 57],
      [92, 59.2],
      [83, 59.2],
    ],
  ],
  print: [
    [
      [49.5, 43],
      [57, 43],
      [57.3, 47],
      [49.1, 47],
    ],
    [
      [46, 52.3],
      [51.9, 52.3],
      [52, 54.3],
      [45.2, 54.3],
    ],
    [
      [56.5, 52.3],
      [62.6, 52.3],
      [63.4, 54.3],
      [56, 54.3],
    ],
    [
      [67.7, 52.4],
      [73.2, 52.4],
      [74.8, 54.4],
      [68, 54.4],
    ],
  ],
};
