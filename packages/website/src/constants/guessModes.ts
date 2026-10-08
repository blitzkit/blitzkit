import type { ButtonProps } from "@radix-ui/themes";

export interface GuessMode {
  id: string;
  button: ButtonProps["color"];
  image?: string;
}

export const guessModes: Record<string, GuessMode> = {
  silhouette: {
    id: "silhouette",
    button: "cyan",
    image: "guess",
  },
  clues: {
    id: "clues",
    button: "teal",
  },
};
