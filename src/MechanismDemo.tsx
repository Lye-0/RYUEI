import { useState } from "react";
import { Photo } from "./Photo";
import { photo } from "./data";
import { tick } from "./audio";

/** The visible mechanism is a safe experiment; it never changes puzzle progress. */
export function MechanismDemo() {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [message, setMessage] = useState("二本の軸を動かして、爪を見る。");
  const tile = left === 2 && right === 1 ? 3 : left;
  function moveLeft() {
    const next = (left + 1) % 3;
    setLeft(next);
    setRight(0);
    setMessage(
      next === 2
        ? "左の爪がケースから離れた。"
        : "左の爪は、まだ縁にかかっている。",
    );
    tick();
  }
  function moveRight() {
    if (left < 2) {
      setMessage("右の軸は、左の爪に阻まれている。");
      return;
    }
    setRight(1 - right);
    setMessage(
      right === 0
        ? "両側の爪が離れ、ケースが浮いた。"
        : "右の爪が、もう一度かかった。",
    );
    tick();
  }
  return (
    <>
      <Photo asset={photo("demo", tile, 2, 2)} className="scene-image" />
      <button
        className="demo-lever demo-left"
        aria-label="見本の左軸を動かす"
        onClick={moveLeft}
      >
        <span>左軸</span>
      </button>
      <button
        className="demo-lever demo-right"
        aria-label="見本の右軸を動かす"
        onClick={moveRight}
      >
        <span>右軸</span>
      </button>
      <div className="demo-caption" role="status">
        <span>{message}</span>
        <button
          onClick={() => {
            setLeft(0);
            setRight(0);
            setMessage("二本の軸を動かして、爪を見る。");
          }}
        >
          見本を戻す
        </button>
      </div>
    </>
  );
}
