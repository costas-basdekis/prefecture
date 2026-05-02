import { immutable } from "~/immutable";
import type { People } from "./People";
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
  "secondaryType" | "sourceBuilding" | "lastVisitedByCell"
> &
  BaseGridPersonOptions;

export type WandererPersonImmutable = Pick<WandererPerson, "secondaryType"> &
  BaseGridPersonImmutable<WandererPerson>;

export class WandererPerson extends BaseGridPerson<
  WandererPersonImmutable,
  "wanderer"
> {
  @immutable
  secondaryType: string;
  @immutable
  sourceBuilding: Building;
  @immutable
  sourceBuildingId: number;
  @immutable
  firstTickCount: number;
  @immutable
  maxDuration: number;
  lastVisitedByCell: Map<Cell, number>;

  onPassedHouse =
    this.eventsManager.add<
      (
        passedHouseCells: Cell[],
        person: WandererPerson,
        tickCount: number,
      ) => void
    >();

  constructor(
    people: People,
    {
      secondaryType,
      sourceBuilding,
      lastVisitedByCell,
      ...rest
    }: WandererOptions,
  ) {
    super(people, "wanderer", 1, rest);
    this.secondaryType = secondaryType;
    this.sourceBuilding = sourceBuilding;
    this.sourceBuildingId = sourceBuilding.id;
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
    const passedHouseCells = Array.from(
      this.cell.getCellsAround(2, 2, false),
    ).filter(HouseUtils.cellHasOccupants);
    if (passedHouseCells.length) {
      this.onPassedHouse.trigger(
        passedHouseCells,
        this,
        this.people.game.tickCount,
      );
    }
  }
}
