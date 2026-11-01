import { NumericShape } from "./NumericShape.js";
export class Circle extends NumericShape {
  constructor(id: string, attrs: Record<string, string> = {}) {
    super(id, attrs, ["cx", "cy", "r"], ["cx"], ["cy"], ["r"]);
  }
  get tag(): string {
    return "circle";
  }
  clone(): Circle {
    return new Circle(this.id, this.attrs());
  }
  summary(): string {
    const a = this.attrs();
    return `circle#${this.id} cx=${a.cx} cy=${a.cy} r=${a.r}${this.styleSummary()}`;
  }
}
