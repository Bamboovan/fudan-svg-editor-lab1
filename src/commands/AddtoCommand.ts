import { Command } from "./Command.js";
export class AddtoCommand extends Command {
  execute(): string {
    this.arity(2);
    return this.editor.edit(() => {
      const d = this.editor.document(),
        g = d.container(this.args[0]),
        s = d.find(this.args[1]);
      g.add(s);
      return `${s.tag}#${s.id} moved into g#${g.id}`;
    });
  }
}
