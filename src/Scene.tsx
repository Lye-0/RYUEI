import { Transport } from "./FeedMachine";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  CLUES,
  ITEMS,
  PUZZLES,
  ROOMS,
  photo,
  type Node,
  type Photo as PhotoSpec,
  type Rect,
} from "./data";
import * as E from "./engine";
import { Photo } from "./Photo";
import { SceneDocument } from "./SceneDocument";
import catalog from "./assets.json";
import {
  MASTER,
  MECHANISMS,
  CLUE_PLACEMENTS,
  CLUE_SURFACES,
  CUT_SURFACES,
  PROCESS_SURFACES,
  focusRect,
  quad,
  sceneNodes,
  type Quad,
} from "./sceneGeometry";

const box = ([x, y, w, h]: Rect): CSSProperties => ({
  left: x + "%",
  top: y + "%",
  width: w + "%",
  height: h + "%",
});
const has = (id: string) => (catalog as Record<string, string>)[id + ":0"];
function Patch({ id, area }: { id: string; area: Rect }) {
  return has(id) ? (
    <Photo
      asset={photo(id)}
      className="world-photo state-patch"
      style={{
        maskImage: [
          `linear-gradient(to right, transparent ${area[0]}%, black ${area[0] + 0.25}%, black ${area[0] + area[2] - 0.25}%, transparent ${area[0] + area[2]}%)`,
          `linear-gradient(to bottom, transparent ${area[1]}%, black ${area[1] + 0.25}%, black ${area[1] + area[3] - 0.25}%, transparent ${area[1] + area[3]}%)`,
        ].join(","),
        maskComposite: "intersect",
        clipPath: `inset(${area[1]}% ${100 - area[0] - area[2]}% ${100 - area[1] - area[3]}% ${area[0]}%)`,
      }}
    />
  ) : null;
}
function Surface({
  q,
  width,
  children,
  mounted = false,
}: {
  q: Quad;
  width: number;
  children: ReactNode;
  mounted?: boolean;
}) {
  const [p0, p1, p2, p3] = q.map((p) => p.map((n) => n / 100));
  const dx1 = p1[0] - p2[0],
    dx2 = p3[0] - p2[0],
    dx3 = p0[0] - p1[0] + p2[0] - p3[0];
  const dy1 = p1[1] - p2[1],
    dy2 = p3[1] - p2[1],
    dy3 = p0[1] - p1[1] + p2[1] - p3[1];
  const det = dx1 * dy2 - dx2 * dy1;
  const g = det ? (dx3 * dy2 - dx2 * dy3) / det : 0,
    h = det ? (dx1 * dy3 - dx3 * dy1) / det : 0;
  const a = p1[0] - p0[0] + g * p1[0],
    b = p3[0] - p0[0] + h * p3[0],
    d = p1[1] - p0[1] + g * p1[1],
    e = p3[1] - p0[1] + h * p3[1];
  return (
    <div
      className={"world-surface" + (mounted ? " mounted-document" : "")}
      style={{
        filter: mounted
          ? `sepia(.28) saturate(.6) brightness(.86) contrast(.88) blur(${(width * 0.00055) / Math.max(0.04, Math.abs(p1[0] - p0[0]))}px)`
          : undefined,
        transform: `matrix3d(${a},${d},0,${g / width},${b},${e},0,${h / width},0,0,1,0,${width * p0[0]},${width * p0[1]},0,1)`,
      }}
    >
      {children}
    </div>
  );
}
function Target({
  r,
  label,
  click,
  pressed = false,
  kind = "object",
}: {
  r: Rect;
  label: string;
  click: () => void;
  pressed?: boolean;
  kind?: string;
}) {
  return (
    <button
      className={"world-target " + kind + (pressed ? " engaged" : "")}
      style={box(r)}
      aria-label={label}
      aria-pressed={pressed || undefined}
      onClick={click}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M1 1H99V99H1Z" vectorEffect="non-scaling-stroke" />
      </svg>
    </button>
  );
}
function Lever({
  asset,
  r,
  pivot,
  angle,
}: {
  asset: PhotoSpec;
  r: Rect;
  pivot: [number, number];
  angle: number;
}) {
  const id = "lever-" + asset.sheet + "-" + r[0];
  const down = asset.sheet === "gallery-west";
  return (
    <div
      className="lever-sprite"
      style={{
        ...box(r),
        transformOrigin: pivot[0] + "% " + pivot[1] + "%",
        transform: "rotate(" + angle + "deg)",
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <clipPath id={id}>
            {down ? (
              <>
                <ellipse cx="40" cy="20" rx="30" ry="15" />
                <polygon points="34,23 44,20 77,83 64,85" />
                <ellipse cx="70" cy="84" rx="24" ry="13" />
              </>
            ) : (
              <>
                <ellipse cx="50" cy="11" rx="43" ry="10" />
                <rect x="42" y="15" width="16" height="79" />
                <ellipse cx="50" cy="94" rx="32" ry="6" />
              </>
            )}
          </clipPath>
        </defs>
        <foreignObject width="100" height="100" clipPath={"url(#" + id + ")"}>
          <Photo
            asset={{ ...asset, crop: r }}
            style={{ height: "100%", width: "100%" }}
          />
        </foreignObject>
      </svg>
    </div>
  );
}
export type SceneFocus = {
  type: "puzzle" | "clue" | "door" | "detail";
  id?: string;
  to?: number;
  text?: string;
} | null;
export function Scene({
  s,
  focus,
  selected,
  marks,
  touch,
  update,
  notify,
  travel,
}: {
  s: E.State;
  focus: SceneFocus;
  selected: string | null;
  marks: boolean;
  touch: (n: Node) => void;
  update: (next: E.State) => void;
  notify: (text: string) => void;
  travel: (to: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(800),
    [swap, setSwap] = useState<number | null>(null);
  const boltSerial = useRef(0);
  const [boltMotion, setBoltMotion] = useState<{
    index: number;
    serial: number;
  } | null>(null);
  // Motion belongs to the click, never to saved input or mounting a viewpoint.
  useLayoutEffect(() => {
    setBoltMotion(null);
  }, [s.room, s.face, focus?.type, focus?.id]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const nodes = sceneNodes(s.room, s.face),
    focused = nodes.find(
      (n) =>
        focus?.type === n.type &&
        (n.target === focus.id ||
          (n.type === "door" && Number(n.target) === focus.to)),
    );
  const mech = focus?.type === "puzzle" ? MECHANISMS[focus.id!] : null;
  const crop = mech
    ? focusRect(mech.focus)
    : focused
      ? focused.target === "model"
        ? [48.8, 31.5, 25, 25]
        : focused.target === "old"
          ? [45, 0, 24, 24]
          : focusRect(focused.rect, focused.type === "clue" ? 28 : 0)
      : [0, 0, 100, 100];
  const key = `${s.room}:${s.face}`,
    master = MASTER[key];
  const studioLight = s.installed.shutters?.includes("cable")
    ? s.values.shutters?.at(-1)
    : undefined;
  const lightPhoto =
    studioLight === undefined
      ? null
      : "studio-light-" + ["left", "top", "right"][studioLight];
  const active = Object.entries(MECHANISMS).filter(
    ([, m]) => m.room === s.room && m.face === s.face,
  );
  useEffect(() => {
    const prefix = ROOMS[s.room].id;
    for (const [id, file] of Object.entries(catalog)) {
      if (
        id.startsWith(prefix + "-") ||
        (s.room === 2 && id.startsWith("lamp-pose")) ||
        (s.room === 4 && id.startsWith("camera-view"))
      ) {
        const image = new Image();
        image.src = import.meta.env.BASE_URL + "images/" + file;
      }
    }
  }, [s.room]);
  function change(id: string, v: number[]) {
    const next = E.input(s, id, v);
    let solved = E.solve(next, id);
    if (
      ["develop", "print", "cut", "masks"].includes(id) &&
      solved.solved.includes(id)
    )
      solved = E.open(solved, id);
    update(solved);
    if (solved.solved.length > next.solved.length) notify("カチリ。");
  }
  function act(id: string, i: number) {
    const p = PUZZLES[id],
      v = E.values(s, id);
    if (!E.available(s, id)) {
      notify("動かない。");
      return;
    }
    if (id === "beyond" && !s.solved.includes(id)) {
      setBoltMotion({ index: i, serial: ++boltSerial.current });
    }
    if (p.kind === "order") {
      if (swap === null) setSwap(i);
      else {
        const n = [...v];
        [n[swap], n[i]] = [n[i], n[swap]];
        setSwap(null);
        change(id, n);
      }
      return;
    }
    if (p.kind === "select")
      change(id, v.includes(i) ? v.filter((x) => x !== i) : [...v, i]);
    else if (p.kind === "feed") change(id, E.feedStep(s, id, i));
    else if (p.kind === "sequence" || p.kind === "develop")
      change(id, v.length >= p.answer.length ? [i] : [...v, i]);
    else if (p.kind === "map") {
      notify("巻き上げ軸は、まだ固定されている。");
    } else
      change(
        id,
        v.map((n, j) => (j === i ? (n + 1) % (p.size ?? 4) : n)),
      );
  }
  function open(id: string) {
    if (id === "wall") {
      const next = E.solve(E.input(s, id, [1]), id);
      if (next.solved.includes(id)) update(E.open(next, id));
      else
        notify(
          s.installed.wall?.includes("handle")
            ? "軸がまだ動かない。"
            : "六角形の軸が突き出ている。",
        );
      return;
    }
    if (id === "beyond" && s.opened.includes(id)) {
      update(E.finish(s));
      return;
    }
    if (!s.solved.includes(id) && id !== "lamp") {
      notify("留まっている。");
      return;
    }
    update(E.open(s, id));
    if (["feed", "backfeed"].includes(id) && s.installed[id]?.includes("crank"))
      notify("送りハンドルを外して手元に戻した。");
  }
  function install(id: string, item: string) {
    if (selected && PUZZLES[id].items?.includes(selected)) item = selected;
    if (selected !== item) {
      notify("ここに何か取り付けられそうだ。");
      return;
    }
    const next = E.install(s, id, item);
    update(next);
    notify(
      item === "crank"
        ? "四角い軸が差し込み口に収まった。"
        : ITEMS[item].reusable
          ? "手応えがあった。"
          : "取り付いた。",
    );
  }
  const documents = nodes
    .filter(
      (n) =>
        n.type === "clue" &&
        n.target !== "model" &&
        n.target !== "memory" &&
        n.target !== "shutter" &&
        !CLUES[n.target].requires?.some((x) => !s.solved.includes(x)),
    )
    .map((n) => (
      <Surface
        key={n.id}
        q={CLUE_SURFACES[key + ":" + n.target] ?? quad(n.rect)}
        width={width}
        mounted
      >
        <SceneDocument id={n.target} mounted />
      </Surface>
    ));
  return (
    <div ref={ref} className={"scene-camera " + (marks ? "show-targets" : "")}>
      <div
        className="scene-world"
        key={`${s.room}:${s.face}:${focus?.type ?? "room"}:${focus?.id ?? focus?.to ?? ""}`}
        style={
          {
            transform: `matrix(${100 / crop[2]}, 0, 0, ${100 / crop[2]}, ${(-width * crop[0]) / crop[2]}, ${(-width * crop[1]) / crop[2]})`,
          } as CSSProperties
        }
      >
        <Photo
          asset={
            s.room === 4 && s.face === 0 && lightPhoto
              ? photo(lightPhoto)
              : master
                ? photo(master)
                : photo(ROOMS[s.room].id, s.face)
          }
          className="world-photo"
        />
        {s.room === 1 && s.face === 0 && s.openDoors.includes("studio") && (
          <Patch
            id={
              s.opened.includes("wall")
                ? "gallery-studio-revealed"
                : "gallery-studio-open-v2"
            }
            area={[20, 0, 65, 86]}
          />
        )}
        {s.room === 4 && s.face === 2 && s.openDoors.includes("studio") && (
          <Patch id="studio-gallery-open" area={[24, 5, 48, 90]} />
        )}
        {s.room === 3 && s.face === 2 && s.openDoors.includes("darkroom") && (
          <Patch id="darkroom-gallery-open-v2" area={[27, 3, 45, 90]} />
        )}
        {s.room === 0 && s.face === 0 && s.openDoors.includes("gallery") && (
          <Patch id="reception-door-open" area={[64, 0, 36, 78]} />
        )}
        {s.room === 5 && s.face === 0 && s.opened.includes("beyond") && (
          <Patch id="backroom-door-open" area={[31, 0, 50, 86]} />
        )}
        {s.room === 1 && s.face === 3 && s.openDoors.includes("darkroom") && (
          <Patch id="gallery-door-open" area={[5, 4, 36, 83]} />
        )}
        {key === "1:1" && (
          <Patch id="gallery-retouch-entry" area={[75, 0, 25, 100]} />
        )}
        {key === "1:1" && documents}
        {key === "1:3" && (
          <Patch
            id={
              s.opened.includes("feed")
                ? "gallery-transport-open"
                : "gallery-transport-mounted"
            }
            area={[68, 22, 28, 37]}
          />
        )}
        {key === "5:0" && (
          <Patch
            id={
              s.opened.includes("backfeed")
                ? "backroom-transport-open"
                : "backroom-transport-mounted"
            }
            area={[83, 12, 15, 38]}
          />
        )}
        {active.map(([id, m]) => {
          const p = PUZZLES[id],
            v = E.values(s, id),
            opened = s.opened.includes(id),
            solved = s.solved.includes(id),
            zoom = focus?.type === "puzzle" && focus.id === id;
          if (p.kind === "feed")
            return (
              <div key={id} className="mechanism-layer" data-mechanism={id}>
                <div style={{ position: "absolute", ...box(m.bounds) }}>
                  <Transport
                    skin={{
                      ...photo(
                        (id === "feed" ? "gallery" : "backroom") +
                          (opened ? "-transport-open" : "-transport-mounted"),
                      ),
                      crop: m.bounds,
                    }}
                    calibration={
                      id === "feed"
                        ? {
                            left: 26.5,
                            right: 76.5,
                            bottom: 77,
                            step: 5.5,
                            socket: 70.5,
                            reset: 87,
                            lid: 44.5,
                          }
                        : {
                            left: 23,
                            right: 78,
                            bottom: 81.7,
                            step: 6.2,
                            socket: 74.4,
                            reset: 92.3,
                            lid: 46.8,
                          }
                    }
                    values={v}
                    active={zoom}
                    reverse={id === "backfeed"}
                    installed={!!s.installed[id]?.includes("crank")}
                    opened={opened}
                    reward={
                      opened && !s.collected.includes(p.rewards![0])
                        ? p.rewards![0]
                        : undefined
                    }
                    onAdjust={(i) =>
                      update(E.input(s, id, E.feedStep(s, id, i)))
                    }
                    onSend={() => {
                      const next = E.advanceFeed(s, id);
                      update(next);
                      if (E.values(next, id).length === 8)
                        notify(
                          next.solved.includes(id)
                            ? "ケースが届いた。"
                            : "空回りする音がして、止まった。",
                        );
                    }}
                    onReset={() => update(E.resetFeed(s, id))}
                    onInstall={() => install(id, "crank")}
                    onDetach={() => update(E.detachCrank(s, id))}
                    onOpen={() => open(id)}
                    onTake={() => update(E.take(s, id, p.rewards![0]))}
                  />
                </div>
              </div>
            );
          return (
            <div key={id} className="mechanism-layer" data-mechanism={id}>
              {id === "panel" &&
                !opened &&
                v.map((i) => (
                  <Patch
                    key={i}
                    id="reception-unlatched"
                    area={
                      [
                        [23, 44, 12, 13],
                        [25, 59, 16, 13],
                        [23, 74, 12, 13],
                      ][i] as Rect
                    }
                  />
                ))}
              {id === "lamp" && (
                <Patch
                  id={
                    s.installed.lamp?.includes("bulb")
                      ? [
                          "retouch-lamp-on",
                          "lamp-pose-1-1",
                          "retouch-lamp-low",
                        ][v[0]]
                      : "retouch-lamp-socket"
                  }
                  area={[8, 17, 43, 41]}
                />
              )}
              {id === "shutters" && s.installed.shutters?.includes("cable") && (
                <Patch id="studio-shutters-cable" area={[9, 44, 10, 10]} />
              )}
              {id === "wall" && s.installed.wall?.includes("handle") && (
                <Patch id="studio-wheel" area={[77, 39, 13, 14]} />
              )}
              {opened && m.state && (
                <Patch
                  id={
                    m.state +
                    (id === "develop" ||
                    (p.rewards?.length &&
                      p.rewards.every((item) => s.collected.includes(item)))
                      ? "-empty"
                      : "-open")
                  }
                  area={m.patch!}
                />
              )}
              {opened &&
                m.state &&
                id !== "develop" &&
                !p.rewards?.every((item) => s.collected.includes(item)) &&
                p.rewards?.map(
                  (item, i) =>
                    s.collected.includes(item) && (
                      <Patch
                        key={item}
                        id={m.state + "-empty"}
                        area={m.pickups?.[i] ?? m.patch!}
                      />
                    ),
                )}
              {p.kind === "order" &&
                (!p.items || s.installed[id]?.length) &&
                m.controls.map((r, i) => (
                  <Surface key={i} q={quad(r)} width={width} mounted>
                    <Photo
                      className={zoom && swap === i ? "held-print" : ""}
                      asset={
                        id === "frames"
                          ? photo("fragments", v[i])
                          : {
                              ...CLUES.panorama.image,
                              crop: [[2, 1, 3, 0][v[i]] * 25, 0, 25, 100],
                            }
                      }
                    />
                  </Surface>
                ))}
              {id === "camera" && s.installed.camera?.includes("lens") && (
                <Surface q={m.surfaces![0]} width={width} mounted>
                  <Photo
                    asset={
                      s.opened.includes("wall")
                        ? {
                            ...photo("studio-curtain-open"),
                            crop: [43, 20, 25, 63],
                          }
                        : photo("camera-view-" + v[0])
                    }
                    style={{
                      filter: `blur(${v[1] === 1 ? 0 : 12}px)`,
                      transform: `translateY(${v[2] * 5}%)`,
                    }}
                  />
                </Surface>
              )}
              {id === "masks" &&
                s.installed.masks?.includes("mask") &&
                m.surfaces!.map((q, i) => (
                  <Surface key={i} q={q} width={width} mounted>
                    <Photo
                      asset={{
                        ...photo("glass-triptych"),
                        crop: [(i * 100) / 3 + 1, 4, 100 / 3 - 2, 91],
                      }}
                      style={{ transform: `rotate(${v[i] * 90}deg)` }}
                    />
                  </Surface>
                ))}
              {((id === "develop" && !opened) || id === "print") &&
                s.installed[id]?.length &&
                !s.collected.includes(
                  id === "develop" ? "print" : "portrait",
                ) &&
                (() => {
                  const target = v.at(-1) ?? (id === "develop" ? 1 : 0);
                  return (
                    <Surface
                      q={PROCESS_SURFACES[id][target]}
                      width={width}
                      mounted
                    >
                      <div
                        className={
                          "processing-paper " + (solved ? "processed" : "")
                        }
                      >
                        <Photo
                          asset={
                            id === "develop"
                              ? CLUES.panorama.image
                              : photo("backroom-north")
                          }
                          style={{
                            opacity: solved ? 1 : Math.min(0.7, v.length * 0.2),
                          }}
                        />
                      </div>
                    </Surface>
                  );
                })()}
              {id === "shutters" && v.length > 0 && (
                <div
                  className="lamp-selected"
                  style={{ ...box(m.controls[v.at(-1)!]), borderRadius: "50%" }}
                />
              )}
              {id === "beyond" && zoom && boltMotion && !opened && (
                <div
                  key={boltMotion.serial}
                  className="bolt-shift"
                  onAnimationEnd={() =>
                    setBoltMotion((current) =>
                      current?.serial === boltMotion.serial ? null : current,
                    )
                  }
                  style={box(m.controls[boltMotion.index])}
                >
                  <Photo
                    asset={{
                      ...photo("backroom-north"),
                      crop: m.controls[boltMotion.index],
                    }}
                  />
                </div>
              )}
              {id === "develop" && opened && !s.collected.includes("print") && (
                <Surface
                  q={[
                    [40.5, 72],
                    [57.5, 74.2],
                    [55.1, 79.5],
                    [37, 78],
                  ]}
                  width={width}
                >
                  <div className="developed-print">
                    <Photo asset={CLUES.panorama.image} />
                  </div>
                </Surface>
              )}
              {id === "cut" &&
                v.map((i) => (
                  <Surface key={i} q={CUT_SURFACES[i]} width={width}>
                    <Photo
                      asset={{ ...CLUES.cut.image, crop: [39, 15, 20, 22] }}
                    />
                  </Surface>
                ))}
              {id === "cut" &&
                opened &&
                !s.collected.includes("mask") &&
                p.answer.map((cell, i) => (
                  <Surface key={i} q={CUT_SURFACES[cell]} width={width} mounted>
                    <Photo
                      asset={{
                        ...photo("glass-triptych"),
                        crop: [(i * 100) / 3 + 1, 4, 100 / 3 - 2, 91],
                      }}
                    />
                  </Surface>
                ))}
              {id === "rack" &&
                v.map((i) => (
                  <Patch
                    key={i}
                    id="retouch-rack-pressed"
                    area={m.controls[i]}
                  />
                ))}
              {zoom &&
                !solved &&
                (!opened || id === "lamp") &&
                id !== "wall" &&
                m.controls.map((base, i) => {
                  const r: Rect =
                    id === "lamp"
                      ? ([
                          [20, 24, 26, 13],
                          [20, 31, 26, 11],
                          [15, 33, 20, 15],
                        ][v[0]] as Rect)
                      : id === "feed"
                        ? i === 0
                          ? v[0] === 0
                            ? [73, 44, 5, 9]
                            : v[0] === 1
                              ? [67, 43, 10, 5]
                              : [73, 37, 5, 10]
                          : v[1]
                            ? [88, 43, 10, 5]
                            : [87, 44, 6, 9]
                        : id === "backfeed"
                          ? i === 1
                            ? v[1] === 0
                              ? [92, 13, 4, 13]
                              : v[1] === 1
                                ? [82, 22, 14, 5]
                                : [92, 24, 4, 13]
                            : v[0]
                              ? [78, 22, 13, 4]
                              : [87, 13, 4, 13]
                          : id === "panel" && v.includes(i)
                            ? [26.5, i === 0 ? 46 : i === 1 ? 60 : 75, 4, 9]
                            : base;
                  return (
                    <Target
                      key={i}
                      r={r}
                      label={
                        p.kind === "order"
                          ? "位置" + (i + 1) + "：" + p.labels[v[i]]
                          : (p.labels[i] ?? p.name)
                      }
                      kind="control"
                      pressed={
                        p.kind === "order"
                          ? swap === i
                          : p.kind === "select"
                            ? v.includes(i)
                            : false
                      }
                      click={() => act(id, i)}
                    />
                  );
                })}
              {zoom &&
                (!opened || id === "lamp") &&
                p.items?.map(
                  (item, i) =>
                    !s.installed[id]?.includes(item) &&
                    (id !== "print" ||
                      item ===
                        (selected && p.items?.includes(selected)
                          ? selected
                          : p.items?.find(
                              (x) => !s.installed[id]?.includes(x),
                            ))) && (
                      <Target
                        key={item}
                        r={m.fittings?.[i] ?? m.bounds}
                        label={ITEMS[item].name + "を取り付ける"}
                        kind="fitting"
                        click={() => install(id, item)}
                      />
                    ),
                )}
              {zoom && (!opened || id === "beyond") && (
                <Target
                  r={m.open}
                  label={
                    id === "wall"
                      ? "幕を巻き上げる"
                      : id === "beyond"
                        ? opened
                          ? "外へ進む"
                          : "搬出口を開く"
                        : "取っ手を引く"
                  }
                  kind="handle"
                  click={() => open(id)}
                />
              )}
              {zoom &&
                opened &&
                p.rewards?.map(
                  (item, i) =>
                    !s.collected.includes(item) && (
                      <Target
                        key={item}
                        r={m.pickups?.[i] ?? m.open}
                        label={ITEMS[item].name + "を拾う"}
                        click={() => {
                          update(E.take(s, id, item));
                          notify(ITEMS[item].name + "を手に取った。");
                        }}
                      />
                    ),
                )}
            </div>
          );
        })}
        {key !== "1:1" && documents}
        {key === "4:1" &&
          [0, 1, 2, 3, 4].map((i) => (
            <Surface
              key={"light-" + i}
              q={quad([26.5, 12 + i * 9.5, 7, 6.8])}
              mounted
              width={width}
            >
              <Photo
                asset={{
                  ...CLUES.shutter.image,
                  crop: [i * 20 + 1, 31, 18.8, 48],
                }}
              />
            </Surface>
          ))}
        {key === "2:0" && (
          <Patch id="retouch-transport-mounted" area={[47.5, 30.5, 24, 25]} />
        )}
        {key === "2:0" && (
          <div
            style={{ position: "absolute", ...box([54.5, 32.8, 13.3, 21.6]) }}
          >
            <Transport
              skin={{
                ...photo("retouch-transport-mounted"),
                crop: [54.5, 32.8, 13.3, 21.6],
              }}
              calibration={{
                left: 23,
                right: 77,
                bottom: 82,
                step: 7,
                socket: 68,
                reset: 81,
                lid: 43,
              }}
              model
              values={[0, 0]}
              active={focus?.id === "model"}
              installed
              onAdjust={() => {}}
              onSend={() => {}}
              onReset={() => {}}
            />
          </div>
        )}
        {!focus &&
          nodes
            .filter(
              (n) =>
                !(
                  n.type === "door" &&
                  n.requires &&
                  !s.opened.includes(n.requires)
                ),
            )
            .map((n) => (
              <Target
                key={n.type + n.id}
                r={
                  n.target === "wall" && s.opened.includes("wall")
                    ? MECHANISMS.wall.open
                    : n.rect
                }
                label={n.label}
                click={() => touch(n)}
              />
            ))}
        {focus?.type === "door" && focused && (
          <Target
            r={focused.rect}
            label={
              E.doorRequirement(s, focus.to!)
                ? "鍵を使う"
                : E.doorIsOpen(s, focus.to!)
                  ? "進む"
                  : "扉を開く"
            }
            click={() => travel(focus.to!)}
          />
        )}
        {focus?.type === "clue" &&
          focused &&
          focus.id !== "model" &&
          focus.id !== "memory" && (
            <Target
              r={focused.rect}
              label="写真を手に取る"
              click={() => touch({ ...focused, type: "take" })}
            />
          )}
        {s.room === 4 && studioLight !== undefined && (
          <div
            className="studio-light-spill"
            data-light={studioLight}
            data-face={s.face}
            style={{
              opacity: s.face === 0 ? 0.12 : 0.32,
              background:
                studioLight === 1
                  ? "linear-gradient(180deg, rgba(255,227,169,.65), transparent 72%)"
                  : `linear-gradient(${(studioLight === 0 ? 90 : 270) + s.face * 90}deg, rgba(255,215,145,.65), transparent 50%, rgba(0,0,0,.5))`,
            }}
          />
        )}
        {focus?.id === "wall" && s.opened.includes("wall") && (
          <Target
            r={[36, 20, 35, 54]}
            label="裏室へ進む"
            click={() => travel(5)}
          />
        )}
      </div>
    </div>
  );
}
