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
  photo,
  type Node,
  type Photo as PhotoSpec,
  type Puzzle,
} from "./data";
import * as E from "./engine";
import { Photo } from "./Photo";
import { Scene } from "./Scene";
import { SceneDocument, itemPortrait as itemPhoto } from "./SceneDocument";
import { ambience, tick } from "./audio";

type Panel =
  | { type: "puzzle"; id: string }
  | { type: "clue"; id: string; inWorld?: boolean }
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
    } else if (node.type === "clue") {
      setPanel({ type: "clue", id: node.target, inWorld: true });
      setS((g) => E.observe(g, node.target));
    } else if (node.type === "take") viewClue(node.target);
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
    if (!fast && !E.doorIsOpen(s, to)) {
      const required = E.doorRequirement(s, to);
      if (required) {
        const next = E.unlockDoor(s, to, selected);
        if (next === s)
          notify(selected ? "この鍵は合わない。" : "鍵がかかっている。");
        else {
          setS(next);
          setSelected(null);
          notify("カチリ。");
        }
        return;
      }
      setS(E.openDoor(s, to));
      tick();
      return;
    }
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
  const asset =
    panel?.type === "clue"
      ? CLUES[panel.id].image
      : panel?.type === "item"
        ? back && ITEMS[panel.id].back
          ? CLUES[ITEMS[panel.id].back!].image
          : itemPhoto(panel.id)
        : photo(room.id, s.face);
  if (!playing)
    return (
      <main className="title-screen">
        <Photo asset={photo("reception-north")} className="title-photo" />
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
            {panel?.type === "item" ? (
              <Photo
                asset={asset}
                className="scene-image"
                style={
                  panel.id === "mask"
                    ? {
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
            ) : panel?.type === "clue" && !panel.inWorld ? (
              <SceneDocument id={panel.id} />
            ) : (
              <Scene
                key={s.room + ":" + s.face}
                s={s}
                focus={panel}
                selected={selected}
                marks={marks}
                touch={touch}
                update={(next) => {
                  setS(next);
                  setSelected(null);
                  tick(next.solved.length > s.solved.length);
                }}
                notify={notify}
                travel={travel}
              />
            )}
            {panel?.type === "detail" && (
              <p className="detail-caption">{panel.text}</p>
            )}
            {panel?.type === "item" && ITEMS[panel.id].back && (
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
          <span>持ち物</span>
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
              : ""}
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
              <button
                className="line-button"
                onClick={() => setMenu("journal")}
              >
                写真の記録
              </button>
              <button className="line-button" onClick={() => setMenu("map")}>
                館内
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={marks}
                  onChange={(e) => setMarks(e.target.checked)}
                />
                調べられる範囲を表示
              </label>
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
              <button className="subtle" onClick={() => setMenu("hints")}>
                行き詰まったとき
              </button>
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
                      <SceneDocument id={id} />
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
                    <SceneDocument id={id} />
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
