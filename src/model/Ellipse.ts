import { NumericShape } from "./NumericShape.js";
export class Ellipse extends NumericShape {
  constructor(id: string, attrs: Record<string, string> = {}) {
    super(id, attrs, ["cx", "cy", "rx", "ry"], ["cx"], ["cy"], ["rx", "ry"]);
  }
  get tag(): string {
    return "ellipse";
  }
  clone(): Ellipse {
    return new Ellipse(this.id, this.attrs());
  }
  summary(): string {
    const a = this.attrs();
    return `ellipse#${this.id} cx=${a.cx} cy=${a.cy} rx=${a.rx} ry=${a.ry}${this.styleSummary()}`;
  }
}
