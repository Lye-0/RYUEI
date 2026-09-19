import { useEffect, useRef, useState } from "react";
import { PUZZLES, ROOMS } from "./data";

export function PuzzlePicker({
  value,
  visited,
  onChange,
}: {
  value: string;
  visited: number[];
  onChange: (id: string) => void;
}) {
  const options = Object.values(PUZZLES).filter((p) =>
    visited.includes(p.room),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const current = PUZZLES[value];
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const show = () => {
    setActive(
      Math.max(
        0,
        options.findIndex((p) => p.id === value),
      ),
    );
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    const container = list.current;
    const option = container?.children[active] as HTMLElement | undefined;
    if (open && container && option) {
      if (option.offsetTop < container.scrollTop)
        container.scrollTop = option.offsetTop;
      else if (
        option.offsetTop + option.offsetHeight >
        container.scrollTop + container.clientHeight
      )
        container.scrollTop =
          option.offsetTop + option.offsetHeight - container.clientHeight;
    }
  }, [active, open]);
  return (
    <div className="hint-picker" ref={root}>
      <span id="puzzle-picker-label">調べているもの</span>
      <button
        ref={trigger}
        className="picker-trigger"
        aria-labelledby="puzzle-picker-label puzzle-picker-value"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="puzzle-options"
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
      >
        <span id="puzzle-picker-value">
          <small>{ROOMS[current.room].name}</small>
          {current.name}
        </span>
        <span className="picker-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <div
          id="puzzle-options"
          className="picker-options"
          role="listbox"
          aria-labelledby="puzzle-picker-label"
          aria-activedescendant={"puzzle-option-" + options[active].id}
          tabIndex={0}
          ref={list}
          onBlur={(e) => {
            if (!root.current?.contains(e.relatedTarget)) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              close();
            } else if (
              ["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)
            ) {
              e.preventDefault();
              setActive((i) =>
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? options.length - 1
                    : (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
                      options.length,
              );
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange(options[active].id);
              close();
            }
          }}
        >
          {options.map((p, i) => (
            <div
              key={p.id}
              id={"puzzle-option-" + p.id}
              role="option"
              aria-selected={value === p.id}
              className={"picker-option" + (active === i ? " active" : "")}
              onPointerMove={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(p.id);
                close();
              }}
            >
              <small>{ROOMS[p.room].name}</small>
              <span>{p.name}</span>
              <span className="picker-check" aria-hidden="true">
                {value === p.id ? "✓" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
