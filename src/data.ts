export type Photo = {
  sheet: string;
  tile: number;
  cols?: number;
  rows?: number;
};
export const photo = (sheet: string, tile = 0, cols = 3, rows = 2): Photo => ({
  sheet,
  tile,
  cols,
  rows,
});
export type Rect = [number, number, number, number];
export type Kind =
  | "sequence"
  | "order"
  | "select"
  | "settings"
  | "feed"
  | "rotate"
  | "develop"
  | "map";
export type Puzzle = {
  id: string;
  room: number;
  name: string;
  kind: Kind;
  image: Photo;
  answer: number[];
  initial: number[];
  labels: string[];
  instruction: string;
  hint: string[];
  requires?: string[];
  items?: string[];
  rewards?: string[];
  clues: string[];
  choices?: string[][];
  size?: number;
  controls?: Rect;
  effect: string;
  detail: string;
};
export const ITEMS: Record<
  string,
  {
    name: string;
    tile: number;
    description: string;
    back?: string;
    reusable?: boolean;
  }
> = {
  brassKey: {
    name: "廊下の鍵",
    tile: 0,
    description: "長い柄に、小さな四角い歯。",
  },
  archiveKey: {
    name: "暗室の鍵",
    tile: 1,
    description: "赤い糸が結ばれている。",
  },
  crank: {
    name: "送りハンドル",
    tile: 2,
    description: "角の軸。手で回せる。",
    reusable: true,
    back: "model",
  },
  plate: {
    name: "未現像の乾板",
    tile: 3,
    description: "遮光ケースに守られた一枚。",
  },
  lens: {
    name: "撮影レンズ",
    tile: 4,
    description: "真鍮の縁に一箇所だけ欠けがある。",
  },
  scissors: {
    name: "裁ち鋏",
    tile: 5,
    description: "紙を切るための大きな鋏。",
    reusable: true,
  },
  mask: {
    name: "三枚のマスク",
    tile: 6,
    description: "透明な板。別々の輪郭が印刷されている。",
    back: "mask",
    reusable: true,
  },
  bulb: { name: "作業灯の電球", tile: 7, description: "乳白色の小さな電球。" },
  cable: {
    name: "レリーズ",
    tile: 8,
    description: "離れたところからシャッターを切る紐。",
  },
  print: {
    name: "現像した写真",
    tile: 9,
    description: "四つの断片。窓と柱が写っている。",
    back: "panorama",
    reusable: true,
  },
  handle: {
    name: "幕のハンドル",
    tile: 10,
    description: "背景幕の軸と同じ六角形。",
  },
  finalPlate: {
    name: "裏室の乾板",
    tile: 11,
    description: "窓の形が、反対向きに浮かんでいる。",
    back: "architecture",
  },
  paper: {
    name: "印画紙",
    tile: 12,
    description: "光を避けて保管された、最後の一枚。",
  },
  portrait: {
    name: "最後の写真",
    tile: 13,
    description: "三つの留め具。その向こうに白い戸口。",
    back: "exit",
  },
};
export const CLUES: Record<
  string,
  {
    name: string;
    image: Photo;
    text: string;
    room: number;
    requires?: string[];
  }
