import { JSX } from "react";
import { Tool } from "./components/toolbox";

export abstract class BaseTool {
  abstract name: string;
  abstract renderOptions({
    onChange,
  }: {
    onChange: (tool: Tool) => void;
  }): JSX.Element;
}
