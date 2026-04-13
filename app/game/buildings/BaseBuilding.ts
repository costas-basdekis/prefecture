import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import type { Buildings } from "./Buildings";
import { makeCoordsKey, type Coords } from "../Coords";
import type { Cell } from "../Cell";
import _ from "lodash";

export type BaseBuildingOptions = Pick<
  BaseBuilding<any, any, any>,
  "positions" | "topLeftPosition" | "bottomRightPosition" | "width" | "height"
>;

export type BaseBuildingImmutable<B extends BaseBuilding<any, any, any>> = Pick<
  B,
  | "id"
  | "type"
  | "positions"
  | "topLeftPosition"
  | "bottomRightPosition"
  | "width"
  | "height"
> &
  Immutable<B>;

export abstract class BaseBuilding<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  T extends string,
> implements Mutable<M, I> {
  mutationHelper: MutationHelper<M, I>;
  @parentKey("byId")
  buildings: Buildings;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: T;
  @immutable
  positions: Coords[];
  @immutable
  cells: Cell[];
  @immutable
  topLeftPosition: Coords;
  @immutable
  bottomRightPosition: Coords;
  @immutable
  width: number;
  @immutable
  height: number;

  constructor(
    buildings: Buildings,
    type: T,
    {
      positions,
      topLeftPosition,
      bottomRightPosition,
      width,
      height,
    }: BaseBuildingOptions,
  ) {
    this.buildings = buildings;
    this.id = this.buildings.createId();
    this.type = type;
    this.positions = positions;
    this.cells = this.positions.map(
      (position) => this.buildings.game.grid.cellMap[makeCoordsKey(position)],
    );
    this.topLeftPosition = topLeftPosition;
    this.bottomRightPosition = bottomRightPosition;
    this.width = width;
    this.height = height;
    this.mutationHelper = null!;
  }

  postInit() {
    this.mutationHelper = new MutationHelper<M, I>(this as unknown as M);
    this.buildings.add(this as any);
  }

  *getCellsAround(
    dX: number,
    dY: number,
    includeBuilding: boolean = true,
  ): Iterable<Cell> {
    const seenCells = includeBuilding ? null : new Set(this.cells);
    for (const x of _.range(
      this.topLeftPosition.x - dX,
      this.bottomRightPosition.x + dX,
    )) {
      for (const y of _.range(
        this.topLeftPosition.y - dY,
        this.bottomRightPosition.y + dY,
      )) {
        const cell = this.buildings.game.grid.cellMap[makeCoordsKey({ x, y })];
        if (!cell) {
          continue;
        }
        if (seenCells && seenCells.has(cell)) {
          continue;
        }
        yield cell;
        if (seenCells) {
          seenCells.add(cell);
        }
      }
    }
  }

  waterCoverageUpdated?(cell: Cell): void;

  tick?(): void;
}
