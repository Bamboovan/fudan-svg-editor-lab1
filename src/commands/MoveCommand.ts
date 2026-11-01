import { Command } from "./Command.js";
export class MoveCommand extends Command {
  execute(): string {
    this.arity(3);
    const dx = this.number(this.args[1]),
      dy = this.number(this.args[2]);
    return this.editor.edit(() => {
      const s = this.editor.document().find(this.args[0]);
      s.move(dx, dy);
      return `${s.tag}#${s.id} moved by (${dx},${dy})`;
    });
  }
}
