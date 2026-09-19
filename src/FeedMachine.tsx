import { caseLanding } from "./audio";
import { useState, useId, useEffect, useRef } from "react";
import { Photo } from "./Photo";
import { photo, ITEMS, type Photo as PhotoSpec } from "./data";
const itemPortrait = (id: string) => ({
  ...photo(id === "lens" ? "inventory-b" : "inventory-c"),
  crop:
    id === "lens"
      ? ([0, 0, 50, 50] as [number, number, number, number])
      : ([0, 50, 50, 50] as [number, number, number, number]),
});
import { transportRoute, transportProgress } from "./transport";

type Props = {
  skin?: PhotoSpec;
  calibration?: {
    left: number;
    right: number;
    bottom: number;
    step: number;
    socket: number;
    reset: number;
    lid: number;
  };
  values: number[];
  reverse?: boolean;
  model?: boolean;
  motion?: boolean;
  demonstration?: { reverse: boolean; values: number[] };
  onDemonstration?: (next: { reverse: boolean; values: number[] }) => void;
  active: boolean;
  installed: boolean;
  opened?: boolean;
  reward?: string;
  onAdjust: (i: number) => void;
  onSend: () => void;
  onReset: () => void;
  onInstall?: () => void;
  onDetach?: () => void;
  onOpen?: () => void;
  onTake?: () => void;
};
export function Transport(props: Props) {
  const { values: v, model = false, active, installed, opened = false } = props;
  const calibration = props.calibration ?? {
    left: 24,
    right: 76,
    bottom: 72.3,
    step: 5.4,
    socket: 66,
    reset: 81,
    lid: 43,
  };
  const landingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLanding = () => {
    if (landingTimer.current !== null) clearTimeout(landingTimer.current);
    landingTimer.current = null;
  };
  const [localReverse, setLocalReverse] = useState(!!props.reverse);
  const fromBack = props.demonstration?.reverse ?? localReverse;
  const [turnTick, setTurnTick] = useState<number | null>(null);
  useEffect(() => {
    setTurnTick(null);
    cancelLanding();
    return cancelLanding;
  }, [active]);
  useEffect(() => {
    if (turnTick === null) return;
    const timer = window.setTimeout(() => setTurnTick(null), model ? 780 : 420);
    return () => window.clearTimeout(timer);
  }, [turnTick]);
  const reverse = model ? fromBack : !!props.reverse;
  const [localDemo, setLocalDemo] = useState<number[]>([0, 0]);
  const demo = props.demonstration?.values ?? localDemo;
  const setDemo = (values: number[], direction = fromBack) => {
    setLocalDemo(values);
    setLocalReverse(direction);
    props.onDemonstration?.({ reverse: direction, values });
  };
  const current = model ? demo : v;
  const attempts = Array.from({ length: (current.length - 2) / 2 }, (_, i) =>
    current.slice(2 + i * 2, 4 + i * 2),
  );
  const passed = transportProgress(attempts, reverse);
  const uid = useId().replace(/:/g, "");
  const resetDemo = (direction = fromBack) => {
    cancelLanding();
    setTurnTick(null);
    setDemo([0, 0], direction);
  };
  const adjust = (i: number) => {
    if (model && turnTick !== null) return;
    if (model)
      setDemo(
        demo.length === 8
          ? demo
          : demo.map((n, j) => (j === i ? (n + 1) % 4 : n)),
      );
    else props.onAdjust(i);
  };
  const send = () => {
    if (
      current.length >= 8 ||
      (!model && !installed) ||
      (model && turnTick !== null)
    )
      return;
    setTurnTick(Date.now());
    if (model) {
      setDemo([...demo, demo[0], demo[1]]);
      const arrives =
        transportProgress([...attempts, demo.slice(0, 2)], reverse) === 3;
      if (arrives) {
        const reduced =
          props.motion === false ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        landingTimer.current = setTimeout(
          () => {
            landingTimer.current = null;
            caseLanding();
          },
          reduced ? 0 : 720,
        );
      }
    } else props.onSend();
  };
  return (
    <div
      className={"transport" + (props.skin ? " integrated" : "")}
      data-transport={model ? "model" : reverse ? "reverse" : "forward"}
    >
      <Photo
        asset={
          props.skin ?? {
            ...photo("transport-cabinet"),
            crop: [((opened ? 2 : model ? 1 : 0) * 100) / 3, 0, 100 / 3, 100],
          }
        }
        className="transport-case"
        style={{ transform: reverse && !props.skin ? "scaleX(-1)" : undefined }}
      />
      {model && (
        <svg
          className="transport-inside"
          viewBox="0 0 300 300"
          preserveAspectRatio="none"
          aria-label={
            passed === 3
              ? "ケースが受け取り皿に届いている"
              : "ガラス越しに見える隔壁とケース"
          }
        >
          <defs>
            <filter id={uid + "-grain"} x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".38"
                numOctaves="3"
                seed="7"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="saturate"
                values="0"
                result="mono"
              />
              <feComponentTransfer in="mono" result="subtle">
                <feFuncA type="linear" slope=".22" />
              </feComponentTransfer>
              <feComposite
                in="subtle"
                in2="SourceGraphic"
                operator="in"
                result="grain"
              />
              <feBlend in="SourceGraphic" in2="grain" mode="soft-light" />
            </filter>
            <linearGradient id={uid} x2="1" y2="1">
              <stop stopColor="#d2b375" />
              <stop offset=".5" stopColor="#766039" />
              <stop offset="1" stopColor="#b3965f" />
            </linearGradient>
          </defs>
          <path d="M8 245H292M8 252H292" stroke="#857457" strokeWidth="3" />
          {transportRoute(reverse).map((pair, i) => (
            <g key={i} transform={`translate(${10 + i * 96},30)`}>
              <rect
                width="85"
                height="158"
                rx="2"
                fill={`url(#${uid})`}
                filter={`url(#${uid}-grain)`}
                stroke="#332b1f"
                strokeWidth="4"
              />
              <foreignObject x="2" y="2" width="81" height="154">
                <Photo
                  asset={{
                    ...photo("transport-cabinet"),
                    crop: [5 + i * 2, 12, 20, 30],
                  }}
                  className="partition-metal"
                />
              </foreignObject>
              {pair.map((height, side) => (
                <rect
                  key={side}
                  x={side ? 53 : 12}
                  y={120 - height * 29}
                  width="20"
                  height="19"
                  fill="#0b0c09"
                  stroke="#d8cba7"
                  strokeWidth="2"
                />
              ))}
              <circle cx="7" cy="8" r="3" fill="#28251d" />
              <circle cx="78" cy="150" r="3" fill="#28251d" />
            </g>
          ))}
          <path d="M8 23H292" stroke="#8f7d56" strokeWidth="5" />
          {[0, 1, 2].map((i) => (
            <g key={"mount" + i} stroke="#817453" strokeWidth="4">
              <path d={`M${26 + i * 96} 188V245M${80 + i * 96} 188V245`} />
              <circle cx={26 + i * 96} cy="240" r="4" fill="#b2a07b" />
              <circle cx={80 + i * 96} cy="240" r="4" fill="#b2a07b" />
            </g>
          ))}
          <g
            className="model-carriage"
            style={{
              transform: `translate(${10 + Math.min(passed, 2) * 96}px,30px)`,
            }}
          >
            <rect
              x="4"
              y="-5"
              width="77"
              height="170"
              rx="3"
              fill="#bbc7be"
              fillOpacity=".09"
              stroke="#c7c3a9"
              strokeWidth="2"
            />
            {current.slice(0, 2).map((height, side) => (
              <rect
                key={side}
                x={side ? 55 : 14}
                y={123 - height * 29}
                width="16"
                height="13"
                rx="2"
                fill="#aba695"
                stroke="#ded9c6"
                strokeWidth="2"
              />
            ))}
            <path d="M43 169V185" stroke="#a39b86" strokeWidth="5" />
          </g>
          <g className="model-receiving-tray" aria-hidden="true">
            <path
              d="M226 247L234 238H292L299 247V289H226Z"
              fill="#302a1f"
              stroke="#aa9566"
              strokeWidth="3"
            />
            <path
              d="M231 281H295M229 247H297"
              stroke="#bfae85"
              strokeWidth="3"
            />
            <path d="M270 228V239" stroke="#766a4f" strokeWidth="5" />
          </g>
          <g
            className={"model-cargo" + (passed === 3 ? " delivered" : "")}
            data-passed={passed}
            style={{
              transform: `translate(${passed === 3 ? 241 : 30 + passed * 96}px,${passed === 3 ? 249 : 214}px)`,
            }}
          >
            <rect
              width="50"
              height="31"
              rx="3"
              fill={`url(#${uid})`}
              stroke="#c7b484"
              strokeWidth="2"
            />
            <path d="M3 7H47M7 9V27M43 9V27" stroke="#514831" strokeWidth="2" />
            <rect
              x="20"
              y="4"
              width="10"
              height="8"
              rx="1"
              fill="#6c6045"
              stroke="#b2a078"
            />
          </g>
          <text x="9" y="20" fill="#c6ad76" fontSize="20">
            {reverse ? "∴" : "☾"}
          </text>
          <text x="273" y="20" fill="#c6ad76" fontSize="20">
            {reverse ? "☾" : "∴"}
          </text>
        </svg>
      )}
      {model && active && (
        <>
          <button
            className={
              "transport-end " +
              (reverse && !props.skin ? "end-back" : "end-front")
            }
            aria-label="三日月の端から見本を送る"
            onClick={() => {
              resetDemo(false);
            }}
          />
          <button
            className={
              "transport-end " +
              (reverse && !props.skin ? "end-front" : "end-back")
            }
            aria-label="三つの鋲の端から見本を送る"
            onClick={() => {
              resetDemo(true);
            }}
          />
        </>
      )}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="transport-slider"
          style={{
            left: (i ? calibration.right : calibration.left) + "%",
            top: calibration.bottom - current[i] * calibration.step + "%",
          }}
        >
          <Photo
            className="transport-lever-photo"
            asset={photo("transport-knob")}
          />
          {active && (
            <button
              aria-label={(i ? "右" : "左") + "の案内軸"}
              disabled={model && (turnTick !== null || current.length >= 8)}
              onClick={() => adjust(i)}
            />
          )}
        </div>
      ))}
      {(model || installed) && (
        <div
          className="transport-crank"
          style={{ top: calibration.socket - 1 + "%" }}
        >
          <span
            key={turnTick}
            className={"crank-motion" + (turnTick !== null ? " turning" : "")}
          >
            <Photo
              className="transport-crank-photo"
              asset={photo("transport-crank")}
            />
          </span>
          {active && (
            <button
              aria-label="送りハンドルを回す"
              disabled={model && (turnTick !== null || current.length >= 8)}
              onClick={send}
            />
          )}
        </div>
      )}
      {active && !model && !installed && (
        <button
          className="transport-socket"
          style={{ top: calibration.socket - 3 + "%" }}
          aria-label="送りハンドルを取り付ける"
          onClick={props.onInstall}
        />
      )}
      {active && installed && !model && (
        <button
          className="transport-detach"
          style={{ top: calibration.socket - 2 + "%" }}
          aria-label="送りハンドルを外す"
          onClick={props.onDetach}
        />
      )}
      {active && (
        <button
          className="transport-reset"
          style={{ top: calibration.reset - 4 + "%" }}
          aria-label="送り装置を復帰させる"
          onClick={() => (model ? resetDemo() : props.onReset())}
        />
      )}
      {!model && !opened && active && (
        <button
          className="transport-lid"
          style={{ top: calibration.lid - 4 + "%" }}
          aria-label="取っ手を引く"
          onClick={props.onOpen}
        />
      )}
      {!model && opened && props.reward && (
        <div
          className={
            "transport-reward" +
            (props.reward === "paper" ? " reward-paper" : "")
          }
        >
          <Photo asset={itemPortrait(props.reward)} />
          {active && (
            <button
              aria-label={ITEMS[props.reward].name + "を拾う"}
              onClick={props.onTake}
            />
          )}
        </div>
      )}
    </div>
  );
}
