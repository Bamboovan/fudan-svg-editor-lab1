import { Command } from "./Command.js";
import { Group } from "../model/Group.js";
export class GroupCommand extends Command {
  execute(): string {
    this.arity(2, 10000);
    return this.editor.edit(() => {
      const d = this.editor.document(),
        [id, ...ids] = this.args;
      d.unique(id);
      if (new Set(ids).size !== ids.length)
        throw new Error("duplicate group member");
      const selected = ids.map((id) => d.find(id));
      for (const s of selected) {
        for (let p = s.parent; p && p !== d.root; p = p.parent) {
          if (selected.includes(p))
            throw new Error(
              `cannot group a container into its own descendant: ${p.id}`,
            );
        }
      }
      // Preserve document order, not arbitrary argument order. Same-parent groups replace the first member; mixed-parent groups append at root.
      const ordered = d.all().filter((s) => selected.includes(s));
      const first = ordered[0];
      const sameParent = ordered.every((s) => s.parent === first.parent);
      const parent = sameParent ? first.parent! : d.root;
      const index = sameParent
        ? parent.indexOf(first)
        : parent.children().length;
      const g = new Group(id);
      for (const s of ordered) g.add(s);
      parent.add(g, Math.min(index, parent.children().length));
      return `g#${id} created with ${ordered.length} children`;
    });
  }
}
