import { Shape } from "./Shape.js";

/** Geometry lives behind behavior rather than in a public data bag. */
export abstract class NumericShape extends Shape {
  protected constructor(
    id: string,
    attrs: Record<string, string>,
    private readonly geometry: readonly string[],
    private readonly xCoordinates: readonly string[],
    private readonly yCoordinates: readonly string[],
    private readonly dimensions: readonly string[],
  ) {
    super(id, attrs);
    for (const key of geometry)
      this.attributes[key] = String(
        Shape.number(attrs[key] ?? "0", key, dimensions.includes(key)),
      );
  }
  override set(attr: string, value: string): void {
    if (!this.geometry.includes(attr)) {
      super.set(attr, value);
      return;
    }
    this.attributes[attr] = String(
      Shape.number(value, attr, this.dimensions.includes(attr)),
    );
  }
  move(dx: number, dy: number): void {
    Shape.number(dx, "dx");
    Shape.number(dy, "dy");
    const next = { ...this.attributes };
    for (const key of this.xCoordinates)
      next[key] = String(Shape.number(Number(next[key]) + dx, key));
    for (const key of this.yCoordinates)
      next[key] = String(Shape.number(Number(next[key]) + dy, key));
    Object.assign(this.attributes, next);
  }
  scale(factor: number): void {
    Shape.factor(factor);
    const next = { ...this.attributes };
    for (const key of this.geometry)
      next[key] = String(Shape.number(Number(next[key]) * factor, key));
    Object.assign(this.attributes, next);
  }
}
