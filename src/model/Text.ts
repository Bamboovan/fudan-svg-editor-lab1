import { NumericShape } from './NumericShape.js';
export class Text extends NumericShape {
  private content: string;
  constructor(id: string, attrs: Record<string, string> = {}, text = '') {
    super(id, attrs, ['x', 'y'], ['x'], ['y'], []);
    this.content = text;
  }
  get tag(): string { return 'text'; }
  override textContent(): string { return this.content; }
  override set(attr: string, value: string): void {
    if (attr === 'text') { this.content = value; return; }
    super.set(attr, value);
  }
  clone(): Text { return new Text(this.id, this.attrs(), this.content); }
  summary(): string { const a = this.attrs(); return `text#${this.id} (${a.x},${a.y}) ${JSON.stringify(this.content)}${this.styleSummary()}`; }
}
