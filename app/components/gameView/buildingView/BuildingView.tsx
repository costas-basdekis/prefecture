import "./BuildingView.css";
import { GameImmutable } from "~/game";
import {
  BuildingImmutable,
  FarmBuildingImmutable,
  HouseBuildingImmutable,
} from "~/game/buildings";
import { HouseBuildingView } from "./HouseBuildingView";
import { FarmBuildingView } from "./FarmBuildingView";

export type BuildingViewProps<B extends BuildingImmutable> = {
  building: B;
  game: GameImmutable;
};

export function BuildingView(props: BuildingViewProps<BuildingImmutable>) {
  const { building } = props;
  switch (building.type) {
    case "house":
      return (
        <HouseBuildingView
          {...(props as BuildingViewProps<HouseBuildingImmutable>)}
        />
      );
    case "farm":
      return (
        <FarmBuildingView
          {...(props as BuildingViewProps<FarmBuildingImmutable>)}
        />
      );
  }
  return null;
}
