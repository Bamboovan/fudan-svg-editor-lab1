import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
test("one named class per source file; dependency edges follow architecture", () => {
  const allowed: Record<string, string[]> = {
    model: ["model"],
    factory: ["factory", "model"],
    io: ["io", "model", "factory"],
    application: ["application", "model", "io"],
    commands: ["commands", "application", "model", "factory"],
    cli: ["cli", "commands", "application"],
  };
  for (const [module, dependencies] of Object.entries(allowed))
    for (const file of readdirSync(`src/${module}`).filter((f) =>
      f.endsWith(".ts"),
    )) {
      const text = readFileSync(`src/${module}/${file}`, "utf8");
      const classes = [...text.matchAll(/export (?:abstract )?class (\w+)/g)];
      assert.equal(classes.length, 1, `${module}/${file}`);
      assert.equal(classes[0][1], file.slice(0, -3));
      for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
        const target = path
          .normalize(path.join(module, match[1]))
          .split(path.sep)[0];
        assert.ok(
          dependencies.includes(target),
          `${module}/${file} -> ${target}`,
        );
      }
      assert.doesNotMatch(text, /switch\s*\(/, file);
    }
});