> = {
  old: {
    name: "開いていた板",
    image: photo("clues-a", 0),
    text: "同じ木目。同じ三つの押さえ。",
    room: 0,
  },
  outside: {
    name: "写真館の裏側",
    image: photo("clues-a", 1),
    text: "入口とは別の扉がある。",
    room: 0,
  },
  history: {
    name: "四枚の試し撮り",
    image: photo("clues-a", 2),
    text: "裂け目は増えていく。花瓶が割れる前と後。",
    room: 1,
  },
  mirror: {
    name: "裏から見た保管棚",
    image: photo("clues-a", 3),
    text: "端に欠けたガラス。棚の太陽印とは左右が逆だ。",
    room: 2,
  },
  shadows: {
    name: "椅子と二つの影",
    image: photo("clues-a", 4),
    text: "椅子の脚も床の節も動いていない。",
    room: 1,
  },
  model: {
    name: "送り装置の見本",
    image: photo("demo", 0, 2, 2),
    text: "透明な蓋越しに、爪と切り欠きが見える。軸を動かしてみる。",
    room: 2,
  },
  cut: {
    name: "台紙に残った切り跡",
    image: photo("clues-b", 0),
    text: "斜めからの光で、三つの窓の輪郭が見える。",
    room: 2,
    requires: ["lamp"],
  },
  bath: {
    name: "処理の見本",
    image: photo("clues-b", 1),
    text: "端の切り欠きを合わせると、像が現れて定着する順がつながる。",
    room: 3,
  },
  position: {
    name: "欠けた撮影写真",
    image: photo("clues-b", 2),
    text: "手前の椅子。奥の柱。どこから撮ったのだろう。",
    room: 1,
  },
  shutter: {
    name: "五枚の光の試験",
    image: photo("clues-b", 3),
    text: "椅子の影は、光の反対側に落ちている。",
    room: 4,
  },
  panorama: {
    name: "切り離された景色",
    image: photo("clues-b", 4),
    text: "柱の線、窓の高さ。写真の端に続きを探す。",
    room: 3,
    requires: ["develop"],
  },
  mask: {
    name: "ガラスの輪郭",
    image: photo("clues-b", 5),
    text: "三枚の輪郭。上の弧と、左右の縦線が一つの窓になる。",
    room: 2,
  },
  architecture: {
    name: "写真の裏側の部屋",
    image: photo("clues-c", 0),
    text: "表裏を直す。写真の窓と、外観の搬出口。",
    room: 4,
    requires: ["panorama"],
  },
  layout: {
    name: "館内の配置図",
    image: photo("clues-c", 1),
    text: "図の奥に、三つの窓の形が描かれている。",
    room: 1,
  },
  printProcess: {
    name: "焼付けの見本",
    image: photo("clues-c", 2),
    text: "光、像、封をする水。乾板とは違う順だ。",
    room: 5,
  },
  exit: {
    name: "戸口に残った手順",
    image: photo("exit", 0, 1, 1),
    text: "左上から右へ、次に下の段。窓がこちらと反対側に写っている。",
    room: 5,
    requires: ["print"],
  },
  reverse: {
    name: "反対側の送り装置",
    image: photo("clues-c", 4),
    text: "見本と同じ機構を、今は反対側から見ている。",
    room: 5,
  },
  memory: {
    name: "一脚の椅子",
    image: photo("clues-c", 5),
    text: "誰も座っていない。けれど布には、まだ皺がある。",
    room: 4,
  },
};
export const PUZZLES: Record<string, Puzzle> = Object.fromEntries(
  (
    [
      {
        id: "panel",
        room: 0,
        name: "受付の側板",
        kind: "sequence",
        image: photo("reception-details", 0),
        answer: [0, 2, 1],
        initial: [],
        labels: ["上の押さえ", "下の押さえ", "横の留め具"],
        instruction: "押さえを外し、板を開ける。",
        clues: ["old"],
        rewards: ["brassKey"],
        effect: "押さえが外れた。",
        detail: "写真に開いた状態が残っている。",
        hint: [
          "受付の写真と、板の木目を比べる。",
          "押さえの重なりを見る。横の留め具を引くには、上が先。",
          "上 → 横 → 下。解錠後、板を開き、鍵を拾う。",
        ],
      },
      {
        id: "frames",
        room: 1,
        name: "納品待ちの四枚",
        kind: "order",
        image: photo("gallery-details", 0),
        answer: [1, 3, 0, 2],
        initial: [0, 1, 2, 3],
        labels: [
          "裂け目と割れた花瓶",
          "無傷の椅子",
          "修理された椅子",
          "裂け目と立つ花瓶",
        ],
        instruction: "二枚を選んで入れ替える。古い順に。",
        clues: ["history"],
        rewards: ["archiveKey", "bulb"],
        effect: "引き出しの留め金が外れた。",
        detail: "撮影台帳の留め金と連動している。",
        hint: [
          "椅子の布と、足元の花瓶を比べる。",
          "布が裂け、花瓶が割れ、最後に布が修理されている。",
          "無傷 → 裂け目と立つ花瓶 → 裂け目と割れた花瓶 → 修理。",
        ],
      },
      {
        id: "rack",
        room: 2,
        name: "保管棚",
        kind: "select",
        image: photo("retouch-details", 0),
        answer: [2, 3, 4],
        initial: [],
        labels: ["左上", "中央上", "右上", "左下", "中央下", "右下"],
        instruction: "写真で空いていた三つの仕切りを押す。",
        clues: ["mirror"],
        rewards: ["crank", "plate"],
        effect: "三つの留め金が外れた。",
        detail: "写真の裏面から位置を戻して考える。",
        hint: [
          "写真と棚の太陽印、欠けの位置を照合する。",
          "ガラスを裏から見ているので左右が反転している。上下は同じ。",
          "右上・左下・中央下。順番は問わない。",
        ],
      },
      {
        id: "lamp",
        room: 2,
        name: "修整台の灯り",
        kind: "settings",
        image: photo("lamp-states", 0, 2, 2),
        answer: [0, 2],
        initial: [1, 0],
        size: 3,
        labels: ["取付位置", "灯りの高さ"],
        choices: [
          ["左", "中央", "右"],
          ["高", "中", "低"],
        ],
        items: ["bulb"],
        clues: ["shadows"],
        rewards: ["scissors"],
        effect: "紙の凹凸と、引き出しの爪が見えた。",
        detail: "照らす向きが変わると、紙に残った跡が浮かぶ。",
        hint: [
          "廊下の二枚の影を見比べる。",
          "椅子は同じ場所。影が右へ長く伸びる写真では、光は左の低い位置。",
          "取付位置を左（1番目）、高さを低（3番目）へ。",
        ],
      },
      {
        id: "feed",
        room: 1,
        name: "壁の搬送口",
        kind: "feed",
        image: photo("feed-states", 0, 2, 2),
        answer: [2, 1],
        initial: [0, 0],
        size: 4,
        labels: ["左の送り", "右の送り"],
        items: ["crank"],
        clues: ["model"],
        rewards: ["lens"],
        effect: "ケースを押さえていた爪が退いた。",
        detail: "左の爪を十分引くと、右の爪が動く。",
        hint: [
          "修整室の見本で、爪の動きとケースの切り欠きを調べる。",
          "左を2段階引くと右の爪が通る。ケースの右の切り欠きは1段階。",
          "左を2回、右を1回。ハンドルは使用後も残る。",
        ],
      },
      {
        id: "cut",
        room: 2,
        name: "窓を切る台紙",
        kind: "select",
        image: photo("retouch-details", 4),
        answer: [1, 5, 6],
        initial: [],
        labels: [
          "左上",
          "上",
          "右上",
          "左",
          "中央",
          "右",
          "左下",
          "下",
          "右下",
        ],
        items: ["scissors"],
        requires: ["lamp"],
        clues: ["cut"],
        rewards: ["mask"],
        effect: "三つの切り込みがつながった。",
        detail: "三つの輪郭を選ぶ。",
        hint: [
          "斜めの光を当てた台紙を見直す。",
          "濃い印刷ではなく、紙に残った窓の押し跡を読む。",
          "上中央・中央右・左下を選んで切る。",
        ],
      },
      {
        id: "develop",
        room: 3,
        name: "乾板の処理",
        kind: "develop",
        image: photo("darkroom-details", 0),
        answer: [1, 0, 2, 3],
        initial: [],
        labels: ["白い槽", "黒い槽", "灰色の槽", "水洗い"],
        items: ["plate"],
        clues: ["bath"],
        rewards: ["print"],
        effect: "像が定着した。乾燥台に写真がある。",
        detail: "見本の縁をつなぎ、処理する順を考える。",
        hint: [
          "処理見本の四枚は、切れた一枚の手順図。",
          "端の切り欠きをつなぐと、黒い槽から始まる。",
          "黒 → 白 → 灰 → 水。誤った順でも最初から試せる。",
        ],
      },
      {
        id: "camera",
        room: 4,
        name: "撮影位置",
        kind: "settings",
        image: photo("studio-details", 0),
        answer: [2, 1, 0],
        initial: [0, 0, 1],
        size: 3,
        labels: ["台車の位置", "焦点", "レンズの高さ"],
        choices: [
          ["左", "中央", "右"],
          ["手前", "中央", "奥"],
          ["高", "中", "低"],
        ],
        items: ["lens"],
        clues: ["position"],
        rewards: ["cable"],
        effect: "写真と同じ輪郭が重なった。側面の留め金が外れた。",
        detail: "椅子と柱、床の傷が重なる位置を探す。",
        hint: [
          "破れた写真では、椅子の右脚と柱が重なる。床の傷も確認する。",
          "台車は一番右。焦点は中間。レンズは高い位置。",
          "台車3・焦点2・高さ1。側面を開けてレリーズを取る。",
        ],
      },
      {
        id: "shutters",
        room: 4,
        name: "照明の切替器",
        kind: "sequence",
        image: photo("studio-details", 3),
        answer: [2, 2, 1, 0, 0],
        initial: [],
        labels: ["左灯", "上灯", "右灯"],
        items: ["cable"],
        clues: ["shutter"],
        rewards: ["handle"],
        effect: "下の引き出しで、留め金の音がした。",
        detail: "五枚の写真と同じ光を、順に再現する。",
        hint: [
          "写真を左から読み、椅子の影の向きを見る。",
          "影は光源と反対側。左向きの影なら右の灯り。",
          "右 → 右 → 上 → 左 → 左。",
        ],
      },
      {
        id: "panorama",
        room: 3,
        name: "切り離された景色",
        kind: "order",
        image: photo("darkroom-details", 3),
        answer: [3, 1, 0, 2],
        initial: [0, 1, 2, 3],
        labels: ["柱の右", "中央の窓", "搬出口", "柱の左"],
        items: ["print"],
        clues: ["panorama"],
        rewards: ["finalPlate"],
        effect: "窓の続きに、小さな搬出口が現れた。",
        detail: "写真の縁をつなぎ、左から一枚の景色にする。",
        hint: [
          "縦の柱だけでなく、窓枠の高さを比べる。",
          "柱の左端から始め、搬出口が右端になる。",
          "柱の左 → 中央の窓 → 柱の右 → 搬出口。",
        ],
      },
      {
        id: "masks",
        room: 3,
        name: "三枚のガラス",
        kind: "rotate",
        image: photo("darkroom-details", 4),
        answer: [0, 0, 0],
        initial: [2, 0, 3],
        size: 4,
        labels: ["一枚目", "二枚目", "三枚目"],
        items: ["mask"],
        clues: ["mask"],
        effect: "柱と窓の形がつながった。",
        detail: "三枚の向きを直し、弧と縦線をつなぐ。",
        hint: [
          "線の端だけでなく、窓の欠けた角も合わせる。",
          "弧の丸い方が上。左右の窓枠は、長い辺が垂直になる。",
          "初期状態から、一枚目2回・二枚目0回・三枚目1回。",
        ],
      },
      {
        id: "wall",
        room: 4,
        name: "写真の外側",
        kind: "map",
        image: photo("clues-c", 1),
        answer: [1],
        initial: [],
        labels: [
          "北西",
          "北",
          "北東",
          "西",
          "中央",
          "東",
          "南西",
          "南",
          "南東",
        ],
        items: ["handle"],
        requires: ["panorama", "masks"],
        clues: ["architecture", "layout", "outside"],
        effect: "巻き上げ軸の留め金が外れた。",
        detail: "二つの像で窓の形を確かめ、配置図と照合する。",
        hint: [
          "完成した景色とガラスの輪郭を、配置図の三つの窓と比べる。",
          "二つの像に共通するのは上が丸い窓。図の奥の三室は、丸窓・アーチ窓・四角い窓で見分けられる。",
          "配置図の上中央（北）を選ぶ。取っ手を引いて裏室へ。",
        ],
      },
      {
        id: "backfeed",
        room: 5,
        name: "反対側の送り口",
        kind: "feed",
        image: photo("backfeed-states", 0, 2, 2),
        answer: [1, 2],
        initial: [0, 0],
        size: 4,
        labels: ["左の送り", "右の送り"],
        items: ["crank"],
        clues: ["model", "reverse"],
        rewards: ["paper"],
        effect: "ケースを押さえていた爪が退いた。",
        detail: "前に動かした機構の、反対側。",
        hint: [
          "修整室の見本を、裏から見ている。",
          "こちらの右が、向こうの左。先に右を2段階動かす。",
          "右を2回、左を1回。",
        ],
      },
      {
        id: "print",
        room: 5,
        name: "最後の焼付け",
        kind: "develop",
        image: photo("backroom-details", 3),
        answer: [0, 2, 1, 3],
        initial: [],
        labels: ["光を当てる", "白い槽", "黒い槽", "水洗い"],
        items: ["finalPlate", "paper"],
        clues: ["printProcess"],
        rewards: ["portrait"],
        effect: "一枚の写真が浮かんだ。戸口の裏側が写っている。",
        detail: "乾板と印画紙を入れ、見本の順に焼き付ける。",
        hint: [
          "ここでは乾板から紙へ像を移す。先に光が必要。",
          "焼付けの見本の縁をつないで順番を読む。",
          "光 → 黒 → 白 → 水。最後の写真を取って裏を調べる。",
        ],
      },
      {
        id: "beyond",
        room: 5,
        name: "搬出口の留め具",
        kind: "sequence",
        image: photo("backroom", 0),
        answer: [2, 0, 2, 1],
        initial: [],
        labels: ["左の留め具", "中央の留め具", "右の留め具"],
        requires: ["backfeed"],
        clues: ["exit"],
        effect: "扉の向こうで、雨の音がした。",
        detail: "戸口の写真を、今立っている側へ読み直す。",
        hint: [
          "最後の写真の裏面に、四回の操作が写っている。左上から右、次に下の段へ。",
          "写真では窓が右。今の戸口では左。左右を戻して読む。",
          "右 → 左 → 右 → 中央。解錠したら扉を開く。",
        ],
      },
    ] as Puzzle[]
  ).map((p) => [p.id, p]),
);
export type Node = {
  id: string;
  label: string;
  rect: Rect;
  type: "puzzle" | "clue" | "door" | "take" | "detail";
  target: string;
  requires?: string;
  item?: string;
};
const p = (id: string, rect: Rect): Node => ({
  id,
  label: PUZZLES[id].name,
  rect,
  type: "puzzle",
  target: id,
});
const c = (id: string, rect: Rect): Node => ({
  id,
  label: CLUES[id].name,
  rect,
  type: "clue",
  target: id,
});
const d = (
  target: number,
  rect: Rect,
  requires?: string,
  item?: string,
): Node => ({
  id: "door-" + target,
  label:
    ["受付", "展示廊下", "修整室", "暗室", "撮影室", "裏室"][target] + "へ",
  rect,
  type: "door",
  target: String(target),
  requires,
  item,
});
export const ROOMS = [
  {
    id: "reception",
    name: "受付",
    chapter: "Ⅰ",
    views: [
      [
        p("panel", [3, 35, 52, 54]),
        d(1, [63, 8, 32, 82], undefined, "brassKey"),
      ],
      [c("position", [7, 8, 43, 51]), c("outside", [51, 14, 42, 50])],
      [
        {
          id: "entrance",
          label: "閉じた入口",
          rect: [19, 7, 72, 81],
          type: "detail",
          target: "外側のシャッターが降りている。裏側に出口はないだろうか。",
        },
      ],
      [c("old", [12, 14, 67, 64])],
      [],
      [],
    ] as Node[][],
  },
  {
    id: "gallery",
    name: "展示廊下",
    chapter: "Ⅱ",
    views: [
      [d(4, [23, 8, 55, 78])],
      [
        p("frames", [3, 15, 70, 47]),
        c("shadows", [28, 51, 24, 18]),
        d(2, [72, 12, 26, 73]),
      ],
      [d(0, [27, 12, 46, 76]), c("layout", [3, 28, 22, 35])],
      [
        d(3, [3, 12, 37, 76], undefined, "archiveKey"),
        p("feed", [51, 31, 43, 50]),
      ],
      [],
      [],
    ] as Node[][],
  },
  {
    id: "retouch",
    name: "修整室",
    chapter: "Ⅱ",
    views: [
      [c("model", [41, 32, 45, 45]), p("lamp", [4, 25, 35, 55])],
      [p("rack", [10, 12, 80, 75]), c("architecture", [64, 3, 25, 18])],
      [d(1, [3, 10, 41, 77]), c("mirror", [58, 19, 30, 59])],
      [p("cut", [23, 29, 55, 56]), c("cut", [17, 9, 20, 31])],
      [],
      [],
    ] as Node[][],
  },
  {
    id: "darkroom",
    name: "暗室",
    chapter: "Ⅲ",
    views: [
      [p("develop", [5, 39, 90, 46]), c("bath", [27, 7, 44, 28])],
      [p("masks", [22, 19, 59, 66])],
      [d(1, [23, 9, 53, 81])],
      [p("panorama", [4, 13, 65, 67]), d(4, [76, 38, 23, 39])],
      [],
      [],
    ] as Node[][],
  },
  {
    id: "studio",
    name: "撮影室",
    chapter: "Ⅲ",
    views: [
      [
        p("wall", [29, 7, 45, 41]),
        p("shutters", [6, 34, 18, 23]),
        c("memory", [45, 48, 22, 32]),
        d(5, [30, 14, 40, 75], "wall"),
      ],
      [c("shutter", [23, 9, 17, 61])],
      [
        d(1, [25, 12, 52, 75]),
        c("history", [2, 19, 22, 33]),
        c("architecture", [81, 17, 18, 36]),
      ],
      [
        p("camera", [25, 22, 56, 63]),
        d(3, [2, 28, 19, 39], undefined, "archiveKey"),
      ],
      [],
      [],
    ] as Node[][],
  },
  {
    id: "backroom",
    name: "裏室",
    chapter: "Ⅳ",
    views: [
      [p("beyond", [30, 6, 49, 88]), p("backfeed", [84, 13, 15, 34])],
      [p("print", [12, 27, 68, 65]), c("printProcess", [73, 21, 15, 18])],
      [d(4, [27, 12, 51, 80])],
      [c("reverse", [15, 22, 66, 64]), c("exit", [7, 7, 25, 24])],
      [],
      [],
    ] as Node[][],
  },
];
export const FACES = ["正面", "右の壁", "背面", "左の壁", "天井", "床"];
export const itemPhoto = (id: string) => photo("items", ITEMS[id].tile, 4, 4);
export const PUZZLE_IDS = Object.keys(PUZZLES);
