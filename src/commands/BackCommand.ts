import { Command } from "./Command.js";
export class BackCommand extends Command {
  execute(): string {
    this.arity(1);
    return this.editor.edit(() => {
      const s = this.editor.document().find(this.args[0]);
      s.parent!.add(s, 0);
      return `${s.tag}#${s.id} sent to back`;
    });
  }
}
