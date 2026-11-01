import { Command } from "./Command.js";
export class SaveCommand extends Command {
  execute(): string {
    this.arity(0, 1);
    return this.editor.save(this.args[0]);
  }
}
