import type { Cell } from "../Cell";
import { WorkerFinderPerson } from "../people";

export interface BuildingWithWorkerFinder {
  workerFinderId: number | null;
  workerFinder: WorkerFinderPerson | null;
  workerFinderFinished(): void;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;
  workerFinderPassedHouse(tickCount: number): void;
  lastWorkerAccessTickCount: number;
  hasWorkerAccess: boolean;
}

export const MaxWorkerAccessTickCount = 50;
