import { Editor } from "../application/Editor.js";
export abstract class Command {
  constructor(
    protected readonly editor: Editor,
    protected readonly args: string[],
  ) {}
  abstract execute(): string;
  protected arity(min: number, max = min): void {
    if (this.args.length < min || this.args.length > max)
      throw new Error("invalid arguments");
  }
  protected number(value: string, positive = false): number {
    if (value.trim() === "" || !Number.isFinite(Number(value)))
      throw new Error(`invalid number: ${value}`);
    const n = Number(value);
    if (positive && n <= 0) throw new Error("value must be positive");
    return n;
  }
}
