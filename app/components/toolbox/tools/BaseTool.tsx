import { ReactNode } from "react";
import { Tool } from "../Tool";

export abstract class BaseTool {
  abstract name: string;
  abstract renderOptions({
    onChange,
  }: {
    onChange: (tool: Tool) => void;
  }): ReactNode;
}
