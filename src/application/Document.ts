import { Group } from "../model/Group.js";
import { Shape } from "../model/Shape.js";
export class Document {
  constructor(
    private canvasWidth = 800,
    private canvasHeight = 600,
    private readonly treeRoot = new Group("__root__"),
    private readonly metadata: Record<string, string> = {},
  ) {}
  get width(): number {
    return this.canvasWidth;
  }
  get height(): number {
    return this.canvasHeight;
  }
  get root(): Group {
    return this.treeRoot;
  }
  get rootAttributes(): Record<string, string> {
    return { ...this.metadata };
  }
  resize(w: number, h: number): void {
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0)
      throw new Error("canvas dimensions must be positive");
    this.canvasWidth = w;
    this.canvasHeight = h;
    if ("viewBox" in this.metadata) this.metadata.viewBox = `0 0 ${w} ${h}`;
  }
  clone(): Document {
    return new Document(this.width, this.height, this.root.clone() as Group, {
      ...this.rootAttributes,
    });
  }
  all(): Shape[] {
    const result: Shape[] = [];
    const visit = (s: Shape): void => {
      result.push(s);
      s.children().forEach(visit);
    };
    this.root.children().forEach(visit);
    return result;
  }
  find(id: string): Shape {
    const s = this.all().find((s) => s.id === id);
    if (!s) throw new Error(`no such shape: ${id}`);
    return s;
  }
  unique(id: string): void {
    if (!id || /\s/.test(id))
      throw new Error("id must be nonempty and contain no whitespace");
    if (this.rootAttributes.id === id || this.all().some((s) => s.id === id))
      throw new Error(`id already exists: ${id}`);
  }
  container(id: string): Group {
    const s = this.all().find((s) => s.id === id);
    if (!s) throw new Error(`no such container: ${id}`);
    if (!(s instanceof Group)) throw new Error(`not a container: ${id}`);
    return s;
  }
  tree(id?: string): string {
    const lines: string[] = [];
    const visit = (s: Shape, prefix: string, branch: string): void => {
      lines.push(prefix + branch + s.summary());
      const children = s.children();
      children.forEach((child, i) =>
        visit(
          child,
          prefix + (branch ? (branch === "└── " ? "    " : "│   ") : ""),
          i === children.length - 1 ? "└── " : "├── ",
        ),
      );
    };
    if (id) visit(this.find(id), "", "");
    else {
      lines.push(`svg (${this.width}x${this.height})`);
      this.root
        .children()
        .forEach((s, i, a) =>
          visit(s, "", i === a.length - 1 ? "└── " : "├── "),
        );
    }
    return lines.join("\n");
  }
}
