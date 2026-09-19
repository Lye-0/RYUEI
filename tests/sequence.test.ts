import { describe, expect, it } from "vitest";
import { PUZZLES } from "../src/data";
import * as E from "../src/engine";

function ready(id: string): E.State {
  const p = PUZZLES[id];
  return { ...E.fresh(), room: p.room, visited: [0, p.room],
    solved: [...(p.requires ?? [])],
    collected: [...(p.items ?? [])], installed: { [id]: [...(p.items ?? [])] } };
}
function press(s: E.State, id: string, button: number) {
  return E.solve(E.input(s, id, E.sequenceInput(s, id, button)), id);
}
for (const id of ["shutters", "beyond"]) {
  describe(id + " continuous input", () => {
    it("recognizes the complete answer after every possible partial attempt, including restored saves", () => {
      const p = PUZZLES[id];
      for (let length = 0; length <= p.answer.length; length++) {
        for (let code = 0; code < p.labels.length ** length; code++) {
          let s = ready(id), digits = code;
          const prefix = [];
          for (let i = 0; i < length; i++) {
            prefix.push(digits % p.labels.length);
            digits = Math.floor(digits / p.labels.length);
          }
          s = E.input(s, id, prefix);
          s = E.parse(JSON.stringify(s))!;
          expect(s).not.toBeNull();
          for (const button of p.answer) s = press(s, id, button);
          expect(s.solved).toContain(id);
        }
      }
    });
    it("does not unlock for an incomplete or incorrect sequence", () => {
      let s = ready(id);
      for (const button of PUZZLES[id].answer.slice(0, -1)) s = press(s, id, button);
      expect(s.solved).not.toContain(id);
      s = press(s, id, 2); // Both correct answers end with a different button.
      expect(s.solved).not.toContain(id);
    });
    it("still requires the existing physical/locking prerequisites", () => {
      let s = { ...E.fresh(), room: PUZZLES[id].room };
      for (const button of PUZZLES[id].answer) s = press(s, id, button);
      expect(s.solved).not.toContain(id);
      expect(E.values(s, id)).toEqual([]);
    });
  });
}
