import { Command } from "./Command.js";
export class CanvasCommand extends Command {
  execute(): string {
    this.arity(0, 2);
    if (this.args.length === 1) throw new Error("invalid arguments");
    return this.args.length
      ? this.editor.canvas(
          this.number(this.args[0], true),
          this.number(this.args[1], true),
        )
      : this.editor.canvas();
  }
}
