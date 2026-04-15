import { FC } from "react";
import { BuildingImmutable } from "~/game";
import { BuildingViewProps } from "./BuildingView";

export const buildingViewByType: Partial<
  Record<BuildingImmutable["type"], FC<BuildingViewProps<any>>>
> = {};
