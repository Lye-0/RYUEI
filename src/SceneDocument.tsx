import { Photo } from "./Photo";
import { CLUES, photo, type Photo as PhotoSpec } from "./data";
const itemCells: Record<string, [string, number]> = {
  brassKey: ["inventory-a", 0],
  archiveKey: ["inventory-a", 1],
  crank: ["inventory-a", 2],
  plate: ["inventory-a", 3],
  lens: ["inventory-b", 0],
  scissors: ["inventory-b", 1],
  bulb: ["inventory-b", 2],
  cable: ["inventory-b", 3],
  handle: ["inventory-c", 0],
  finalPlate: ["inventory-c", 1],
  paper: ["inventory-c", 2],
};
export function itemPortrait(id: string): PhotoSpec {
  if (id === "print") return CLUES.panorama.image;
  if (id === "mask") return CLUES.mask.image;
  if (id === "portrait") return photo("backroom-north");
  const cell = itemCells[id];
  if (cell)
    return {
      ...photo(cell[0]),
      crop: [(cell[1] % 2) * 50, Math.floor(cell[1] / 2) * 50, 50, 50],
    };
  throw new Error("取得物の写真定義がありません: " + id);
}
export function SceneDocument({
  id,
  mounted = false,
}: {
  id: string;
  mounted?: boolean;
}) {
  if (mounted && id === "mirror")
    return (
      <div className="mounted-mirror">
        <Photo
          className="paper-texture"
          asset={{ ...CLUES.mirror.image, crop: [2, 3, 11, 94] }}
        />
        <Photo asset={CLUES.mirror.image} />
      </div>
    );
  if (mounted && id === "bath")
    return (
      <div className="mounted-process">
        {[0, 1, 2, 3].map((i) => (
          <Photo
            key={i}
            asset={{ ...CLUES.bath.image, crop: [i * 25, 15, 25, 70] }}
          />
        ))}
      </div>
    );
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
  return (
    <Photo
      asset={
        mounted && id === "cut"
          ? { ...CLUES[id].image, crop: [6, 5, 87, 89] }
          : CLUES[id].image
      }
      className="document-photo"
      style={
        !mounted && !CLUES[id].image.crop
          ? { backgroundSize: "contain", backgroundPosition: "center" }
          : undefined
      }
    />
  );
}
