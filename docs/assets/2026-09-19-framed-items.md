# 額・取得物の生成指示（2026-09-19）

使用: 組み込みimage_gen。API/CLIは使用していない。生成PNGは調査領域、採用WebPのみpublic/imagesへ保存。単体アイテムは各シートの四分割をCSSで切り出し、物が隣の区画へ出ないことを確認。

## 採用先

- clues/a/framed-history.webp: 四枚の写真を含む額。元の四枚を参照し、無傷・座面破れ・花瓶破損・座面修理の差を保持。
- clues/a/shadow-study.webp: 二つの光源位置と影が写る額。旧版を置換。
- clues/architecture/layout-plan.webp: 同じ9区画と3種類の窓を持つ額入り配置図。旧版を置換。
- items/keys-and-case.webp: 左上は廊下の鍵、右上は赤い糸の鍵、左下は送りハンドル、右下は乾板ケース。
- items/optics-and-tools.webp: 左上はレンズ、右上は鋏、左下は電球、右下はレリーズ。鋏が隣の区画へ出た初稿は不採用。
- items/wheel-and-paper.webp: 左上は五本スポークのハンドル、右上は乾板、左下は印画紙。右下は未使用。

## Framed history

Create a photorealistic straight-on museum documentation photograph of one antique framed contact sheet, portrait aspect ratio 4:5, highest detail. The four supplied reference photographs MUST be faithfully mounted in a 2 by 2 grid, reference 1 top left, reference 2 top right, reference 3 bottom left, reference 4 bottom right. Preserve the crucial differences: first intact woven chair seat and intact blue vase; second a large torn hole in the seat and intact vase; third torn seat and broken blue vase on floor; fourth patched seat and broken vase. Preserve same chair and lighting in each print. Make it a SINGLE convincing physical object: narrow dark walnut aged wooden frame with subtle brass inner bead, realistic recessed aged warm cream paper mat with precisely aligned four apertures and contact shadows. Crisp but naturally aged photographs, no digital blurring, no floating pasted images, no caption or text. Front-facing rectangle exactly aligned image axes. Frame reaches all four image edges, no wall outside the frame. Same warm subdued vintage studio atmosphere, fine woodgrain, clean readable puzzle details. Output one image, not mockup.

## Framed shadows

Edit reference into a highest-detail photorealistic front-facing portrait 4:5 photograph of a single framed antique photographic diptych. Preserve EXACT visual clue of reference: two side-by-side photos of same ornate wooden upholstered chair, left image tall lamp on right casts chair shadow to left, right image low lamp on left casts a long chair shadow to right. Clearly readable light and shadow directions. Preserve chair shape, floor and photograph composition. Mount these two photos as one contact sheet in a narrow dark walnut vintage wood frame with subtle brass inner bead and recessed aged cream mat. Realistic contact shadows inside mat, continuous warm subdued lighting, natural photographic grain, no digital blur. Frame fills output to all four edges, axis-aligned straight-on no perspective, no wall outside. One cohesive physical framed photograph, NOT a screen/UI mockup. No lettering, symbols, captions or new objects.

## Framed map

Make a high-resolution photorealistic front-facing photograph of this exact antique floorplan mounted in a thin dark walnut wooden frame, portrait 2:3. Preserve the diagram EXACTLY: 3 by 3 rooms; top windows left circular, center tall arched, right rectangular. Middle rooms left three photographic developing trays, center chair and bellows camera, right chemistry workbench. Bottom rooms left reception counter, center portrait gallery, right empty room with door. Preserve all partitions and door openings. No new lettering. One single aged cream sheet, NOT a stack or second sheet at bottom. Fine paper fibers, aged edges, faint glass reflection that does not obscure marks, authentic recessed paper mat and contact shadows. Narrow frame aligned to all four output edges, no wall or other background outside the frame. Crisp legible drawing, subtle warm vintage light, no blur, no digital overlay look.

## Inventory A

