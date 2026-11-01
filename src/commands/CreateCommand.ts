import { Command } from "./Command.js";
import { ShapeFactory } from "../factory/ShapeFactory.js";
export class CreateCommand extends Command {
  execute(): string {
    this.arity(2, 100);
    return this.editor.edit(() => {
      const d = this.editor.document();
      const [type, id, ...params] = this.args;
      d.unique(id);
      let parent = d.root;
      if (params.length >= 2 && params.at(-2) === "in") {
        const target = params.pop()!;
        params.pop();
        parent = d.container(target);
      }
      const shape = new ShapeFactory().create(type, id, params);
      parent.add(shape);
      return `${shape.tag}#${id} created${parent === d.root ? "" : ` in g#${parent.id}`}`;
    });
  }
}
