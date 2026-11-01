import { Command } from "./Command.js";
export class RedoCommand extends Command {
  execute(): string {
    this.arity(0);
    return this.editor.redo();
  }
}
