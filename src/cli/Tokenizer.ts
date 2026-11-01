/** A small quoted argument lexer; # is a comment only at line start. */
export class Tokenizer {
  tokenize(line: string): string[] {
    if (line.trimStart().startsWith("#")) return [];
    const result: string[] = [];
    let token = "",
      quoted = false,
      active = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (
        c === "\\" &&
        quoted &&
        (line[i + 1] === '"' || line[i + 1] === "\\")
      ) {
        token += line[++i];
        active = true;
      } else if (c === '"') {
        quoted = !quoted;
        active = true;
      } else if (/\s/.test(c) && !quoted) {
        if (active) {
          result.push(token);
          token = "";
          active = false;
        }
      } else {
        token += c;
        active = true;
      }
    }
    if (quoted) throw new Error("unterminated quoted argument");
    if (active) result.push(token);
    return result;
  }
}
