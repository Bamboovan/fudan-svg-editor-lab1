import { Command } from "./Command.js";
export class ReadCommand extends Command {
  execute(): string {
    this.arity(1);
    return this.editor.read(this.args[0]);
  }
}
