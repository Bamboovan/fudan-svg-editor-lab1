import { Command } from "./Command.js";
export class ScaleCommand extends Command {
  execute(): string {
    this.arity(2);
    const factor = this.number(this.args[1]);
    if (factor <= 0) throw new Error("scale factor must be positive");
    return this.editor.edit(() => {
      const s = this.editor.document().find(this.args[0]);
      s.scale(factor);
      return `${s.tag}#${s.id} scaled by ${factor}`;
    });
  }
}
