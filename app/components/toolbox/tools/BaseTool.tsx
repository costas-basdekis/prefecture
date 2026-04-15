import { ReactNode } from "react";
import { Tool, ToolName } from "./Tool";

export abstract class BaseTool {
  abstract name: string;
  abstract label: string;
  abstract renderOptions({
    onChange,
  }: {
    onChange: (tool: Tool) => void;
  }): ReactNode;
}
