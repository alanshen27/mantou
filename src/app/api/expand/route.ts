import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface DependencyResult {
  name: string;
  version: string;
  dev: boolean;
}

export interface ExpandResponse {
  sourcePath: string;
  dependencies: DependencyResult[];
}

interface ExpandRequest {
  sourcePath?: string;
}

// Safely read a package.json strictly inside the project cwd. No traversal,
// no arbitrary files, no network — this is the only filesystem touchpoint
// exposed to diagrams.
export async function POST(request: Request) {
  let body: ExpandRequest;
  try {
    body = (await request.json()) as ExpandRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requested = (body.sourcePath ?? "package.json").trim();

  if (path.basename(requested) !== "package.json") {
    return NextResponse.json(
      { error: "Only package.json files can be read" },
      { status: 400 }
    );
  }
  if (path.isAbsolute(requested)) {
    return NextResponse.json(
      { error: "Absolute paths are not allowed" },
      { status: 400 }
    );
  }

  const cwd = process.cwd();
  const resolved = path.resolve(cwd, requested);
  const relative = path.relative(cwd, resolved);

  // Reject anything that escapes cwd (".." segments / different root).
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json(
      { error: "Path escapes the project directory" },
      { status: 403 }
    );
  }

  let raw: string;
  try {
    raw = await readFile(resolved, "utf8");
  } catch {
    return NextResponse.json(
      { error: `Could not read ${requested}` },
      { status: 404 }
    );
  }

  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    pkg = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "package.json is not valid JSON" },
      { status: 422 }
    );
  }

  const dependencies: DependencyResult[] = [];
  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    dependencies.push({ name, version, dev: false });
  }
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
    dependencies.push({ name, version, dev: true });
  }

  const response: ExpandResponse = { sourcePath: requested, dependencies };
  return NextResponse.json(response);
}
