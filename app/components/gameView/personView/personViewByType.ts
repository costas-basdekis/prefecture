import { FC } from "react";
import { PersonImmutable } from "~/game";
import { PersonViewProps } from "./PersonView";

export const personViewByType: Partial<
  Record<PersonImmutable["type"], FC<PersonViewProps<any>>>
> = {};
