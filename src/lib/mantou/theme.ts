import type { MantouTheme, MantouThemeToken } from "./types";

// Mantou's steamed-bun / Chinese-kitchen inspired palette.
export const mantouTheme: MantouTheme = {
  chili: "#e2483d",
  cream: "#fbf4e6",
  scallion: "#6fae4a",
  bamboo: "#c9b06b",
  soy: "#3a2a20",
  danger: "#b5341f",
  border: "#d8c7a6",
  muted: "#a89b82",
};

const THEME_TOKENS: ReadonlySet<string> = new Set<MantouThemeToken>([
  "chili",
  "cream",
  "scallion",
  "bamboo",
  "soy",
  "danger",
  "border",
  "muted",
]);

export function isThemeToken(value: string): value is MantouThemeToken {
  return THEME_TOKENS.has(value);
}

// Resolve a token / raw color string to a concrete CSS color.
export function resolveColor(
  value: unknown,
  theme: MantouTheme = mantouTheme
): string | undefined {
  if (typeof value !== "string") return undefined;
  if (isThemeToken(value)) return theme[value];
  return value;
}
