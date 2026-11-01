import { Command } from "./Command.js";
export class HelpCommand extends Command {
  execute(): string {
    this.arity(0);
    return `init [w] [h]
read <file.svg>
save [file.svg]
canvas [w] [h]
create <type> <id> [params...] [in <containerId>]
  rect: x y width height [fill]
  circle: cx cy r [fill]
  ellipse: cx cy rx ry [fill]
  line: x1 y1 x2 y2 [stroke]
  text: x y "content"
  g: (no parameters)
delete <id>
move <id> <dx> <dy>
scale <id> <factor>
set <id> <attr> <value>
group <newGid> <id1> <id2>...
ungroup <gid>
addto <gid> <id>
front <id>
back <id>
tree [id]
show <id>
help
undo
redo`;
  }
}
