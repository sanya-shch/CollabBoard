import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LiveMap, LiveObject } from "@liveblocks/client";
import { Camera, Color, Point, Side, Layer, LayerType, PathLayer, XYWH } from "@/types/canvas";

const COLORS = [
  "#e78d92",
  "#6b4c8f",
  "#4b8c5a",
  "#ff3333",
  "#f57f20",
  "#2b6c93",
  "#6e99c2",
  "#b2dfdb",
  "#f7e4b8",
  "#8d2e3b",
  "#a8e8d0",
  "#4caf50",
  "#f9c9c9",
  "#f27b9a",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}

export function pointerEventToCanvasPoint(e: React.PointerEvent, camera: Camera) {
  return {
    x: Math.round((e.clientX - camera.x) / camera.zoom),
    y: Math.round((e.clientY - camera.y) / camera.zoom),
  };
}

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;

// Zooms the camera by `zoomFactor` (>1 zooms in, <1 zooms out) while keeping the
// world point currently under `screenPoint` visually fixed - the standard "zoom to
// cursor" behavior. `screenPoint` is in the same coordinate space as
// PointerEvent.clientX/clientY (the canvas fills the viewport from 0,0).
export function zoomAroundPoint(camera: Camera, screenPoint: Point, zoomFactor: number): Camera {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * zoomFactor));

  // The world point currently under the cursor, before the zoom is applied.
  const worldX = (screenPoint.x - camera.x) / camera.zoom;
  const worldY = (screenPoint.y - camera.y) / camera.zoom;

  return {
    zoom,
    x: screenPoint.x - worldX * zoom,
    y: screenPoint.y - worldY * zoom,
  };
}

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point, lockAspect = false): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  // Aspect-ratio lock only makes sense on a corner handle - a single edge handle only
  // drags one axis, so there's no natural "other" delta to derive a ratio from.
  const isCornerHandle =
    (corner & (Side.Left | Side.Right)) !== 0 && (corner & (Side.Top | Side.Bottom)) !== 0;

  if (lockAspect && isCornerHandle && bounds.width !== 0 && bounds.height !== 0) {
    // Whichever axis the pointer moved further along (relative to its original size)
    // wins, and the other axis is scaled to match - this is what "drag a corner with
    // Shift held" means in most design tools.
    const scale = Math.max(result.width / bounds.width, result.height / bounds.height);
    const width = bounds.width * scale;
    const height = bounds.height * scale;

    result.x = (corner & Side.Left) === Side.Left ? bounds.x + bounds.width - width : bounds.x;
    result.y = (corner & Side.Top) === Side.Top ? bounds.y + bounds.height - height : bounds.y;
    result.width = width;
    result.height = height;
  }

  return result;
}

// storage.get("layers") returns a live LiveMap: its entries are internal, not own
// enumerable properties, so Object.entries(liveLayers) always returns []. Iterate it
// directly and unwrap each LiveObject to a plain Layer with .toJSON().
// True when the event target is a text-input-like element (a plain <input>/<textarea>,
// or a contentEditable div such as the Text/Note layer editors). Keyboard shortcuts
// should not fire while the user is typing into one of these. Duck-typed (not
// `instanceof HTMLElement`) so it also works with plain objects in unit tests.
export function isTypingTarget(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as { tagName?: unknown; isContentEditable?: unknown };
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable === true;
}

export function liveLayersToMap(
  liveLayers: LiveMap<string, LiveObject<Layer>>,
): ReadonlyMap<string, Layer> {
  return new Map(Array.from(liveLayers, ([id, layer]) => [id, layer.toJSON()] as const));
}

export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = [];

  for (const layerId of layerIds) {
    const layer = layers.get(layerId);

    if (layer == null) {
      continue;
    }

    const { x, y, height, width } = layer;

    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId);
    }
  }

  return ids;
}

export function getContrastingTextColor(color: Color) {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return luminance > 182 ? "black" : "white";
}

export function penPointsToPathLayer(points: number[][], color: Color): PathLayer {
  if (points.length < 2) {
    throw new Error("Cannot transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;

    if (left > x) {
      left = x;
    }

    if (top > y) {
      top = y;
    }

    if (right < x) {
      right = x;
    }

    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}
