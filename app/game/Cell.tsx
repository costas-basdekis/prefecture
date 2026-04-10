import {
  immutable,
  Immutable,
  Mutable,
  mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import { Grid } from "./Grid";
import { WellBuilding } from "./buildings/WellBuilding";

export type CellImmutable = Pick<
  Cell,
  "x" | "y" | "key" | "hasRoad" | "buildingId"
> &
  Immutable<Cell>;

export class Cell implements Mutable<Cell, CellImmutable> {
  mutationHelper: MutationHelper<Cell, CellImmutable>;
  @parentKey("cellMap")
  grid: Grid;
  @immutable
  x: number;
  @immutable
  y: number;
  @immutable
  @parentSecondaryKey
  key: string;
  @mutable("plainValue")
  hasRoad: boolean;
  @mutable("plainValue")
  buildingId: number | null;

  constructor(grid: Grid, { x, y }: Coords) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = false;
    this.buildingId = null;
    this.mutationHelper = new MutationHelper<Cell, CellImmutable>(this);
  }

  addRoad(): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    this.hasRoad = true;
    this.mutationHelper.markDirty("hasRoad");
    return this;
  }

  addBuilding(makeBuilding: () => Building): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    this.buildingId = makeBuilding().id;
    this.mutationHelper.markDirty("buildingId");
    return this;
  }

  addHouse(houseOptions: HouseOptions): Cell {
    return this.addBuilding(
      () => new HouseBuilding(this.grid.game.buildings, houseOptions),
    );
  }

  addWell(options: HouseOptions): Cell {
    return this.addBuilding(
      () => new WellBuilding(this.grid.game.buildings, options),
    );
  }
}
