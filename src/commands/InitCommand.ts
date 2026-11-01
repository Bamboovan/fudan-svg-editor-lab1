import { Command } from "./Command.js";
export class InitCommand extends Command {
  execute(): string {
    this.arity(0, 2);
    if (this.args.length === 1) throw new Error("invalid arguments");
    return this.editor.init(
      this.args.length ? this.number(this.args[0], true) : 800,
      this.args.length ? this.number(this.args[1], true) : 600,
    );
  }
}
