import { immutable } from "~/immutable";
import type { People } from "./People";
import { propById } from "~/utils";
import { HouseUtils, type Building } from "../buildings";
import {
  BaseGridPersonImmutable,
  BaseGridPersonOptions,
  BaseGridPerson,
} from "./BaseGridPerson";
import _ from "lodash";
import { Cell } from "../Cell";

declare module "./Person" {
  interface PersonDefinitions {
    wanderer: WandererPerson;
  }
  interface PersonImmutableDefinitions {
    wanderer: WandererPersonImmutable;
  }
}

export type WandererOptions = Pick<
  WandererPerson,
  "secondaryType" | "sourceBuildingId" | "lastVisitedByCell"
> &
  BaseGridPersonOptions;

export type WandererPersonImmutable = Pick<WandererPerson, "secondaryType"> &
  BaseGridPersonImmutable<WandererPerson>;

export class WandererPerson extends BaseGridPerson<
  WandererPerson,
  WandererPersonImmutable,
  "wanderer"
> {
  @immutable
  secondaryType: string;
  @immutable
  sourceBuildingId: number;
  @propById(
    "sourceBuildingId",
    (id: number, thisObject: WandererPerson) =>
      thisObject.people.game.buildings.byId[id] as Building,
    { allowSetter: false },
  )
  declare sourceBuilding: Building;
  @immutable
  firstTickCount: number;
  @immutable
  maxDuration: number;
  lastVisitedByCell: Map<Cell, number>;

  onPassedHouse = this.eventsManager.add<(tickCount: number) => void>();

  constructor(
    people: People,
    {
      secondaryType,
      sourceBuildingId,
      lastVisitedByCell,
      ...rest
    }: WandererOptions,
  ) {
    super(people, "wanderer", 1, rest);
    this.secondaryType = secondaryType;
    this.sourceBuildingId = sourceBuildingId;
    this.firstTickCount = people.game.tickCount;
    this.maxDuration = 20;
    this.lastVisitedByCell = lastVisitedByCell;
    this.lastVisitedByCell.set(this.cell, this.people.game.tickCount);
    this.postInit();
  }

  tick(tickCount: number) {
    if (tickCount > this.firstTickCount + this.maxDuration) {
      this.remove();
      return;
    }
    const nextCells = Array.from(this.cell.getCellsAround(1, 1, false)).filter(
      (cell) => cell.hasRoad,
    );
    const nextCell = _.minBy(
      nextCells,
      (cell) => this.lastVisitedByCell.get(cell) ?? 0,
    );
    if (!nextCell) {
      return;
    }
    this.cell = nextCell;
    this.lastVisitedByCell.set(nextCell, tickCount);
    if (
      Array.from(this.cell.getCellsAround(2, 2, false)).some(
        HouseUtils.cellHasOccupants,
      )
    ) {
      this.onPassedHouse.trigger(this.people.game.tickCount);
    }
  }
}
