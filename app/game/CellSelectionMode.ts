import _ from "lodash";
import { Coords, makeCoordsKey } from "./Coords";
import { unreachableCase } from "~/utils";

export const cellSelectionModeNames = {
  "line-xy": "Line (X first)",
  "line-yx": "Line (Y first)",
  "line-shortest-xy": "Line shortest first (X first)",
  "line-shortest-yx": "Line shortest first (Y first)",
  "line-clockwise": "Line clockwise",
  "line-counter-clockwise": "Line counter-clockwise (original)",
  square: "Square",
  endpoint: "endpoint",
  endopoints: "Endpoints",
};

export const cellSelectionModes = Object.keys(
  cellSelectionModeNames,
) as CellSelectionMode[];

export const lineCellSelectionModes = cellSelectionModes.filter((mode) =>
  mode.startsWith("line-"),
);

export type CellSelectionMode = keyof typeof cellSelectionModeNames;

export const lineClockwiseMap: Record<number, Record<number, true>> = {
  [-1]: {
    [-1]: true,
  },
  1: {
    1: true,
  },
};

export function selectCells(
  selectionMode: CellSelectionMode,
  startCoords: Coords,
  endCoords: Coords,
): Coords[] {
  const [minX, maxX] = _.sortBy([startCoords.x, endCoords.x]);
  const [minY, maxY] = _.sortBy([startCoords.y, endCoords.y]);
  const xCount = maxX - minX + 1;
  const yCount = maxY - minY + 1;
  switch (selectionMode) {
    case "line-xy":
      return _.uniqBy(
        [
          ..._.range(minX, maxX + 1).map((x) => ({ x, y: startCoords.y })),
          ..._.range(minY, maxY + 1).map((y) => ({ x: endCoords.x, y })),
        ],
        makeCoordsKey,
      );
    case "line-yx":
      return _.uniqBy(
        [
          ..._.range(minY, maxY + 1).map((y) => ({ x: startCoords.x, y })),
          ..._.range(minX, maxX + 1).map((x) => ({ x, y: endCoords.y })),
        ],
        makeCoordsKey,
      );
    case "line-shortest-xy":
      return selectCells(
        xCount <= yCount ? "line-xy" : "line-yx",
        startCoords,
        endCoords,
      );
    case "line-shortest-yx":
      return selectCells(
        yCount <= xCount ? "line-yx" : "line-xy",
        startCoords,
        endCoords,
      );
    case "line-clockwise":
      return selectCells(
        lineClockwiseMap[Math.sign(endCoords.x - startCoords.x)]?.[
          Math.sign(endCoords.y - startCoords.y)
        ]
          ? "line-xy"
          : "line-yx",
        startCoords,
        endCoords,
      );
    case "line-counter-clockwise":
      return selectCells(
        lineClockwiseMap[Math.sign(endCoords.x - startCoords.x)]?.[
          Math.sign(endCoords.y - startCoords.y)
        ]
          ? "line-yx"
          : "line-xy",
        startCoords,
        endCoords,
      );
    case "square":
      return _.range(minX, maxX + 1).flatMap((x) =>
        _.range(minY, maxY + 1).map((y) => ({ x, y })),
      );
    case "endpoint":
      return [endCoords];
    case "endopoints":
      return [startCoords, endCoords];
  }
  throw unreachableCase(
    selectionMode,
    `Uknown selection mode "${selectionMode}"`,
  );
}
