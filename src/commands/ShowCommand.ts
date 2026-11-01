import { Command } from "./Command.js";
export class ShowCommand extends Command {
  execute(): string {
    this.arity(1);
    const d = this.editor.document();
    const s = d.find(this.args[0]);
    return `${s.tag}#${s.id}  parent=${s.parent === d.root ? "svg" : `g#${s.parent?.id}`}\n  ${Object.entries(
      s.attrs(),
    )
      .map(([k, v]) => `${k}=${v}`)
      .join(
        " ",
      )}${s.textContent() ? `\n  text=${JSON.stringify(s.textContent())}` : ""}`;
  }
}
