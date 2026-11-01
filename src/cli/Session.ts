import { Editor } from "../application/Editor.js";
import { CommandFactory } from "../commands/CommandFactory.js";
import { Tokenizer } from "./Tokenizer.js";
export class Session {
  constructor(
    private readonly editor = new Editor(),
    private readonly factory = new CommandFactory(),
    private readonly tokenizer = new Tokenizer(),
  ) {}
  run(line: string): string {
    try {
      const [name, ...args] = this.tokenizer.tokenize(line);
      if (!name) return "";
      return this.factory.create(name, this.editor, args).execute();
    } catch (error) {
      return `error: ${error instanceof Error ? error.message : String(error)}`.replace(
        /[\r\n]+/g,
        " ",
      );
    }
  }
}
