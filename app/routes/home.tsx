import type { Route } from "./+types/home";
import { Main } from "../Main";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Prefecture" },
    { name: "description", content: "Welcome to Prefecture!" },
  ];
}

export default function Home() {
  return <Main />;
}
