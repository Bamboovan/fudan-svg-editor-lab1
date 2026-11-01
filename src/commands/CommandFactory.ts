import { Command } from "./Command.js";
import { Editor } from "../application/Editor.js";
import { SetCommand } from "./SetCommand.js";
import { InitCommand } from "./InitCommand.js";
import { SaveCommand } from "./SaveCommand.js";
import { BackCommand } from "./BackCommand.js";
import { FrontCommand } from "./FrontCommand.js";
import { UngroupCommand } from "./UngroupCommand.js";
import { MoveCommand } from "./MoveCommand.js";
import { CreateCommand } from "./CreateCommand.js";
import { ReadCommand } from "./ReadCommand.js";
import { CanvasCommand } from "./CanvasCommand.js";
import { ScaleCommand } from "./ScaleCommand.js";
import { UndoCommand } from "./UndoCommand.js";
import { AddtoCommand } from "./AddtoCommand.js";
import { HelpCommand } from "./HelpCommand.js";
import { ShowCommand } from "./ShowCommand.js";
import { RedoCommand } from "./RedoCommand.js";
import { TreeCommand } from "./TreeCommand.js";
import { GroupCommand } from "./GroupCommand.js";
import { DeleteCommand } from "./DeleteCommand.js";
export class CommandFactory {
  private readonly registry: Record<
    string,
    new (editor: Editor, args: string[]) => Command
  > = {
    set: SetCommand,
    init: InitCommand,
    save: SaveCommand,
    back: BackCommand,
    front: FrontCommand,
    ungroup: UngroupCommand,
    move: MoveCommand,
    create: CreateCommand,
    read: ReadCommand,
    canvas: CanvasCommand,
    scale: ScaleCommand,
    undo: UndoCommand,
    addto: AddtoCommand,
    help: HelpCommand,
    show: ShowCommand,
    redo: RedoCommand,
    tree: TreeCommand,
    group: GroupCommand,
    delete: DeleteCommand,
  };
  create(name: string, editor: Editor, args: string[]): Command {
    const Type = Object.hasOwn(this.registry, name)
      ? this.registry[name]
      : undefined;
    if (!Type) throw new Error(`unknown command: ${name}`);
    return new Type(editor, args);
  }
}
