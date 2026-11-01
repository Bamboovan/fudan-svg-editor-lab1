import { NumericShape } from "./NumericShape.js";
export class Line extends NumericShape {
  constructor(id: string, attrs: Record<string, string> = {}) {
    super(id, attrs, ["x1", "y1", "x2", "y2"], ["x1", "x2"], ["y1", "y2"], []);
  }
  get tag(): string {
    return "line";
  }
  clone(): Line {
    return new Line(this.id, this.attrs());
  }
  summary(): string {
    const a = this.attrs();
    return `line#${this.id} (${a.x1},${a.y1}) -> (${a.x2},${a.y2})${this.styleSummary()}`;
  }
}
