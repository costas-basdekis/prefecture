import { immutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { Buildings } from "./Buildings";

export type FarmBuildingOptions = { crop: "wheat" } & BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<FarmBuilding, "crop"> &
  BaseBuildingImmutable<FarmBuilding>;

export class FarmBuilding extends BaseBuilding<
  FarmBuilding,
  FarmBuildingImmutable,
  "farm"
> {
  @immutable
  crop: "wheat";

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options);
    this.crop = options.crop;
    this.postInit();
  }
}
