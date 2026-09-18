import { useState } from "react";
import { photo, type Puzzle } from "./data";
import { Photo } from "./Photo";
export function Controls({
  p,
  v,
  disabled,
  change,
  feed,
}: {
  p: Puzzle;
  v: number[];
  disabled: boolean;
  change: (a: number[]) => void;
  feed: (i: number) => void;
}) {
  const [swap, setSwap] = useState<number | null>(null);
  const choose = (i: number) => {
    if (p.kind === "order") {
      if (swap === null) setSwap(i);
      else {
        const a = [...v];
        [a[swap], a[i]] = [a[i], a[swap]];
        change(a);
        setSwap(null);
      }
    } else if (p.kind === "select") {
      change(v.includes(i) ? v.filter((x) => x !== i) : [...v, i]);
    } else if (p.kind === "map") change([i]);
    else if (p.kind === "sequence" || p.kind === "develop")
      change(v.length === p.answer.length ? [i] : [...v, i]);
    else if (p.kind === "feed") feed(i);
    else change(v.map((n, j) => (j === i ? (n + 1) % (p.size ?? 4) : n)));
  };
  if (p.kind === "order")
    return (
      <fieldset
        disabled={disabled}
        className="photo-controls order-controls"
        aria-label={p.name}
      >
        <div className="print-row">
          {v.map((n, i) => (
            <button
              key={i}
              aria-label={`位置${i + 1}：${p.labels[n]}`}
              aria-pressed={swap === i}
              className={swap === i ? "selected" : ""}
              onClick={() => choose(i)}
            >
              <Photo
                asset={photo("fragments", p.id === "frames" ? n : 4 + n, 4, 4)}
                label={p.labels[n]}
              />
            </button>
          ))}
        </div>
      </fieldset>
    );
  if (p.kind === "rotate")
    return (
      <fieldset
        disabled={disabled}
        className="photo-controls glass-controls"
        aria-label={p.name}
      >
        <div className="glass-stack">
          {v.map((n, i) => (
            <button
              key={i}
              aria-label={`${p.labels[i]}を回す（${n * 90}度）`}
              style={{ transform: `rotate(${n * 90}deg)` }}
              onClick={() => choose(i)}
            >
              <Photo asset={photo("fragments", 12 + i, 4, 4)} />
            </button>
          ))}
        </div>
      </fieldset>
    );
  if (["select", "map"].includes(p.kind))
    return (
      <fieldset
        disabled={disabled}
        className={`photo-controls select-controls ${p.kind === "map" ? "map-controls" : ""}`}
        style={{ gridTemplateColumns: "repeat(3,1fr)" }}
        aria-label={p.name}
      >
        {p.labels.map((label, i) => (
          <button
            key={i}
            aria-label={label}
            aria-pressed={v.includes(i)}
            className={v.includes(i) ? "chosen" : ""}
            onClick={() => choose(i)}
          >
            <span className="focus-label">{label}</span>
          </button>
        ))}
      </fieldset>
    );
  if (p.kind === "feed") {
    const front = [
      [
        [15, 40, 22, 40],
        [2, 37, 32, 23],
        [15, 13, 23, 43],
      ],
      [
        [62, 40, 29, 40],
        [66, 37, 33, 24],
      ],
    ];
    const rear = [
      [
        [34, 2, 23, 41],
        [13, 22, 42, 25],
      ],
      [
        [55, 2, 23, 41],
        [57, 22, 40, 25],
        [55, 26, 23, 38],
      ],
    ];
    return (
      <fieldset
        disabled={disabled}
        className="photo-controls feed-controls"
        aria-label={p.name}
      >
        {p.labels.map((label, i) => {
          const positions = (p.id === "backfeed" ? rear : front)[i];
          const [x, y, w, h] = positions[Math.min(v[i], positions.length - 1)];
          return (
            <button
              key={i}
              aria-label={`${label}を動かす（${v[i]}）`}
              style={{
                left: x + "%",
                top: y + "%",
                width: w + "%",
                height: h + "%",
              }}
              onClick={() => choose(i)}
            >
              <span className="focus-label">{label}</span>
            </button>
          );
        })}
      </fieldset>
    );
  }
  if (p.kind === "settings" && disabled) return null;
  if (p.kind === "settings")
    return (
      <fieldset
        disabled={disabled}
        className="photo-controls knobs-controls"
        aria-label={p.name}
      >
        {p.labels.map((label, i) => (
          <button
            key={i}
            aria-label={`${label}を動かす（${p.choices?.[i]?.[v[i]] ?? v[i]}）`}
            onClick={() => choose(i)}
          >
            <Photo asset={photo("components", v[i], 4, 4)} />
            <span className="focus-label">{label}</span>
          </button>
        ))}
      </fieldset>
    );
  return (
    <fieldset
      disabled={disabled}
      className={
        "photo-controls " +
        (p.kind === "develop" ? "bath-controls" : "sequence-controls")
      }
      aria-label={p.name}
    >
      {p.labels.map((label, i) => (
        <button
          key={i}
          aria-label={label}
          className={v.at(-1) === i ? "last-input" : ""}
          onClick={() => choose(i)}
        >
          <span className="focus-label">{label}</span>
        </button>
      ))}
    </fieldset>
  );
}