Create ONE square high-resolution 2048x2048 game inventory atlas with exactly FOUR separate photographed objects on identical seamless very dark charcoal background, arranged exact 2x2 equal square cells. Each isolated object occupies center 65% of its own cell with large empty margins, no borders or labels, absolutely NO drawers, rooms, cabinets, shelves, hands, or other scenery. Warm soft photorealistic lighting, crisp old metal/wood texture. Match collectible shapes from reference photos, NOT their furniture: TOP LEFT long antique brass skeleton key with trefoil rounded bow and small square bit (reference1); TOP RIGHT smaller brass key with round/heart bow and RED THREAD TASSel (reference2); BOTTOM LEFT L-shaped short steel crank with long dark turned wooden grip and square shaft (reference3 left drawer); BOTTOM RIGHT thin closed rectangular black leather photographic dry-plate case, small central brass clasp (reference3 right drawer). All four independent objects fully visible, no overlap between cells. Unified eye-level slightly overhead product photography, realistic shadows disappearing into background. Not icons, not illustrations.

## Inventory B

ONE square high-resolution 2048x2048 photographic inventory atlas, exact 2x2 equal square cells with FOUR isolated real objects. Uniform seamless very dark charcoal background. Each object centered in its own cell with generous 18% margins, warm diffuse light, sharp authentic antique patina. No grid lines, no labels, no text, no drawers, furniture, rooms, hands or compartments. Match objects in references: TOP LEFT antique camera lens, small cylindrical tarnished brass mount with dark convex glass seen from slight angle (lens in reference1 hatch); TOP RIGHT long closed antique tailor shears, dark steel, two oval handles at right, brass pivot, sharp blades left (reference2 drawer); BOTTOM LEFT clear incandescent lightbulb with brass screw base (reference3 drawer); BOTTOM RIGHT coiled thin black shutter-release cable with small brass plunger end (reference4 drawer). Preserve their shapes and materials, but photograph each already picked up and isolated. Four cells contain one object each, no crossing cell boundaries.

Final correction:
Precise inventory atlas correction. Preserve this image and all four objects, same exact 2x2 cell layout and square canvas. ONLY change top-right scissors: shrink scissors to 78% current size and move slightly right so entire blade tip and both handles lie within x=55%..94%, y=14%..40% of full canvas. At least 5% blank margin from central vertical division. No part of scissors may cross x=50%. Preserve lens, bulb, coiled shutter cable and charcoal background unchanged. No text or grid.

## Inventory C

ONE square highest-resolution photographic inventory atlas laid out in exact 2x2 square quadrants on uniform seamless very dark charcoal background. THREE isolated collectible objects and one EMPTY quadrant. No labels, no text, no grid, no furniture/drawers/room/hand. Top left: aged metal circular handwheel exactly FIVE spokes and a central hexagonal shaft hole, matching the wheel inside the lower compartment in reference, photographed removed and front-facing at slight angle; it fills center 65% of quadrant. Top right: ONE thin dark smoky photographic glass dry plate, portrait rectangular 4:5 shape with thin polished edges, isolated and resting slightly tilted, not inside case, fills 65% of quadrant. Bottom left: ONE sheet of blank warm off-white matte photographic printing paper, portrait 4:5 with subtly curled corner, no print/no border/no writing, occupies central65%. Bottom right: completely EMPTY same dark backdrop. Soft warm realistic light, fine scratches and paper texture, high detail. All objects inside their own quadrants with generous empty margins, no overlaps. Real photography not UI icons.

## Retouch room entrance

組み込みimage_genで生成。採用先: public/images/rooms/gallery/states/retouch-entry.webp。展示廊下の既存写真を編集対象、修整室の北向き写真を室内の参照として使用。生成画像の右側だけを同じ座標へ適用し、左の仕掛けを維持。

Precise photorealistic room edit for escape-game navigation. FIRST image is edit target. Preserve entire left 75% exactly: four empty photograph mats, drawer, two small empty frames, wall and floor. Change only RIGHT quarter: the entrance to the retouch workroom must be unmistakably a wide OPEN WALKABLE doorway, framed completely within image at x76%-99%, top near0%, threshold at90%. Remove the obstructing dark half-open door leaf by swinging it fully inward out of the opening. The opening shows an inviting but eerie warmly lit retouch workshop with recognizable green articulated desk lamp, wooden workbench with drawers, and shelving, based on SECOND image as interior reference. Make visible depth and floor continuing through doorway, not a flat reflected picture or cabinet. A warm restrained spill of light crosses the threshold onto gallery floor, doorway jambs readable. No sign, no lettering, no UI, no arrow, no person. Preserve worn dark wood, muted green plaster, photographic lighting and exact camera angle of gallery. Do not turn it into a brightly lit modern room. Square full-room photograph, high resolution, maintain all puzzle objects and positions on left.
