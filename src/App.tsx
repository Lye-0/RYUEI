import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  CLUES,
  FACES,
  ITEMS,
  PUZZLES,
  ROOMS,
  itemPhoto,
  photo,
  type Node,
  type Photo as PhotoSpec,
  type Puzzle,
} from "./data";
import * as E from "./engine";
import { Photo } from "./Photo";
import { Controls } from "./Controls";
import { MechanismDemo } from "./MechanismDemo";
import { ambience, tick } from "./audio";

type Panel =
  | { type: "puzzle"; id: string }
  | { type: "clue"; id: string }
  | { type: "item"; id: string }
  | { type: "door"; to: number; label: string }
  | { type: "detail"; text: string }
  | null;
type Menu = "journal" | "settings" | "map" | "hints" | "restart" | null;
const rect = ([x, y, w, h]: number[]): CSSProperties => ({
  left: x + "%",
  top: y + "%",
  width: w + "%",
  height: h + "%",
});
function Modal({
  children,
  title,
  close,
}: {
  children: ReactNode;
  title: string;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon" aria-label="閉じる" onClick={close}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
function initial() {
  try {
    return E.parse(localStorage.getItem(E.SAVE_KEY)) ?? E.fresh();
  } catch {
    return E.fresh();
  }
}
function containerPhoto(p: Puzzle, s: E.State): PhotoSpec {
  if (!s.opened.includes(p.id)) {
    if (p.kind === "feed") {
      const v = E.values(s, p.id);
      const lead = p.id === "backfeed" ? 1 : 0;
      const stage = Math.min(2, v[lead]);
      return photo(
        p.id === "backfeed" ? "backfeed-states" : "feed-states",
        stage === 2 && v[1 - lead] === 1 ? 3 : stage,
        2,
        2,
      );
    }
    if (p.id === "lamp")
      return photo(
        "lamp-states",
        s.solved.includes("lamp")
          ? 2
          : s.installed.lamp?.includes("bulb")
            ? 1
            : 0,
        2,
        2,
      );
    return p.image;
  }
  const left = p.rewards?.filter((x) => !s.collected.includes(x)) ?? [];
  const empty = left.length === 0;
  if (p.id === "frames" && left.length === 1)
    return photo("partial", left[0] === "bulb" ? 0 : 1, 2, 1);
  if (p.id === "rack" && left.length === 1)
    return photo("rewards", left[0] === "plate" ? 10 : 11, 3, 4);
  const paired: Record<string, [string, number, number]> = {
    panel: ["reception-details", 1, 2],
    frames: ["gallery-details", 1, 2],
    rack: ["retouch-details", 1, 2],
    feed: ["gallery-details", 4, 5],
    develop: ["darkroom-details", 1, 2],
    camera: ["studio-details", 1, 2],
    backfeed: ["backroom-details", 1, 2],
  };
  if (paired[p.id]) {
    const [sheet, full, none] = paired[p.id];
    return photo(sheet, empty ? none : full);
  }
  const rewards: Record<string, number> = {
    lamp: 0,
    cut: 2,
    shutters: 4,
    panorama: 6,
    print: 8,
  };
  if (p.id in rewards)
    return photo("rewards", rewards[p.id] + (empty ? 1 : 0), 3, 4);
  if (p.id === "masks") return photo("fragments", 15, 4, 4);
  if (p.id === "wall") return photo("studio-open", 0, 1, 1);
  return p.image;
}
const pickupRects: Record<string, number[][]> = {
  panel: [[36, 55, 24, 18]],
  frames: [
    [19, 56, 35, 21],
    [63, 53, 21, 25],
  ],
  rack: [
    [68, 49, 21, 18],
    [67, 60, 27, 13],
  ],
  feed: [[34, 39, 30, 28]],
  develop: [[12, 72, 74, 22]],
  camera: [[69, 42, 23, 24]],
  backfeed: [[36, 56, 31, 13]],
};
const fittingRects: Record<string, number[][]> = {
  lamp: [[63, 15, 23, 20]],
  feed: [[42, 3, 17, 18]],
  cut: [[35, 27, 41, 41]],
  develop: [[3, 47, 26, 17]],
  camera: [[27, 23, 31, 28]],
  shutters: [[73, 54, 18, 21]],
  panorama: [[17, 35, 65, 40]],
  masks: [[14, 26, 66, 42]],
  wall: [[76, 38, 20, 23]],
  backfeed: [[49, 23, 15, 18]],
  print: [
    [23, 14, 46, 30],
    [24, 50, 23, 28],
  ],
};
const openRects: Record<string, number[]> = {
  panel: [47, 32, 24, 23],
  frames: [32, 54, 36, 22],
  rack: [22, 72, 56, 15],
  lamp: [79, 23, 20, 25],
  feed: [24, 18, 52, 23],
  develop: [10, 72, 75, 22],
  camera: [66, 31, 30, 42],
  shutters: [26, 63, 44, 23],
  panorama: [35, 74, 30, 18],
  backfeed: [35, 54, 37, 20],
  wall: [76, 38, 20, 23],
  beyond: [46, 53, 28, 29],
  cut: [34, 27, 43, 42],
  masks: [22, 74, 60, 18],
  print: [24, 46, 53, 38],
};
function Hint({
  p,
  s,
  update,
}: {
  p: Puzzle;
  s: E.State;
  update: (s: E.State) => void;
}) {
  const [page, setPage] = useState(0);
  const n = s.hints[p.id] ?? 0;
  const current = Math.min(page, 2);
  let help = "";
  if (s.solved.includes(p.id)) {
    const pending = p.rewards?.filter((i) => !s.collected.includes(i));
    help = pending?.length
      ? s.opened.includes(p.id)
        ? "開いた中の物を押して拾う。"
        : "仕掛けは解けている。取っ手を押して中を調べる。"
      : "この仕掛けは完了している。ほかの部屋へ。";
  } else if (
    p.items?.some(
      (i) => !s.installed[p.id]?.includes(i) && s.inventory.includes(i),
    )
  )
    help = "必要な物を持っている。接写で選び、取り付け位置を押す。";
  return (
    <div className="hint-card">
      <h3>{p.name}</h3>
      {help && <p>{help}</p>}
      {n === 0 ? (
        <button
          className="line-button"
          onClick={() => update({ ...s, hints: { ...s.hints, [p.id]: 1 } })}
        >
          最初の手掛かりを開く
        </button>
      ) : (
        <>
          <p>{p.hint[current]}</p>
          <div className="hint-nav">
            <button
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              前へ
            </button>
            <span>{current + 1} / 3</span>
            <button
              disabled={current === 2}
              onClick={() => {
                setPage(current + 1);
                update({
                  ...s,
                  hints: { ...s.hints, [p.id]: Math.max(n, current + 2) },
                });
              }}
            >
              次の手掛かり
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [s, setS] = useState<E.State>(initial),
    [playing, setPlaying] = useState(false),
    [panel, setPanel] = useState<Panel>(null),
    [menu, setMenu] = useState<Menu>(null),
    [selected, setSelected] = useState<string | null>(null),
    [back, setBack] = useState(false),
    [marks, setMarks] = useState(false),
    [toast, setToast] = useState(""),
    [hover, setHover] = useState(""),
    [saveError, setSaveError] = useState(false),
    [compare, setCompare] = useState<string[]>([]),
    [hintId, setHintId] = useState("panel");
  const origins = useRef<Exclude<Panel, null>[]>([]),
    noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function notify(text: string) {
    setToast(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setToast(""), 3800);
  }
  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (s.started)
      try {
        localStorage.setItem(E.SAVE_KEY, JSON.stringify(s));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
  }, [s]);
  useEffect(() => {
    if (!playing || s.finished) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible" && !menu)
        setS((g) => ({ ...g, elapsed: g.elapsed + 1 }));
    }, 1000);
    return () => clearInterval(t);
  }, [playing, s.finished, menu]);
  useEffect(() => {
    const sync = () => {
      ambience(
        s.sound &&
          playing &&
          !s.finished &&
          document.visibilityState === "visible",
      ).catch(() => {});
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [s.sound, playing, s.finished]);
  function close() {
    setPanel(origins.current.pop() ?? null);
    setSelected(null);
    setBack(false);
  }
  function turn(dir: "left" | "right" | "up" | "down") {
    if (panel || menu) return;
    setS((g) => E.turn(g, dir));
    setSelected(null);
    setHover("");
    tick();
  }
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (!playing || menu) return;
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (e.key === "Escape" || (e.key === "ArrowDown" && panel)) {
        e.preventDefault();
        close();
        return;
      }
      if (panel) return;
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        turn(map[e.key]);
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [playing, panel, menu]);
  function viewClue(id: string) {
    const clue = CLUES[id];
    if (clue.requires?.some((x) => !s.solved.includes(x))) {
      notify("まだ、像が見えない。");
      return;
    }
    if (panel) origins.current.push(panel);
    setPanel({ type: "clue", id });
    setBack(false);
    setSelected(null);
    setS((g) => E.observe(g, id));
  }
  function inspect(id: string) {
    if (panel) origins.current.push(panel);
    setPanel({ type: "item", id });
    setBack(false);
    setSelected(null);
  }
  function touch(node: Node) {
    setSelected(null);
    setHover("");
    origins.current = [];
    if (node.type === "puzzle") {
      setPanel({ type: "puzzle", id: node.target });
      setHintId(node.target);
    } else if (node.type === "clue") viewClue(node.target);
    else if (node.type === "door") {
      if (node.requires && !s.opened.includes(node.requires)) {
        setPanel({ type: "puzzle", id: node.requires });
        return;
      }
      setPanel({ type: "door", to: Number(node.target), label: node.label });
    } else if (node.type === "detail")
      setPanel({ type: "detail", text: node.target });
  }
  function travel(to: number, fast = false) {
    const next = E.move(s, to, selected, fast);
    if (next === s) {
      const required = E.doorRequirement(s, to);
      notify(required ? "鍵穴がある。持ち物を選んで使う。" : "まだ通れない。");
      return;
    }
    setS(next);
    setPanel(null);
    setMenu(null);
    setSelected(null);
    origins.current = [];
    setHover("");
    tick();
  }
  const room = ROOMS[s.room],
    p = panel?.type === "puzzle" ? PUZZLES[panel.id] : null;
  let asset = photo(room.id, s.face);
  if (s.room === 4 && s.face === 0 && s.opened.includes("wall"))
    asset = photo("studio-open", 0, 1, 1);
  if (p) asset = containerPhoto(p, s);
  if (panel?.type === "clue") asset = CLUES[panel.id].image;
  if (panel?.type === "item") {
    const i = ITEMS[panel.id];
    asset = back && i.back ? CLUES[i.back].image : itemPhoto(panel.id);
  }
  if (
    p?.id === "wall" &&
    !s.opened.includes("wall") &&
    (!s.installed.wall?.includes("handle") || s.solved.includes("wall"))
  )
    asset = photo("studio-details", 4);
  const solved = !!p && s.solved.includes(p.id),
    opened = !!p && s.opened.includes(p.id),
    allowed = !!p && E.available(s, p.id) && !solved;
  const missing =
    p?.items?.filter((i) => !s.installed[p.id]?.includes(i)) ?? [];
  function submit() {
    if (!p) return;
    const next = E.solve(s, p.id);
    setSelected(null);
    if (next === s) notify("まだ、かみ合わない。");
    else {
      setS(next);
      tick(true);
      notify(p.effect);
    }
  }
  function insert(item: string) {
    if (!p) return;
    if (selected !== item) {
      notify("持ち物を選んでから、ここへ。");
      return;
    }
    const next = E.install(s, p.id, item);
    if (next === s) notify("ここには合わない。");
    else {
      setS(next);
      setSelected(null);
      notify(ITEMS[item].name + "を取り付けた。");
      tick();
    }
  }
  function change(v: number[]) {
    if (p) {
      setS((g) => E.input(g, p.id, v));
      setSelected(null);
      tick();
    }
  }
  if (!playing)
    return (
      <main className="title-screen">
        <Photo asset={photo("reception", 0)} className="title-photo" />
        <div className="title-veil" />
        <div className="title-brand">
          <p className="eyebrow">A PHOTOGRAPH LEFT BEHIND</p>
          <h1>留影</h1>
          <span className="roman-title">R Y U E I</span>
          <p className="title-copy">
            雨の夜。閉ざされた写真館。
            <br />
            まだ、写っていない場所がある。
          </p>
          <button
            className="start-button"
            onClick={() => {
              setPlaying(true);
              setS((g) => ({ ...g, started: true }));
              notify("物を押して近づく。◉で調べられる場所を表示できる。");
            }}
          >
            {s.started ? "つづきから" : "写真館に入る"}
            <span>↗</span>
          </button>
          {s.started && (
            <button className="subtle" onClick={() => setMenu("restart")}>
              はじめから
            </button>
          )}
          <p className="title-note">
            音のある静けさ。イヤホンは任意です。
            <br />
            進行はこのブラウザに保存されます。
          </p>
        </div>
        <p className="title-side">
          誰もいない。椅子だけが、こちらを向いている。
        </p>
        <footer className="title-footer">
          <span>PHOTOGRAPHIC ESCAPE</span>
          <span>一人用・自動保存</span>
        </footer>
        {menu === "restart" && (
          <Modal title="記録を消して始める" close={() => setMenu(null)}>
            <p>このブラウザの留影の記録を消します。</p>
            <button
              className="line-button"
              onClick={() => {
                const next = E.fresh();
                setS(next);
                try {
                  localStorage.removeItem(E.SAVE_KEY);
                } catch {}
                setMenu(null);
                setPlaying(true);
                setS({ ...next, started: true });
              }}
            >
              記録を消して始める
            </button>
          </Modal>
        )}
      </main>
    );
  if (s.finished)
    return (
      <main className="ending">
        <Photo asset={photo("ending", 0, 1, 1)} className="ending-photo" />
        <div className="ending-copy">
          <p className="eyebrow">AFTER THE RAIN</p>
          <h1>留影</h1>
          <p>
            戸口の外で、雨が止んだ。
            <br />
            写真の中では、まだ誰かが待っている。
          </p>
          <span className="ending-time">
            {Math.floor(s.elapsed / 60)}分 · {s.solved.length}の仕掛け ·
            手掛かり {Object.values(s.hints).reduce((a, b) => a + b, 0)}
          </span>
          <button
            className="line-button"
            onClick={() => {
              setPlaying(false);
            }}
          >
            タイトルへ
          </button>
          <button
            className="subtle"
            onClick={() => {
              setS((g) => ({ ...g, finished: false }));
              setPanel(null);
            }}
          >
            写真館を見直す
          </button>
        </div>
      </main>
    );
  return (
    <main
      className={`game ${s.motion ? "" : "reduce-motion"}`}
      style={{ "--brightness": s.brightness } as CSSProperties}
    >
      <header className="game-header">
        <button
          className="wordmark"
          aria-label="タイトルへ戻る"
          onClick={() => {
            setPlaying(false);
            setPanel(null);
          }}
        >
          留影<span>RYUEI</span>
        </button>
        <div className="room-label">
          <span>{room.chapter}</span>
          <h1>{room.name}</h1>
        </div>
        <div className="header-tools">
          <button
            className="icon"
            aria-label="写真の記録"
            title="写真の記録"
            onClick={() => setMenu("journal")}
          >
            ▤
          </button>
          <button
            className="icon"
            aria-label="館内を移動"
            title="館内を移動"
            onClick={() => setMenu("map")}
          >
            ⌑
          </button>
          <button
            className="icon"
            aria-label="設定"
            title="設定"
            onClick={() => setMenu("settings")}
          >
            ☰
          </button>
        </div>
      </header>
      <section className="play-area">
        <div className="stage-wrap">
          <div
            className={`stage ${panel ? "closeup" : ""} puzzle-${p?.id ?? "none"}`}
            aria-label={
              p
                ? p.name
                : panel?.type === "clue"
                  ? CLUES[panel.id].name
                  : panel?.type === "item"
                    ? ITEMS[panel.id].name
                    : room.name + "・" + FACES[s.face]
            }
          >
            {(panel?.type === "clue" && panel.id === "model") ||
            (panel?.type === "item" &&
              back &&
              ITEMS[panel.id].back === "model") ? (
              <MechanismDemo />
            ) : (
              <Photo asset={asset} className="scene-image" />
            )}
            {!panel && (
              <div className={`hotspots ${marks ? "marked" : ""}`}>
                {room.views[s.face]
                  .filter(
                    (n) =>
                      !(
                        n.type === "door" &&
                        n.requires &&
                        !s.opened.includes(n.requires)
                      ),
                  )
                  .map((n) => (
                    <button
                      key={n.type + ":" + n.id}
                      className={"hotspot " + n.type}
                      style={rect(n.rect)}
                      aria-label={n.label}
                      onMouseEnter={() => setHover(n.label)}
                      onMouseLeave={() => setHover("")}
                      onFocus={() => setHover(n.label)}
                      onClick={() => touch(n)}
                    >
                      <span>{n.label}</span>
                    </button>
                  ))}
              </div>
            )}
            {p && !opened && (
              <>
                {!(p.id === "wall" && (!allowed || solved)) && (
                  <Controls
                    key={p.id}
                    p={p}
                    v={E.values(s, p.id)}
                    disabled={!allowed}
                    change={change}
                    feed={(i) => change(E.feedStep(s, p.id, i))}
                  />
                )}
                {p.id === "camera" && s.installed.camera?.includes("lens") && (
                  <Photo
                    className="camera-sight"
                    asset={photo("fragments", 8 + E.values(s, p.id)[0], 4, 4)}
                    style={{
                      filter: `blur(${E.values(s, p.id)[1] === 1 ? 0 : 1.7}px)`,
                      transform: `translateY(${(E.values(s, p.id)[2] - 1) * 3}%)`,
                    }}
                  />
                )}
                {solved && (
                  <button
                    className="physical-open"
                    style={rect(openRects[p.id] ?? [32, 73, 36, 18])}
                    aria-label={
                      p.id === "wall"
                        ? "幕を上げる"
                        : p.id === "beyond"
                          ? "搬出口を開ける"
                          : p.id === "masks"
                            ? "像を記録する"
                            : p.id === "cut"
                              ? "台紙を外す"
                              : p.id === "panorama"
                                ? "乾板を外す"
                                : "収納を開ける"
                    }
                    onClick={() => {
                      if (p.id === "beyond") {
                        setS(E.finish(s));
                        tick(true);
                      } else {
                        setS(E.open(s, p.id));
                        notify(
                          p.id === "wall"
                            ? "奥に部屋がある。"
                            : "開いた。中を調べる。",
                        );
                      }
                    }}
                  >
                    <span>
                      {p.id === "wall"
                        ? "幕を上げる"
                        : p.id === "beyond"
                          ? "扉を開ける"
                          : p.id === "masks"
                            ? "像を記録する"
                            : p.id === "cut"
                              ? "台紙を外す"
                              : p.id === "panorama"
                                ? "乾板を外す"
                                : "開ける"}
                    </span>
                  </button>
                )}
                {missing.map((id) => (
                  <button
                    key={id}
                    className={"fitting " + (selected === id ? "ready" : "")}
                    style={rect(
                      fittingRects[p.id]?.[p.items!.indexOf(id)] ?? [
                        77, 79, 12, 13,
                      ],
                    )}
                    aria-label={`${ITEMS[id].name}の取り付け位置`}
                    onClick={() => insert(id)}
                  >
                    <span>使う</span>
                  </button>
                ))}
              </>
            )}
            {p?.id === "frames" && opened && (
              <Controls
                p={p}
                v={E.values(s, p.id)}
                disabled
                change={() => {}}
                feed={() => {}}
              />
            )}
            {p &&
              opened &&
              p.rewards?.map(
                (id, i) =>
                  !s.collected.includes(id) && (
                    <button
                      key={id}
                      className={"pickup " + (marks ? "marked" : "")}
                      style={rect(pickupRects[p.id]?.[i] ?? [20, 20, 60, 60])}
                      aria-label={`${ITEMS[id].name}を拾う`}
                      onClick={() => {
                        setS((g) => E.take(g, p.id, id));
                        setSelected(null);
                        notify(ITEMS[id].name + "を手に取った。");
                        tick();
                      }}
                    >
                      <span>{ITEMS[id].name}</span>
                    </button>
                  ),
              )}
            {p?.id === "wall" && opened && (
              <button
                className="hotspot marked"
                style={rect([28, 15, 45, 77])}
                aria-label="裏室へ進む"
                onClick={() => travel(5)}
              >
                <span>奥へ</span>
              </button>
            )}
            {panel?.type === "door" && (
              <div className="door-action">
                <p>
                  {E.doorRequirement(s, panel.to)
                    ? "鍵穴がある。"
                    : panel.label}
                </p>
                <button
                  className="line-button"
                  onClick={() => travel(panel.to)}
                >
                  {E.doorRequirement(s, panel.to)
                    ? "選んだ鍵を使う"
                    : "扉を開ける"}
                </button>
              </div>
            )}
            {panel?.type === "detail" && (
              <p className="detail-caption">{panel.text}</p>
            )}
            {panel?.type === "item" && (
              <button
                className="flip"
                onClick={() => {
                  setBack(!back);
                  const id = ITEMS[panel.id].back;
                  if (!back && id) setS((g) => E.observe(g, id));
                }}
              >
                {back ? "表へ" : "裏返す"} ↻
              </button>
            )}
            {!panel && (
              <>
                <button
                  className="direction left"
                  aria-label="左を向く"
                  disabled={s.face > 3}
                  onClick={() => turn("left")}
                >
                  ◀
                </button>
                <button
                  className="direction right"
                  aria-label="右を向く"
                  disabled={s.face > 3}
                  onClick={() => turn("right")}
                >
                  ▶
                </button>
                <button
                  className="direction up"
                  aria-label={s.face === 5 ? "床から戻る" : "天井を見る"}
                  disabled={s.face === 4}
                  onClick={() => turn("up")}
                >
                  ▲
                </button>
                <button
                  className="direction down"
                  aria-label={s.face === 4 ? "天井から戻る" : "床を見る"}
                  disabled={s.face === 5}
                  onClick={() => turn("down")}
                >
                  ▼
                </button>
              </>
            )}
          </div>
          {panel && (
            <button className="back-button" aria-label="戻る" onClick={close}>
              ▼
            </button>
          )}
          <div className="scene-caption">
            <span>
              {panel
                ? (p?.name ??
                  (panel.type === "item"
                    ? ITEMS[panel.id].name
                    : panel.type === "clue"
                      ? CLUES[panel.id].name
                      : ""))
                : hover || FACES[s.face]}
            </span>
            <span>
              {!panel &&
                ["●", "●", "●", "●"].map((x, i) => (
                  <i key={i} className={s.wall === i ? "current" : ""}>
                    {x}
                  </i>
                ))}
            </span>
          </div>
          {p && !opened && (
            <div className="puzzle-toolbar">
              <p>
                {missing.length
                  ? "取り付ける場所がある。"
                  : p.requires?.some((x) => !s.solved.includes(x))
                    ? p.id === "wall"
                      ? "暗室の景色と、ガラスの輪郭を照合する。"
                      : "まだ動かない。"
                    : solved
                      ? "留め具が外れている。"
                      : (p.instruction ?? p.detail)}
              </p>
              {allowed && (
                <>
                  <div className="input-status" aria-live="polite">
                    {["sequence", "develop"].includes(p.kind)
                      ? `${E.values(s, p.id).length} / ${p.answer.length}`
                      : ["settings", "feed"].includes(p.kind)
                        ? p.labels
                            .map(
                              (l, i) =>
                                `${l} ${p.choices?.[i]?.[E.values(s, p.id)[i]] ?? E.values(s, p.id)[i]}`,
                            )
                            .join(" · ")
                        : ["select", "map"].includes(p.kind)
                          ? `${E.values(s, p.id).length}箇所を選択`
                          : ""}
                  </div>
                  <button
                    className="subtle"
                    onClick={() => {
                      change([...p.initial]);
                    }}
                  >
                    戻す
                  </button>
                  <button className="line-button" onClick={submit}>
                    {p.kind === "develop"
                      ? "処理する"
                      : p.kind === "map"
                        ? "調べる"
                        : "確かめる"}
                  </button>
                </>
              )}
            </div>
          )}
          {p && (
            <div className="references">
              <button
                className="subtle"
                onClick={() => {
                  setHintId(p.id);
                  setMenu("hints");
                }}
              >
                手掛かり
              </button>
              {p.clues
                .filter((id) => s.seen.includes(id))
                .map((id) => (
                  <button
                    key={id}
                    className="reference"
                    onClick={() => viewClue(id)}
                  >
                    {CLUES[id].name}
                  </button>
                ))}
              {(s.installed[p.id] ?? []).map((id) => (
                <button
                  key={id}
                  className="installed"
                  onClick={() => inspect(id)}
                >
                  設置済み：{ITEMS[id].name}
                </button>
              ))}
            </div>
          )}
          {panel?.type === "clue" && (
            <p className="observation">{CLUES[panel.id].text}</p>
          )}
          {panel?.type === "item" && (
            <p className="observation">
              {back
                ? ITEMS[panel.id].back
                  ? CLUES[ITEMS[panel.id].back!].text
                  : "ほかに目立つ印はない。"
                : ITEMS[panel.id].description}
            </p>
          )}
        </div>
      </section>
      <footer className="inventory-area">
        <div className="inventory-heading">
          <span>
            持ち物{" "}
            <small>
              {s.inventory.length
                ? String(s.inventory.length).padStart(2, "0")
                : "—"}
            </small>
          </span>
          <div>
            <button
              className={"icon " + (marks ? "active" : "")}
              aria-label="調べられる場所を表示"
              aria-pressed={marks}
              onClick={() => setMarks(!marks)}
            >
              ◉
            </button>
            <button
              className="icon"
              aria-label="音の切り替え"
              aria-pressed={s.sound}
              onClick={() => setS((g) => ({ ...g, sound: !g.sound }))}
            >
              {s.sound ? "♫" : "♪"}
            </button>
            <button
              className="icon"
              aria-label="手掛かりを開く"
              onClick={() => setMenu("hints")}
            >
              ?
            </button>
          </div>
        </div>
        <div className="inventory">
          {s.inventory.map((id) => (
            <div
              className={"item " + (selected === id ? "selected" : "")}
              key={id}
            >
              <button
                className="item-select"
                aria-label={`${ITEMS[id].name}を選ぶ`}
                aria-pressed={selected === id}
                onClick={() => setSelected(selected === id ? null : id)}
                onDoubleClick={() => inspect(id)}
              >
                <Photo asset={itemPhoto(id)} label={ITEMS[id].name} />
              </button>
              <button
                className="item-inspect"
                aria-label={`${ITEMS[id].name}を調べる`}
                onClick={() => inspect(id)}
              >
                ⌕
              </button>
            </div>
          ))}
          {s.inventory.length === 0 && (
            <span className="empty-inventory">まだ、何も持っていない。</span>
          )}
        </div>
        <div className="selected-caption">
          {selected
            ? ITEMS[selected].name + "を選んでいる。"
            : saveError
              ? "保存できません。ブラウザの保存設定を確認してください。"
              : "記録は自動で残ります。"}
        </div>
      </footer>
      <div role="status" className={"toast " + (toast ? "visible" : "")}>
        {toast}
      </div>
      {menu && (
        <Modal
          title={
            {
              journal: "写真の記録",
              settings: "設定",
              map: "館内",
              hints: "手掛かり",
              restart: "記録を消す",
            }[menu]
          }
          close={() => setMenu(null)}
        >
          {menu === "settings" && (
            <div className="settings">
              <label>
                写真の明るさ
                <input
                  aria-label="写真の明るさ"
                  type="range"
                  min=".8"
                  max="1.4"
                  step=".05"
                  value={s.brightness}
                  onChange={(e) =>
                    setS((g) => ({ ...g, brightness: Number(e.target.value) }))
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.sound}
                  onChange={(e) =>
                    setS((g) => ({ ...g, sound: e.target.checked }))
                  }
                />
                雨音と機構の音
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.motion}
                  onChange={(e) =>
                    setS((g) => ({ ...g, motion: e.target.checked }))
                  }
                />
                画面のゆっくりした変化
              </label>
              <p>
                物を押して近づく。持ち物を選び、使う場所を押す。写真は記録から見直せる。
              </p>
              <p>持ち物の⌕から、表と裏を調べられます。</p>
              <button className="subtle" onClick={() => setMenu("restart")}>
                はじめから
              </button>
            </div>
          )}
          {menu === "restart" && (
            <>
              <p>このブラウザの進行を消します。</p>
              <button
                className="line-button"
                onClick={() => {
                  setS({ ...E.fresh(), started: true });
                  setPanel(null);
                  setSelected(null);
                  setMenu(null);
                  setCompare([]);
                  origins.current = [];
                }}
              >
                記録を消して始める
              </button>
            </>
          )}
          {menu === "map" && (
            <div className="map-list">
              {ROOMS.map((r, i) => (
                <button
                  disabled={!s.visited.includes(i)}
                  key={r.id}
                  onClick={() => travel(i, true)}
                >
                  <span>{r.chapter}</span>
                  {s.visited.includes(i) ? r.name : "未訪問"}
                  <span>{s.room === i ? "現在地" : "↗"}</span>
                </button>
              ))}
              <p>一度訪れた部屋への道を辿ります。</p>
            </div>
          )}
          {menu === "journal" && (
            <>
              <p className="muted">二枚まで選び、見比べる。</p>
              {compare.length > 0 && (
                <div className="comparison">
                  {compare.map((id) => (
                    <div key={id}>
                      <Photo asset={CLUES[id].image} label={CLUES[id].name} />
                      <p>{CLUES[id].name}</p>
                      <button
                        className="subtle"
                        onClick={() => {
                          setMenu(null);
                          viewClue(id);
                        }}
                      >
                        大きく見る
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="journal-grid">
                {s.seen.map((id) => (
                  <button
                    key={id}
                    className={compare.includes(id) ? "selected" : ""}
                    onClick={() =>
                      setCompare((a) =>
                        a.includes(id)
                          ? a.filter((x) => x !== id)
                          : [...a.slice(-1), id],
                      )
                    }
                  >
                    <Photo asset={CLUES[id].image} />
                    <span>{CLUES[id].name}</span>
                  </button>
                ))}
              </div>
              {!s.seen.length && <p>調べた写真が、ここに残ります。</p>}
            </>
          )}
          {menu === "hints" && (
            <>
              <label className="hint-picker">
                調べているもの
                <select
                  value={hintId}
                  onChange={(e) => setHintId(e.target.value)}
                >
                  {Object.values(PUZZLES)
                    .filter((p) => s.visited.includes(p.room))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {ROOMS[p.room].name} / {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <Hint key={hintId} p={PUZZLES[hintId]} s={s} update={setS} />
            </>
          )}
        </Modal>
      )}
    </main>
  );
}
