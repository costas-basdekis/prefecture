export interface ToolDefinitions {}

export type Tool = ToolDefinitions[keyof ToolDefinitions];

export type ToolName = Tool["name"];
