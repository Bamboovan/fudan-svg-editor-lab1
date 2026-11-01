import { NumericShape } from "./NumericShape.js";
export class Rect extends NumericShape {
  constructor(id: string, attrs: Record<string, string> = {}) {
    super(
      id,
      attrs,
      ["x", "y", "width", "height"],
      ["x"],
      ["y"],
      ["width", "height"],
    );
  }
  get tag(): string {
    return "rect";
  }
  clone(): Rect {
    return new Rect(this.id, this.attrs());
  }
  summary(): string {
    const a = this.attrs();
    return `rect#${this.id} x=${a.x} y=${a.y} w=${a.width} h=${a.height}${this.styleSummary()}`;
  }
}
