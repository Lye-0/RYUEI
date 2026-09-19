import { useState, type CSSProperties } from "react";
import type { Photo as PhotoSpec } from "./data";
import catalog from "./assets.json";
export function Photo({
  asset,
  className = "",
  label = "",
  style = {},
}: {
  asset: PhotoSpec;
  className?: string;
  label?: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const file = (catalog as Record<string, string>)[
    `${asset.sheet}:${asset.tile}`
  ];
  const url = `${import.meta.env.BASE_URL}images/${file}`;
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      className={"photo " + className}
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: asset.crop
          ? `${10000 / asset.crop[2]}% ${10000 / asset.crop[3]}%`
          : "100% 100%",
        backgroundPosition: asset.crop
          ? `${asset.crop[2] === 100 ? 0 : (asset.crop[0] / (100 - asset.crop[2])) * 100}% ${asset.crop[3] === 100 ? 0 : (asset.crop[1] / (100 - asset.crop[3])) * 100}%`
          : undefined,
        transform: asset.mirror ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <img
        className="preload"
        src={url}
        alt=""
        onError={() => setFailed(url)}
        onLoad={() => setFailed(null)}
      />
      {failed === url && (
        <div className="asset-error">
          写真を読み込めませんでした。
          <button onClick={() => location.reload()}>再読み込み</button>
        </div>
      )}
    </div>
  );
}
