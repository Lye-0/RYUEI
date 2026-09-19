export type Photo = {
  mirror?: boolean;
  crop?: [number, number, number, number];
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
    description: "先端は四角い軸。木の握りが付いている。",
    reusable: true,
  },
  plate: {
    name: "未現像の乾板",
    tile: 3,
    description: "遮光ケースに守られた一枚。",
  },
  lens: {
    name: "撮影レンズ",
    tile: 4,
    description: "古い撮影機のレンズ。",
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
    description: "透明な板。別々の輪郭が刻まれている。",
    back: "mask",
  },
  bulb: { name: "作業灯の電球", tile: 7, description: "透明な小さな電球。" },
  cable: {
    name: "レリーズ",
    tile: 8,
    description: "離れたところからシャッターを切る紐。",
  },
  print: {
    name: "現像した写真",
    tile: 9,
    description: "窓と扉が写っている。",
    back: "panorama",
  },
  handle: {
    name: "幕のハンドル",
    tile: 10,
    description: "中央に六角形の穴がある、丸い金属製ハンドル。",
  },
  finalPlate: {
    name: "裏室の乾板",
    tile: 11,
    description: "薄いガラスの乾板。裏側に像が残っている。",
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
    description: "窓と三つの留め具。裏にも像が残っている。",
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
    name: "留め具の写った写真",
    image: { ...photo("reception-unlatched"), crop: [7, 43, 34, 45] },
    text: "同じ木目の板。三つの金具は、継ぎ目をふさいでいない。",
    room: 0,
  },
  outside: {
    name: "写真館の裏側",
    image: photo("rear-exterior"),
    text: "入口とは別の扉がある。",
    room: 0,
  },
  history: {
    name: "四枚の試し撮り",
    image: photo("history-framed"),
    text: "裂け目は増えていく。花瓶が割れる前と後。",
    room: 1,
  },
  mirror: {
    name: "保管棚の押し板図",
    image: photo("clues-a", 3),
    text: "白い板を押す図。放射状の飾りは、棚と反対側にある。",
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
    image: { ...photo("retouch-north"), crop: [50, 33, 23, 23] },
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
    image: photo("camera-view-2"),
    text: "手前の椅子。奥の背景の支柱。どこから撮ったのだろう。",
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
    image: photo("rear-exterior"),
    text: "柱の線、窓の高さ。写真の端に続きを探す。",
    room: 3,
    requires: ["develop"],
  },
  mask: {
    name: "ガラスの輪郭",
    image: photo("glass-triptych"),
    text: "三枚の輪郭。上の弧と、左右の縦線が一つの窓になる。",
    room: 2,
  },
  architecture: {
    name: "写真の裏側の部屋",
    image: { ...photo("rear-exterior"), mirror: true },
    text: "表裏を直す。写真の窓と、外観の搬出口。",
    room: 4,
  },
  layout: {
    name: "館内の配置図",
    image: photo("layout-plan"),
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
    text: "見本と同じ型の機構が、左右を逆に組まれている。",
    room: 5,
  },
  memory: {
    name: "一脚の椅子",
    image: { ...photo("studio-north"), crop: [44, 51, 20, 29] },
    text: "誰も座っていない。座面だけが擦れている。",
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
        kind: "select",

        answer: [0, 1, 2],
        initial: [],
        labels: ["上の押さえ", "中央の押さえ", "下の押さえ"],
        instruction: "押さえを外し、板を開ける。",
        clues: ["old"],
        rewards: ["brassKey"],
        effect: "押さえが外れた。",
        detail: "写真には、閉じた板と縦向きの留め具が写っている。",
        hint: [
          "棚の上の写真と、受付の板にある三つの金具を見比べる。",
          "写真では、三つの金具が縦向きです。実物の横向きの金具は、板の継ぎ目をまたいで開くのを妨げています。",
          "三つとも縦に回し、板そのものを引く。順番は問わない。",
        ],
      },
      {
        id: "frames",
        room: 1,
        name: "納品待ちの四枚",
        kind: "order",

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
          "展示廊下の四枚の写真を拡大し、椅子の座面と花瓶を見比べてください。二枚を順に押すと位置を交換できます。",
          "左から古い順に並べます。座面が無傷の写真から始まり、座面が破れ、花瓶が割れ、最後に座面が修理されています。",
          "無傷 → 裂け目と立つ花瓶 → 裂け目と割れた花瓶 → 修理。",
        ],
      },
      {
        id: "rack",
        room: 2,
        name: "保管棚",
        kind: "select",

        answer: [2, 3, 4],
        initial: [],
        labels: ["左上", "中央上", "右上", "左下", "中央下", "右下"],
        instruction: "図の白い三枚に対応する押し板を沈める。",
        clues: ["mirror"],
        rewards: ["crank", "plate"],
        effect: "三つの留め金が外れた。",
        detail: "図と棚の飾りを照合し、白い押し板の位置を読み直す。",
        hint: [
          "保管棚の左に掛かる図を見てください。下の小さな絵は、白い板を指で押し込む操作を表しています。",
          "放射状の飾りは図の右上、実物の左上にあります。図は左右が逆です。白い三枚を左右反転した位置で押してください。押した板は沈み、もう一度押すと戻ります。",
          "右上・左下・中央下。順番は問わない。",
        ],
      },
      {
        id: "lamp",
        room: 2,
        name: "修整台の灯り",
        kind: "settings",

        answer: [2],
        initial: [0],
        size: 3,
        labels: ["ランプの腕を動かす"],
        choices: [
          ["左", "中央", "右"],
          ["高", "中", "低"],
        ],
        items: ["bulb"],
        clues: ["shadows"],
        rewards: ["scissors"],
        effect: "斜めからの光で、紙の押し跡が浮かんだ。",
        detail: "照らす向きが変わると、紙に残った跡が浮かぶ。",
        hint: [
          "展示廊下の引き出しの下にある、二枚の椅子の写真を見てください。右の写真のランプはどこにありますか。",
          "右の写真では、左の低いランプから光が当たり、影が右へ長く伸びています。修整台でもランプを低くして、机の紙へ横から光を当てます。",
          "腕を二段下げ、紙のすぐ左から照らす。",
        ],
      },
      {
        id: "feed",
        room: 1,
        name: "壁の搬送口",
        kind: "feed",

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
          "修整室の机の中央に、二本のレバーが付いた見本があります。左を動かしてから右を押し、動く条件を調べてください。",
          "左のレバーを二段階動かすと、右のレバーを止めていた金具が退きます。搬送口でも同じ順に動かします。",
          "左を2回、右を1回。ハンドルは使用後も残る。",
        ],
      },
      {
        id: "cut",
        room: 2,
        name: "窓を切る台紙",
        kind: "select",

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
          "修整台のランプを低くした後、ランプのすぐ右下にある紙を調べてください。3×3のどこに穴があるかを見ます。",
          "その紙と、鋏で切る台紙は同じ3×3です。見本で穴になっている三か所を、同じ位置で選びます。",
          "上中央・中央右・左下を選んで切る。",
        ],
      },
      {
        id: "develop",
        room: 3,
        name: "乾板の処理",
        kind: "develop",

        answer: [1, 0, 2, 3],
        initial: [],
        labels: ["白い槽", "黒い槽", "灰色の槽", "水洗い"],
        items: ["plate"],
        clues: ["bath"],
        rewards: ["print"],
        effect: "像が定着した。乾燥台に写真がある。",
        detail: "見本の縁をつなぎ、処理する順を考える。",
        hint: [
          "暗室のトレーの上に、四枚の処理見本が掛かっています。黒いトレー・白いトレー・灰色のトレー・水道の写真を見てください。",
          "見本の紙の切り欠きがつながる順に、乾板を移します。黒いトレーで始め、最後は水道で洗います。",
          "黒 → 白 → 灰 → 水。誤った順でも最初から試せる。",
        ],
      },
      {
        id: "camera",
        room: 4,
        name: "撮影位置",
        kind: "settings",

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
        detail: "椅子と支柱の間隔、床の傷を写真と合わせる。",
        hint: [
          "受付に掛かる椅子の写真と、撮影機に映る像を見比べます。椅子と右の支柱の間隔、像の鮮明さ、高さを合わせてください。",
          "撮影機の画面の下にある三つのつまみは、左から撮影位置・焦点・高さです。位置を右へ、焦点を中間へ、高さを高い位置へ合わせます。",
          "台車3・焦点2・高さ1。側面を開けてレリーズを取る。",
        ],
      },
      {
        id: "shutters",
        room: 4,
        name: "照明の切替器",
        kind: "sequence",

        answer: [2, 2, 1, 0, 0],
        initial: [],
        labels: ["左灯", "上灯", "右灯"],
        items: ["cable"],
        clues: ["shutter"],
        rewards: ["handle"],
        effect: "下の引き出しで、留め金の音がした。",
        detail: "五枚の写真と同じ光を、順に再現する。",
        hint: [
          "撮影室の窓の間に縦に並ぶ五枚の写真を、上から下へ見ます。椅子の影がどちらへ伸びているかを読んでください。",
          "影が左に伸びる写真は右の灯り、右に伸びる写真は左の灯りです。正面に伸びる中央の写真は上の灯り。切替器のボタンは左・上・右の順に並んでいます。",
          "右 → 右 → 上 → 左 → 左。",
        ],
      },
      {
        id: "panorama",
        room: 3,
        name: "切り離された景色",
        kind: "order",

        answer: [3, 1, 0, 2],
        initial: [0, 1, 2, 3],
        labels: ["窓の左半分", "扉の右半分", "窓の右半分", "扉の左半分"],
        items: ["print"],
        clues: ["panorama"],
        rewards: ["finalPlate"],
        effect: "窓の続きに、小さな搬出口が現れた。",
        detail: "写真の縁をつなぎ、左から一枚の景色にする。",
        hint: [
          "暗室の四枚の細長い写真を、切れ目の線がつながるように並べます。二枚を順に押すと交換できます。",
          "完成すると左に扉、右に窓が来ます。まず扉の左右をつなぎ、その右に窓の左右をつなぎます。",
          "扉の左半分 → 扉の右半分 → 窓の左半分 → 窓の右半分。",
        ],
      },
      {
        id: "masks",
        room: 3,
        name: "三枚のガラス",
        kind: "rotate",

        answer: [0, 0, 0],
        initial: [2, 0, 3],
        size: 4,
        labels: ["一枚目", "二枚目", "三枚目"],
        items: ["mask"],
        clues: ["mask"],
        effect: "柱と窓の形がつながった。",
        detail: "三枚の向きを直し、弧と縦線をつなぐ。",
        hint: [
          "暗室の光る台に三枚のガラスを置き、それぞれを押して回します。隣り合う板の線がつながる向きを探してください。",
          "完成するのは、上が丸いアーチ窓です。丸い輪郭が上側、窓の中央の線が縦になるように合わせます。",
          "初期状態から、一枚目2回・二枚目0回・三枚目1回。",
        ],
      },
      {
        id: "wall",
        room: 4,
        name: "写真の外側",
        kind: "map",

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
          "暗室で完成した景色と三枚のガラスに見える窓を、撮影機の奥の壁に掛かる配置図と比べてください。",
          "二つの像は、上が丸いアーチ窓を示しています。配置図では上中央の部屋です。その部屋は、撮影室の背景幕の向こうにあります。",
          "配置図の上中央は、撮影室の背景幕の向こう。軸にハンドルを取り付けて回す。",
        ],
      },
      {
        id: "backfeed",
        room: 5,
        name: "反対側の送り口",
        kind: "feed",

        answer: [1, 2],
        initial: [0, 0],
        size: 4,
        labels: ["左の送り", "右の送り"],
        items: ["crank"],
        clues: ["model", "reverse"],
        rewards: ["paper"],
        effect: "ケースを押さえていた爪が退いた。",
        detail: "同じ型の機構が、左右を逆に組まれている。",
        hint: [
          "裏室の棚の右上に掛かる装置の図を、修整室の二本レバーの見本と比べてください。",
          "裏室の装置は左右が逆です。展示廊下で先に動かした左レバーに対応するのは、こちらの右レバーです。",
          "右を2回、左を1回。",
        ],
      },
      {
        id: "print",
        room: 5,
        name: "最後の焼付け",
        kind: "develop",

        answer: [0, 2, 1, 3],
        initial: [],
        labels: ["光を当てる", "白い槽", "黒い槽", "水洗い"],
        items: ["finalPlate", "paper"],
        clues: ["printProcess"],
        rewards: ["portrait"],
        effect: "一枚の写真が浮かんだ。戸口の裏側が写っている。",
        detail: "乾板と印画紙を入れ、見本の順に焼き付ける。",
        hint: [
          "裏室の机の上に掛かる手順写真を見ます。最初の写真はランプ、次は黒いトレーです。",
          "中央の枠に乾板と印画紙を入れ、左のランプで光を当てます。その後、黒いトレー、白いトレー、水洗いの順に紙を移します。",
          "光 → 黒 → 白 → 水。最後の写真を取って裏を調べる。",
        ],
      },
      {
        id: "beyond",
        room: 5,
        name: "搬出口の留め具",
        kind: "sequence",

        answer: [2, 0, 2, 1],
        initial: [],
        labels: ["左の留め具", "中央の留め具", "右の留め具"],
        requires: ["backfeed"],
        clues: ["exit"],
        effect: "扉の向こうで、雨の音がした。",
        detail: "戸口の写真を、今立っている側へ読み直す。",
        hint: [
          "最後にできた写真を持ち物から調べ、「裏返す」を押してください。四枚の小さな写真を、左上・右上・左下・右下の順に見ます。",
          "裏面の写真では窓が右にありますが、目の前の扉では左です。反対側から写した写真なので、留め具の左右を入れ替えて操作します。",
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
          target: "入口は固く閉ざされている。",
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
export const PUZZLE_IDS = Object.keys(PUZZLES);
