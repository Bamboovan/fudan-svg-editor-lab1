import type { Group } from "./Group.js";

/** Common Component. Styling a group uses native SVG inheritance. */
export abstract class Shape {
  private owner: Group | null = null;
  private readonly identifier: string;
  protected readonly attributes: Record<string, string> = {};
  protected constructor(id: string, attrs: Record<string, string> = {}) {
    if (!id || /\s/.test(id))
      throw new Error("id must be nonempty and contain no whitespace");
    this.identifier = id;
    for (const [key, value] of Object.entries(attrs)) {
      if (key !== "id") this.attributes[key] = value;
    }
  }
  get id(): string {
    return this.identifier;
  }
  abstract get tag(): string;
  get parent(): Group | null {
    return this.owner;
  }
  setParent(parent: Group | null): void {
    this.owner = parent;
  }
  children(): readonly Shape[] {
    return [];
  }
  attrs(): Record<string, string> {
    return { ...this.attributes };
  }
  textContent(): string {
    return "";
  }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  abstract summary(): string;
  set(attr: string, value: string): void {
    if (!["fill", "stroke", "stroke-width"].includes(attr))
      throw new Error(`unknown attribute: ${attr}`);
    if (attr === "stroke-width") Shape.number(value, attr, true);
    this.attributes[attr] = value;
  }
  protected styleSummary(): string {
    return ["fill", "stroke", "stroke-width"]
      .filter((key) => this.attributes[key] !== undefined)
      .map((key) => ` ${key}=${this.attributes[key]}`)
      .join("");
  }
  static number(
    value: string | number,
    label: string,
    nonnegative = false,
  ): number {
    const raw = String(value);
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw))
      throw new Error(`invalid number for ${label}: ${value}`);
    const result = Number(raw);
    if (!Number.isFinite(result) || (nonnegative && result < 0))
      throw new Error(`invalid number for ${label}: ${value}`);
    return result;
  }
  protected static factor(value: number): void {
    if (!Number.isFinite(value) || value <= 0)
      throw new Error("scale factor must be positive");
  }
}
