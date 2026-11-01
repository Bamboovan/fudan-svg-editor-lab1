import { Command } from "./Command.js";
export class SetCommand extends Command {
  execute(): string {
    this.arity(3);
    return this.editor.edit(() => {
      const s = this.editor.document().find(this.args[0]);
      s.set(this.args[1], this.args[2]);
      return `${s.tag}#${s.id} updated: ${this.args[1]}=${JSON.stringify(this.args[2])}`;
    });
  }
}
