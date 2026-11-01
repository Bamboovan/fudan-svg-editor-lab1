import { Command } from "./Command.js";
export class UndoCommand extends Command {
  execute(): string {
    this.arity(0);
    return this.editor.undo();
  }
}
