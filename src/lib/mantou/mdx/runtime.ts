import * as runtime from "react/jsx-runtime";
import * as devRuntime from "react/jsx-dev-runtime";

/** Matches `mantouMdxCompileOptions.development`. */
export const mantouMdxDevelopment =
  process.env.NODE_ENV === "development";

/** Runtime scope for `run()` — must match how the MDX was compiled. */
export function getMdxRunOptions(baseUrl?: string | URL) {
  if (mantouMdxDevelopment) {
    return {
      Fragment: devRuntime.Fragment,
      jsxDEV: devRuntime.jsxDEV,
      baseUrl: baseUrl ?? import.meta.url,
    };
  }
  return {
    ...runtime,
    baseUrl: baseUrl ?? import.meta.url,
  };
}
