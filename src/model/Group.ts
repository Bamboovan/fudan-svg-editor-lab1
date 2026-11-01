import { Shape } from "./Shape.js";

/** Composite: nested groups delegate geometric operations recursively. */
export class Group extends Shape {
  private readonly items: Shape[] = [];
  constructor(id: string, attrs: Record<string, string> = {}) {
    super(id, attrs);
  }
  get tag(): string {
    return "g";
  }
  override children(): readonly Shape[] {
    return [...this.items];
  }
  indexOf(child: Shape): number {
    return this.items.indexOf(child);
  }
  add(child: Shape, index = this.items.length): void {
    for (
      let ancestor: Shape | null = this;
      ancestor;
      ancestor = ancestor.parent
    ) {
      if (ancestor === child)
        throw new Error(
          `cannot group a container into its own descendant: ${child.id}`,
        );
    }
    if (!Number.isInteger(index) || index < 0 || index > this.items.length)
      throw new Error("invalid child index");
    child.parent?.remove(child);
    this.items.splice(Math.min(index, this.items.length), 0, child);
    child.setParent(this);
  }
  remove(child: Shape): void {
    const index = this.indexOf(child);
    if (index < 0) throw new Error(`no such child: ${child.id}`);
    this.items.splice(index, 1);
    child.setParent(null);
  }
  move(dx: number, dy: number): void {
    Shape.number(dx, "dx");
    Shape.number(dy, "dy");
    // Validate the whole subtree before applying, including arithmetic overflow.
    for (const child of this.items) child.clone().move(dx, dy);
    for (const child of this.items) child.move(dx, dy);
  }
  scale(factor: number): void {
    Shape.factor(factor);
    for (const child of this.items) child.clone().scale(factor);
    for (const child of this.items) child.scale(factor);
  }
  clone(): Group {
    const copy = new Group(this.id, this.attrs());
    for (const child of this.items) copy.add(child.clone());
    return copy;
  }
  summary(): string {
    return `g#${this.id}${this.styleSummary()}`;
  }
}
