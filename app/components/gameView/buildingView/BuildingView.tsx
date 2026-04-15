import "./BuildingView.css";
import { GameImmutable } from "~/game";
import { BuildingImmutable } from "~/game/buildings";
import { buildingViewByType } from "./buildingViewByType";

export type BuildingViewProps<B extends BuildingImmutable> = {
  building: B;
  game: GameImmutable;
};

export function BuildingView(props: BuildingViewProps<BuildingImmutable>) {
  const BuildingViewForType = buildingViewByType[props.building.type];
  if (!BuildingViewForType) {
    return null;
  }
  return <BuildingViewForType {...props} />;
}
