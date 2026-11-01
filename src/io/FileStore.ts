import { readFileSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { dirname, basename, join } from "node:path";
import { randomUUID } from "node:crypto";

/** Filesystem boundary: a failed save never truncates an existing document. */
export class FileStore {
  read(path: string): string {
    try {
      return readFileSync(path, "utf8");
    } catch {
      throw new Error(`cannot read file: ${path}`);
    }
  }

  write(path: string, contents: string): void {
    const temporary = join(
      dirname(path),
      `.${basename(path)}.${randomUUID()}.tmp`,
    );
    try {
      writeFileSync(temporary, contents, { encoding: "utf8", flag: "wx" });
      renameSync(temporary, path);
    } catch {
      try {
        unlinkSync(temporary);
      } catch {
        /* No temporary file was created, or cleanup already occurred. */
      }
      throw new Error(`cannot write file: ${path}`);
    }
  }
}
