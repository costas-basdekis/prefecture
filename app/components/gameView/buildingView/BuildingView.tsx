import { GameImmutable } from "~/game";
import { BuildingImmutable, HouseBuildingImmutable } from "~/game/buildings";
import { HouseBuildingView } from "./HouseBuildingView";

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
  }
  return null;
}
