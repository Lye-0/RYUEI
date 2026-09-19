import { Photo } from "./Photo";
import { CLUES, PUZZLES, photo, type Photo as PhotoSpec } from "./data";
import { MECHANISMS } from "./sceneGeometry";
export function itemPortrait(id: string): PhotoSpec {
  if (id === "print") return CLUES.panorama.image;
  if (id === "mask") return CLUES.mask.image;
  if (id === "portrait") return photo("backroom-north");
  const p = Object.values(PUZZLES).find((p) => p.rewards?.includes(id));
  const m = p ? MECHANISMS[p.id] : null;
  if (p && m?.state && m.pickups) {
    const r = m.pickups[p.rewards!.indexOf(id)];
    if (r) {
      const size = Math.max(r[2], r[3]) * 1.4;
      return {
        ...photo(m.state + "-open"),
        crop: [
          Math.max(0, r[0] + r[2] / 2 - size / 2),
          Math.max(0, r[1] + r[3] / 2 - size / 2),
          size,
          size,
        ],
      };
    }
  }
  throw new Error("取得物の写真定義がありません: " + id);
}
export function SceneDocument({
  id,
  mounted = false,
}: {
  id: string;
  mounted?: boolean;
}) {
  if (id === "shutter")
    return (
      <div className="light-sheet">
        {[0, 1, 2, 3, 4].map((i) => (
          <Photo
            key={i}
            asset={{ ...CLUES.shutter.image, crop: [i * 20 + 1, 31, 18.8, 48] }}
          />
        ))}
      </div>
    );
  if (id === "history")
    return (
      <div className="history-sheet">
        {[1, 3, 0, 2].map((n) => (
          <Photo key={n} asset={photo("fragments", n)} />
        ))}
      </div>
    );
  return (
    <Photo
      asset={CLUES[id].image}
      className="document-photo"
      style={
        !mounted && !CLUES[id].image.crop
          ? { backgroundSize: "contain", backgroundPosition: "center" }
          : undefined
      }
    />
  );
}
