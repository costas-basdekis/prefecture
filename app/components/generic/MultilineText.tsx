import "./MultilineText.css";
import { SVGTextElementAttributes, useMemo } from "react";
import { Coords } from "~/game";

export function MultilineText({
  center,
  text,
  textLines: rawTextLines,
  ...props
}: {
  center: Coords;
} & (
  | { text: string | number; textLines?: undefined }
  | { textLines: (string | number)[]; text?: undefined }
) &
  SVGTextElementAttributes<SVGTextElement>) {
  const textLines = useMemo(() => {
    return (rawTextLines ?? text.toString().split("\n")).map((line) =>
      line.toString().trim(),
    );
  }, [text, rawTextLines]);
  const dY = useMemo(() => {
    return `${(-1.2 * (textLines.length - 1)) / 2}em`;
  }, []);
  return (
    <text
      x={center.x}
      y={center.y}
      textAnchor="middle"
      dominantBaseline="middle"
      {...props}
    >
      {textLines.map((line, i) => (
        <tspan x={center.x} dy={i > 0 ? "1.2em" : dY} key={i}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
