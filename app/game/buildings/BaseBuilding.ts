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
  BaseBuilding<any, any>,
  "positions" | "topLeftPosition" | "bottomRightPosition" | "width" | "height"
>;

export type BaseBuildingImmutable<B extends BaseBuilding<any, any>> = Pick<
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
  I extends Immutable<BaseBuilding<I, T>>,
  T extends string,
> implements Mutable<I> {
  mutationHelper: MutationHelper<BaseBuilding<I, T>, I>;
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

  isRemoved(): boolean {
    return !this.buildings.byId[this.id];
  }

  postInit() {
    this.mutationHelper = new MutationHelper<BaseBuilding<I, T>, I>(this);
    this.buildings.add(this as any);
  }

  getCellsAround(
    dX: number,
    dY: number,
    includeBuilding: boolean = true,
  ): Iterable<Cell> {
    return this.cells[0].getCellsAround(
      dX,
      dY,
      includeBuilding,
      this.topLeftPosition,
      this.bottomRightPosition,
      this.cells,
    );
  }

  findFirstNeighbouringRoad(): Cell | null {
    return (
      Array.from(this.getCellsAround(1, 1, false)).find(
        (cell) => cell.hasRoad,
      ) ?? null
    );
  }

  getPathFrom(cell: Cell): Cell[] | null {
    const roadCell = this.findFirstNeighbouringRoad();
    if (!roadCell) {
      return null;
    }
    return roadCell.getPathFrom(cell);
  }

  static getClosestBuildingAndPath<
    B extends BaseBuilding<any, any> = BaseBuilding<any, any>,
  >(candidates: B[], start: Cell): [B, Cell[]] | null {
    const reachableStoresAndPaths = candidates
      .map((building) => [building, building.getPathFrom(start)] as const)
      .filter(([, path]) => path) as [B, Cell[]][];
    return (
      reachableStoresAndPaths.sort(
        ([, leftPath], [, rightPath]) => leftPath.length - rightPath.length,
      )[0] ?? null
    );
  }

  tick?(tickCount: number): void;
}
