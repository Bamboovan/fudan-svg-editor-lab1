import { Command } from "./Command.js";
export class UngroupCommand extends Command {
  execute(): string {
    this.arity(1);
    return this.editor.edit(() => {
      const d = this.editor.document(),
        g = d.container(this.args[0]),
        parent = g.parent!;
      if (parent === d.root)
        throw new Error(`cannot ungroup top-level container: ${g.id}`);
      let index = parent.indexOf(g);
      parent.remove(g);
      for (const s of g.children()) parent.add(s, index++);
      return `g#${g.id} ungrouped`;
    });
  }
}
