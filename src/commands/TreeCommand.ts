import { Command } from "./Command.js";
export class TreeCommand extends Command {
  execute(): string {
    this.arity(0, 1);
    return this.editor.document().tree(this.args[0]);
  }
}
