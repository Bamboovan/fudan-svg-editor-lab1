import { Command } from "./Command.js";
export class DeleteCommand extends Command {
  execute(): string {
    this.arity(1);
    return this.editor.edit(() => {
      const s = this.editor.document().find(this.args[0]);
      s.parent!.remove(s);
      return `${s.tag}#${s.id} deleted`;
    });
  }
}
